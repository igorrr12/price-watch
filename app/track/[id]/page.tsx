import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { PriceLineChart } from "@/components/PriceLineChart";
import { AdUnit } from "@/components/AdSense";
import { formatPrice } from "@/lib/utils/format";
import { ConvertedPrice } from "@/components/ConvertedPrice";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;
  const { data } = await supabase.from("products").select("name, domain").eq("id", id).maybeSingle();
  
  const name = data?.name ?? "Price History";
  return {
    title: `${name} Price History & Tracker`,
    description: `Track the price history of ${name} on ${data?.domain}. Get instant alerts when the price drops below your target.`,
    openGraph: {
      title: `${name} Price History`,
      description: `Monitor price changes for ${name}.`,
    }
  };
}

type PricePoint = { created_at: string; price: number };

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, url, domain, retailer, name, image_url, currency, last_price, last_checked_at")
    .eq("id", id)
    .single();

  if (pErr) {
    return (
      <div className="rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro">
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-charcoal">Not found</h2>
        <p className="mt-2 text-sm font-medium text-charcoal/80">
          This product doesn't exist.
        </p>
        <Link href="/dashboard" className="mt-6 inline-flex text-sm font-bold uppercase text-brand hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { data: points } = await supabase
    .from("price_points")
    .select("created_at, price")
    .eq("product_id", id)
    .order("created_at", { ascending: true })
    .limit(120);

  // Fetch the user's tracker to show their target price and preferred currency
  const { data: { user } } = await supabase.auth.getUser();
  let tracker: { target_price: number; preferred_currency: string | null } | null = null;
  if (user) {
    const { data: t } = await supabase
      .from("trackers")
      .select("target_price, preferred_currency")
      .eq("product_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    tracker = t;
  }

  const displayCurrency = tracker?.preferred_currency ?? product.currency;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url,
    "description": `Price tracking and alerts for ${product.name} on ${product.domain}.`,
    "offers": {
      "@type": "Offer",
      "price": product.last_price,
      "priceCurrency": product.currency,
      "url": product.url,
      "availability": "https://schema.org/InStock" // Best effort, most tracked items are in stock
    }
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-charcoal">
            {product.name ?? "Tracked product"}
          </h1>
          <div className="mt-3 flex flex-wrap gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-charcoal/60">Current Price</div>
              <ConvertedPrice
                amount={product.last_price}
                fromCurrency={product.currency}
                toCurrency={displayCurrency}
                className="text-2xl font-extrabold text-charcoal"
              />
            </div>
            {tracker && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-charcoal/60">Your Target ({displayCurrency})</div>
                <ConvertedPrice
                  amount={tracker.target_price}
                  fromCurrency={product.currency}
                  toCurrency={displayCurrency}
                  className="text-2xl font-extrabold text-brand"
                />
              </div>
            )}
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center border-2 border-charcoal bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-charcoal shadow-retro-sm transition-all hover:bg-cream active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Back
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div className="rounded-xl border-2 border-charcoal bg-white p-6 shadow-retro">
            <PriceLineChart points={(points ?? []) as unknown as PricePoint[]} currency={product.currency} />
          </div>
        </div>

        <aside className="h-max rounded-xl border-2 border-charcoal bg-white p-6 shadow-retro">
          <div className="text-xl font-extrabold uppercase tracking-tight text-charcoal">Product</div>
          <div className="mt-4 space-y-4 text-sm text-charcoal">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-charcoal/60">Scraped Currency</div>
              <div className="text-base font-medium">{product.currency ?? "—"}</div>
            </div>
            {tracker?.preferred_currency && tracker.preferred_currency !== product.currency && (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-charcoal/60">Display Currency</div>
                <div className="text-base font-medium">{tracker.preferred_currency}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-charcoal/60">Retailer</div>
              <div className="text-base font-medium">{product.retailer}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-charcoal/60">Domain</div>
              <div className="text-base font-medium">{product.domain}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-charcoal/60">Last checked</div>
              <div className="text-sm font-medium">
                {product.last_checked_at ? new Date(product.last_checked_at).toLocaleString() : "—"}
              </div>
            </div>
          </div>
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center border-2 border-charcoal bg-brand px-6 py-3 text-base font-bold uppercase tracking-wider text-white shadow-retro transition-all hover:bg-brand-dark active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Buy now
          </a>
        </aside>
      </div>
    </section>
  );
}
