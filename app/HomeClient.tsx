"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdUnit } from "@/components/AdSense";
import { COMMON_CURRENCIES } from "@/lib/utils/currencies";

export default function HomeClient() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("USD");
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
          targetPrice: Number(targetPrice),
          preferredCurrency: currency
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
              <div className="flex gap-2">
                <select
                  className="w-24 rounded-none border-2 border-charcoal bg-cream px-2 py-3 font-bold text-charcoal shadow-retro-sm transition-all focus:outline-none"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {COMMON_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 49.99"
                  className="flex-1 rounded-none border-2 border-charcoal bg-cream px-3 py-3 font-medium text-charcoal shadow-retro-sm transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
              </div>
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

      {/* How It Works Section */}
      <div className="mt-20 space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-charcoal">
            How it <span className="text-brand">works</span>
          </h2>
          <p className="mt-4 text-sm font-medium text-charcoal/60 uppercase tracking-widest">
            Three simple steps to better shopping
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Find your Product",
              desc: "Copy the URL of any product from Amazon, ASOS, or Zara that you've been eyeing."
            },
            {
              step: "02",
              title: "Set your Price",
              desc: "Paste the link here and tell us how much you want to pay. No account required for your first track."
            },
            {
              step: "03",
              title: "Get Alerted",
              desc: "We monitor the price 24/7 and send you an instant email the moment it hits your target."
            }
          ].map((item, i) => (
            <div key={i} className="relative rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro transition-transform hover:-translate-y-1">
              <div className="absolute -top-4 -left-4 border-2 border-charcoal bg-brand px-3 py-1 text-lg font-black text-white shadow-retro-sm">
                {item.step}
              </div>
              <h3 className="mt-4 text-xl font-bold uppercase tracking-tight text-charcoal">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-charcoal/80">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Use Us Section */}
      <div className="mt-24 rounded-xl border-2 border-charcoal bg-charcoal p-8 text-white shadow-retro sm:p-12">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">
              Save <span className="text-brand">More</span>, Not harder.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Prices on major retailers like Amazon can change multiple times a day. Retailers use dynamic pricing algorithms to maximize profit, but you can beat them at their own game.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "24/7 Automated Monitoring",
                "Instant Email Notifications",
                "Price History Tracking",
                "Multiple Retailer Support"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-brand" />
                  <span className="font-bold uppercase tracking-wide">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="aspect-square rounded-full border-4 border-dashed border-white/20 p-8 flex items-center justify-center">
              <div className="aspect-square w-full rounded-full bg-brand/20 p-8 flex items-center justify-center animate-pulse">
                <div className="text-4xl font-black text-brand italic tracking-tighter text-center leading-none">PRICE<br />WATCH</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Retailers */}
      <div className="mt-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-charcoal">
            Supported <span className="text-brand">Retailers</span>
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { name: "Amazon", regions: "US, UK, DE, FR, IT, ES, CA" },
            { name: "ASOS", regions: "Global" },
            { name: "Zara", regions: "Global" }
          ].map((retailer, i) => (
            <div key={i} className="flex-1 min-w-[200px] rounded-xl border-2 border-charcoal bg-white p-6 shadow-retro-sm text-center">
              <div className="text-xl font-black uppercase tracking-widest text-charcoal">{retailer.name}</div>
              <div className="mt-2 text-xs font-bold uppercase text-charcoal/40 tracking-widest">{retailer.regions}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-24 mb-12 max-w-2xl mx-auto">
        <h2 className="mb-10 text-center text-3xl font-extrabold uppercase tracking-tight text-charcoal">
          Frequently Asked <span className="text-brand">Questions</span>
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Is Price Watch free?",
              a: "Yes! Currently, you can track your products for free. We monetize through ads and affiliate links to keep the lights on."
            },
            {
              q: "How often do you check prices?",
              a: "We check prices several times a day to ensure you don't miss a flash sale or a quick price drop."
            },
            {
              q: "Do I need an account?",
              a: "No account is needed to start tracking your first product. We'll simply ask for your email to send alerts. If you want to manage multiple trackers, you can create a free account."
            },
            {
              q: "What products can I track?",
              a: "You can track any valid product URL from our supported retailers. From electronics and clothing to home goods."
            }
          ].map((item, i) => (
            <div key={i} className="rounded-lg border-2 border-charcoal bg-white p-5 shadow-retro-sm">
              <h3 className="text-lg font-bold text-charcoal">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
