"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdUnit } from "@/components/AdSense";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!url || !email || !targetPrice) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url,
          email,
          targetPrice: Number(targetPrice)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess("You’re now tracking this product! Check your email for alerts.");
      setUrl("");
      setTargetPrice("");
      // prompt signup / login
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-extrabold uppercase tracking-tight text-charcoal sm:text-5xl">
          Never miss a <span className="text-brand">price drop</span> again.
        </h1>
        <p className="mx-auto max-w-lg text-base font-medium leading-relaxed text-charcoal/80">
          Paste a product URL, set your target price, and we&apos;ll email you
          when it drops. No account needed for your first tracked product.
        </p>
      </div>
      <div className="rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-charcoal">
              Product URL
            </label>
            <input
              type="url"
              placeholder="https://www.amazon.com/..."
              className="w-full rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-charcoal">
                Your email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-charcoal">
                Target price
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 49.99"
                className="w-full rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center border-2 border-charcoal bg-brand px-6 py-3 text-base font-bold uppercase tracking-wider text-white shadow-retro transition-all hover:bg-brand-dark active:translate-x-1 active:translate-y-1 active:shadow-none disabled:bg-gray-400 sm:w-auto"
            disabled={loading}
          >
            {loading ? "Starting..." : "Start tracking"}
          </button>
          {error && (
            <p className="mt-4 font-bold text-charcoal bg-rose-200 px-4 py-2 border-2 border-charcoal">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 font-bold text-charcoal bg-emerald-200 px-4 py-2 border-2 border-charcoal">
              {success}
            </p>
          )}
          <p className="mt-4 text-sm font-bold text-charcoal/60">
            Supported: Amazon, ASOS, Zara. We&apos;ll email you a link to create
            an account and see your dashboard.
          </p>
        </form>
      </div>

      <div className="mt-12">
        <AdUnit 
          slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT ?? ""} 
          className="rounded-xl border-2 border-charcoal bg-white p-4 shadow-retro"
        />
      </div>
    </section>
  );
}
