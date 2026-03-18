export type Money = {
  amount: number;
  currency: string | null;
};

const SYMBOL_TO_CURRENCY: Record<string, string> = {
  "$": "USD",
  "£": "GBP",
  "€": "EUR",
  "¥": "JPY",
  "₩": "KRW",
  "₹": "INR",
  "zł": "PLN",
  "PLN": "PLN",
  "kr": "SEK",
  "sek": "SEK",
  "nok": "NOK",
  "dkk": "DKK",
};

export function parsePriceText(input: string): Money | null {
  const raw = input
    .replace(/[\u00A0\u1680​\u180e\u2000-\u200a\u202f\u205f\u3000]/g, " ") // normalize all types of spaces
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return null;

  // detect currency symbol token
  let currency: string | null = null;
  for (const sym of Object.keys(SYMBOL_TO_CURRENCY)) {
    if (raw.includes(sym)) {
      currency = SYMBOL_TO_CURRENCY[sym];
      break;
    }
  }

  // detect ISO currency code (e.g. "PLN 147.86" or "147.86 EUR")
  if (!currency) {
    const isoMatch = raw.match(/\b([A-Z]{3})\b/);
    if (isoMatch) {
      const known = [
        "USD", "EUR", "GBP", "PLN", "CAD", "AUD", "JPY",
        "SEK", "NOK", "DKK", "CHF", "CZK", "HUF", "RON"
      ];
      if (known.includes(isoMatch[1])) {
        currency = isoMatch[1];
      }
    }
  }

  // keep digits, commas, dots; try to normalize thousands separators
  const numeric = raw.replace(/[^\d.,-]/g, "");
  if (!numeric) return null;

  // Heuristic:
  // - If both comma and dot exist, assume the last separator is decimal.
  // - If only comma exists, treat it as decimal when last group length is 2.
  const hasComma = numeric.includes(",");
  const hasDot = numeric.includes(".");
  let normalized = numeric;

  if (hasComma && hasDot) {
    const lastComma = numeric.lastIndexOf(",");
    const lastDot = numeric.lastIndexOf(".");
    const decSep = lastComma > lastDot ? "," : ".";
    const thouSep = decSep === "," ? "." : ",";
    normalized = numeric.split(thouSep).join("");
    normalized = normalized.replace(decSep, ".");
  } else if (hasComma && !hasDot) {
    const parts = numeric.split(",");
    if (parts.length === 2 && parts[1].length === 2) {
      normalized = parts[0].replace(/\./g, "") + "." + parts[1];
    } else {
      normalized = numeric.split(",").join("");
    }
  } else {
    normalized = numeric.split(",").join("");
  }

  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount)) return null;

  return { amount, currency };
}

