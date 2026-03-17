import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeUrl, detectRetailer, getHostname } from "@/lib/utils/url";
import { scrapeProduct, ScrapeError } from "@/lib/scrapers";

type TrackRequest = {
  url: string;
  email: string;
  targetPrice: number;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export async function POST(req: Request) {
  let body: TrackRequest;
  try {
    body = (await req.json()) as TrackRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const url = (body.url ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const targetPrice = Number(body.targetPrice);

  if (!url || !url.startsWith("http")) {
    return NextResponse.json({ error: "Please provide a valid URL." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
  }
  if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
    return NextResponse.json({ error: "Please provide a valid target price." }, { status: 400 });
  }

  const retailer = detectRetailer(url);
  if (!retailer) {
    return NextResponse.json(
      { error: "Retailer not yet supported. Supported: Amazon, ASOS, Zara." },
      { status: 400 }
    );
  }

  const normalized = normalizeUrl(url);
  const domain = getHostname(url);

  let scraped;
  try {
    scraped = await scrapeProduct(url);
  } catch (e) {
    const err = e as unknown;
    if (err instanceof ScrapeError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 400 });
    }
    return NextResponse.json({ error: "Scrape failed." }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server is misconfigured." }, { status: 500 });
  }
  // Use service role server-side to avoid RLS blocking inserts.
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  // 1) Upsert product by normalized_url
  const { data: existingProduct, error: findErr } = await supabase
    .from("products")
    .select("id")
    .eq("normalized_url", normalized)
    .maybeSingle();
  if (findErr) {
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }

  const productUpsert = {
    id: existingProduct?.id,
    url,
    normalized_url: normalized,
    domain,
    retailer,
    name: scraped.name,
    image_url: scraped.imageUrl,
    currency: scraped.currency,
    last_price: scraped.price,
    last_checked_at: new Date().toISOString()
  };

  const { data: product, error: productErr } = await supabase
    .from("products")
    .upsert(productUpsert, { onConflict: "normalized_url" })
    .select("id, name, image_url, last_price, currency")
    .single();

  if (productErr) {
    return NextResponse.json({ error: "Failed to save product." }, { status: 500 });
  }

  // Try to get user session to link the tracker
  const serverSupabase = await createSupabaseServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  if (user) {
    // Ensure the public.profile exists so we don't hit foreign key constraints.
    // We use the service role key to bypass RLS for profile creation.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        auth: { persistSession: false },
      });
      await supabaseAdmin.from("profiles").upsert({ id: user.id }, { onConflict: "id" }).select().single();
    }
  }

  // 3) Create tracker
  const { data: tracker, error: trackerErr } = await supabase
    .from("trackers")
    .insert({
      product_id: product.id,
      user_id: user?.id ?? null,
      email,
      target_price: targetPrice,
      active: true,
      consecutive_failures: 0
    })
    .select("id, product_id, email, target_price, active")
    .single();
  if (trackerErr) {
    console.error("TRACKER INSERT ERROR: ", trackerErr);
    if (trackerErr.code === "23505") {
      return NextResponse.json(
        { error: "You are already tracking this product at this target price." },
        { status: 400 }
      );
    }
    
    // Common causes: RLS (if not using service role), duplicate unique index, invalid FK.
    return NextResponse.json(
      {
        error: "Failed to create tracker.",
        details: trackerErr.message,
        code: (trackerErr as any).code
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    tracker,
    product
  });
}

