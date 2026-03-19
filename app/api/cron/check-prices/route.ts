import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeProduct, ScrapeError } from "@/lib/scrapers";
import { sendPriceAlertEmail, sendTrackingPausedEmail } from "@/lib/email/send";
import { convertCurrency } from "@/lib/utils/currency";

function requireCronAuth(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got = req.headers.get("x-cron-secret");
  return got === expected;
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service credentials.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  if (!requireCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  const { data: trackers, error: tErr } = await supabase
    .from("trackers")
    .select(
      `
      id,
      email,
      target_price,
      preferred_currency,
      active,
      consecutive_failures,
      product:products (
        id,
        url,
        name,
        image_url,
        currency,
        last_price
      )
    `
    )
    .eq("active", true);

  if (tErr) {
    return NextResponse.json({ error: "Failed to load trackers." }, { status: 500 });
  }

  const rows = ((trackers as any[]) ?? [])
    .map((t) => ({
      ...t,
      product: Array.isArray(t.product) ? t.product[0] : t.product,
    }))
    .filter((t) => t.product?.id && t.product?.url);

  // group trackers by product_id to scrape each product once
  const byProduct = new Map<
    string,
    {
      product: any;
      trackers: any[];
    }
  >();

  for (const tr of rows) {
    const pid = tr.product.id as string;
    const entry = byProduct.get(pid) ?? { product: tr.product, trackers: [] };
    entry.trackers.push(tr);
    byProduct.set(pid, entry);
  }

  const summary = {
    productsChecked: 0,
    pricePointsInserted: 0,
    alertsSent: 0,
    paused: 0,
    scrapeFailures: 0
  };

  for (const [productId, entry] of byProduct) {
    summary.productsChecked += 1;
    const productUrl = entry.product.url as string;

    let scraped:
      | { price: number; currency: string | null; name: string; imageUrl: string | null }
      | null = null;

    try {
      const s = await scrapeProduct(productUrl);
      scraped = {
        price: s.price,
        currency: s.currency,
        name: s.name,
        imageUrl: s.imageUrl
      };
    } catch (e) {
      summary.scrapeFailures += 1;

      const nextFailures = Math.min(
        999,
        Math.max(0, (entry.trackers[0]?.consecutive_failures ?? 0) + 1)
      );

      await supabase
        .from("trackers")
        .update({ consecutive_failures: nextFailures })
        .in(
          "id",
          entry.trackers.map((t) => t.id)
        );

      if (nextFailures >= 3) {
        summary.paused += entry.trackers.length;

        await supabase
          .from("trackers")
          .update({ active: false, paused_reason: "scrape_failed_3_times" })
          .in(
            "id",
            entry.trackers.map((t) => t.id)
          );

        // best-effort pause emails
        await Promise.allSettled(
          entry.trackers.map((t) =>
            sendTrackingPausedEmail({
              to: t.email,
              productName: entry.product.name ?? "Tracked product",
              productUrl: productUrl,
              productImageUrl: entry.product.image_url ?? null
            })
          )
        );
      }

      continue;
    }

    if (!scraped) continue;

    // update product + insert price point
    await supabase
      .from("products")
      .update({
        name: scraped.name,
        image_url: scraped.imageUrl,
        currency: scraped.currency,
        last_price: scraped.price,
        last_checked_at: new Date().toISOString()
      })
      .eq("id", productId);

    const { error: ppErr } = await supabase.from("price_points").insert({
      product_id: productId,
      price: scraped.price
    });
    if (!ppErr) summary.pricePointsInserted += 1;

    // reset failures for trackers on this product
    await supabase
      .from("trackers")
      .update({ consecutive_failures: 0 })
      .in(
        "id",
        entry.trackers.map((t) => t.id)
      );

    // alerts
    const eligible = entry.trackers.filter(
      (t) => Number(t.target_price) >= scraped!.price && t.active
    );

    if (eligible.length > 0) {
      const results = await Promise.allSettled(
        eligible.map(async (t) => {
          // Convert scraped price to the user's preferred currency for the email
          const displayCurrency = t.preferred_currency || scraped!.currency || "USD";
          const displayPrice = await convertCurrency(
            scraped!.price,
            scraped!.currency ?? displayCurrency,
            displayCurrency
          );

          await sendPriceAlertEmail({
            to: t.email,
            productName: scraped!.name,
            productUrl: productUrl,
            productImageUrl: scraped!.imageUrl,
            currency: displayCurrency,
            currentPrice: displayPrice,
            targetPrice: Number(t.target_price)
          });
          
          // Disable the tracker so we don't spam them on future cron runs!
          await supabase
            .from("trackers")
            .update({ active: false, paused_reason: "target_reached" })
            .eq("id", t.id);
        })
      );
      summary.alertsSent += results.filter((r) => r.status === "fulfilled").length;
    }
  }

  return NextResponse.json({ ok: true, summary });
}

