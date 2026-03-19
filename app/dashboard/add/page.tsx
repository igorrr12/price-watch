"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { COMMON_CURRENCIES } from "@/lib/utils/currencies";

export default function DashboardAddPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!url || !targetPrice) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.email) {
        setError("You must be logged in to do this.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url,
          email: user.email,
          targetPrice: Number(targetPrice),
          preferredCurrency: currency,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-charcoal">
            Track a new product
          </h1>
          <p className="mt-2 text-sm font-medium text-charcoal/80">
            Paste a link to be notified when the price drops below your target.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center border-2 border-charcoal bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-charcoal shadow-retro-sm transition-all hover:bg-cream active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Cancel
        </Link>
      </div>

      <div className="rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-charcoal">
              Product URL
            </label>
            <input
              type="url"
              required
              placeholder="https://www.amazon.com/..."
              className="w-full rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-charcoal">
                Target price
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 49.99"
                className="w-full rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="w-48">
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-charcoal">
                Currency
              </label>
              <select
                className="w-full rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading}
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs font-medium text-charcoal/60">
            If the product is priced in a different currency, your target and the scraped price will be converted automatically.
          </p>
          
          {error && <p className="border-2 border-charcoal bg-rose-200 px-4 py-2 font-bold text-charcoal">{error}</p>}
          
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center border-2 border-charcoal bg-brand px-6 py-3 text-base font-bold uppercase tracking-wider text-white shadow-retro transition-all hover:bg-brand-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Adding..." : "Start tracking"}
          </button>
        </form>
      </div>
    </section>
  );
}
