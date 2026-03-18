/**
 * Fetches a live exchange rate to convert `amount` from `from` currency to `to` currency.
 * Returns the original amount if conversion is unavailable or currencies match.
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  if (!from || !to) return amount;
  if (from.toUpperCase() === to.toUpperCase()) return amount;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`);
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = (await res.json()) as { rates: Record<string, number> };
    const rate = data.rates[to.toUpperCase()];
    if (!rate) throw new Error(`No rate for ${to}`);
    return Math.round(amount * rate * 100) / 100;
  } catch (e) {
    console.warn("Currency conversion failed, using original amount:", e);
    return amount;
  }
}
