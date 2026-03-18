import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { AdUnit } from "@/components/AdSense";
import { linkAnonymousTrackersToUser } from "@/lib/linkTrackers";
import { deleteTracker, renewTracker } from "./actions";
import { formatPrice } from "@/lib/utils/format";
import { ConvertedPrice } from "@/components/ConvertedPrice";

type TrackerRow = {
  id: string;
  email: string;
  target_price: number;
  active: boolean;
  consecutive_failures: number;
  paused_reason: string | null;
  preferred_currency: string | null;
  created_at: string;
  product: {
    id: string;
    name: string | null;
    image_url: string | null;
    url: string;
    domain: string;
    retailer: string;
    currency: string | null;
    last_price: number | null;
  };
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro">
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-charcoal">Login required</h2>
        <p className="mt-2 font-medium text-charcoal/80">
          Please log in to view your dashboard.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center border-2 border-charcoal bg-brand px-6 py-3 font-bold uppercase tracking-wider text-white shadow-retro transition-all hover:bg-brand-dark active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Go to login
        </Link>
      </div>
    );
  }

  // Auto-link email-only trackers for this account
  await linkAnonymousTrackersToUser({
    userId: user.id,
    email: user.email
  });

  const { data, error } = await supabase
    .from("trackers")
    .select(
      `
      id,
      email,
      target_price,
      active,
      consecutive_failures,
      paused_reason,
      preferred_currency,
      created_at,
      product:products (
        id,
        name,
        image_url,
        url,
        domain,
        retailer,
        currency,
        last_price
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const trackers = (data ?? []) as unknown as TrackerRow[];

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-charcoal">Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-charcoal/80">
            Your tracked products and current status.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/add"
            className="inline-flex rounded-sm border-2 border-charcoal bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-charcoal shadow-retro-sm transition-all hover:bg-cream active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Track another
          </Link>
        </div>
      </div>

      {error ? (
        <div className="border-2 border-charcoal bg-rose-200 p-6 font-medium text-charcoal shadow-retro">
          Failed to load dashboard.
        </div>
      ) : trackers.length === 0 ? (
        <div className="rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro">
          <div className="font-medium text-charcoal/80">
            No tracked products yet.
          </div>
          <Link
            href="/dashboard/add"
            className="mt-6 inline-flex items-center justify-center border-2 border-charcoal bg-brand px-6 py-3 font-bold uppercase tracking-wider text-white shadow-retro transition-all hover:bg-brand-dark active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Track your first product
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_DASHBOARD_SLOT ?? ""} className="rounded-xl border-2 border-charcoal bg-white p-4 shadow-retro" />
          {trackers.map((t) => {
            // preferred_currency is what the user wants to see; product.currency is the scraped native currency
            const displayCurrency = t.preferred_currency ?? t.product.currency;

            let status = "Above target";
            if (t.product.last_price != null && Number(t.target_price) >= Number(t.product.last_price)) {
              status = "At/below target";
            }
            if (!t.active) {
              // Green "Alert sent!" if the price is still at/below target or we sent an email
              const priceStillLow = t.product.last_price != null && Number(t.target_price) >= Number(t.product.last_price);
              status = (t.paused_reason === "target_reached" || priceStillLow) ? "Alert sent!" : "Paused";
            }

            const statusClass =
              status === "At/below target"
                ? "bg-emerald-300 text-charcoal"
                : status === "Alert sent!"
                ? "bg-emerald-400 text-white"
                : status === "Paused"
                ? "bg-amber-300 text-charcoal"
                : "bg-cream text-charcoal";

            return (
              <div
                key={t.id}
                className="flex flex-col gap-6 rounded-xl border-2 border-charcoal bg-white p-6 shadow-retro transition-all sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 shrink-0 overflow-hidden border-2 border-charcoal bg-white p-2">
                    {t.product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.product.image_url}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <Link href={`/track/${t.product.id}`} className="group block">
                      <h3 className="text-xl font-extrabold uppercase tracking-tight text-charcoal transition-colors group-hover:text-brand line-clamp-2">
                        {t.product.name ?? "Tracked product"}
                      </h3>
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm font-medium text-charcoal/70">
                      <span>{t.product.domain}</span>
                      <span>
                        Now:{" "}
                        <ConvertedPrice
                          amount={t.product.last_price}
                          fromCurrency={t.product.currency}
                          toCurrency={displayCurrency}
                          className="font-bold text-charcoal"
                        />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-3 sm:gap-4">
                  <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-0">
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium uppercase tracking-widest text-charcoal/60">Target ({displayCurrency})</div>
                      <ConvertedPrice
                        amount={t.target_price}
                        fromCurrency={t.product.currency}
                        toCurrency={displayCurrency}
                        className="text-xl font-extrabold text-charcoal"
                      />
                    </div>
                    <span className={`inline-flex rounded-sm border-2 border-charcoal px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-retro-sm ${statusClass}`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <form action={deleteTracker.bind(null, t.id)}>
                      <button type="submit" className="border-2 border-charcoal bg-charcoal px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_#e83e8c] transition-all hover:bg-charcoal/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                        Delete
                      </button>
                    </form>
                    {!t.active && (
                      <form action={renewTracker.bind(null, t.id)}>
                        <button type="submit" className="border-2 border-charcoal bg-charcoal px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_#e83e8c] transition-all hover:bg-charcoal/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                          Renew
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/track/${t.product.id}`}
                      className="border-2 border-charcoal bg-charcoal px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_#e83e8c] transition-all hover:bg-charcoal/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
