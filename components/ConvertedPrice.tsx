"use client";

import { useEffect, useState } from "react";

type Props = {
  amount: number | null;
  fromCurrency: string | null;
  toCurrency: string | null;
  className?: string;
};

// Simple cache to avoid re-fetching the same rate twice
const rateCache: Record<string, number> = {};

async function getRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;
  const key = `${from}-${to}`;
  if (rateCache[key]) return rateCache[key];
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json() as { rates: Record<string, number> };
    const rate = data.rates[to] ?? 1;
    rateCache[key] = rate;
    return rate;
  } catch {
    return 1;
  }
}

export function ConvertedPrice({ amount, fromCurrency, toCurrency, className }: Props) {
  const [display, setDisplay] = useState<string>("—");

  useEffect(() => {
    if (amount == null) { setDisplay("—"); return; }
    const from = fromCurrency?.toUpperCase() ?? null;
    const to = toCurrency?.toUpperCase() ?? null;

    if (!from || !to || from === to) {
      setDisplay(fmt(to, amount));
      return;
    }

    getRate(from, to).then((rate) => {
      const converted = Math.round(amount * rate * 100) / 100;
      setDisplay(fmt(to, converted));
    });
  }, [amount, fromCurrency, toCurrency]);

  return <span className={className}>{display}</span>;
}

function fmt(currency: string | null, amount: number) {
  try {
    if (currency) {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
    }
  } catch {}
  return currency ? `${currency} ${amount.toFixed(2)}` : amount.toFixed(2);
}
