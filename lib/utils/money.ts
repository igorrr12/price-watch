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
  "kr": "SEK" // best-effort; could be NOK/DKK depending on domain/locale
};

export function parsePriceText(input: string): Money | null {
  const raw = input
    .replace(/\s+/g, " ")
    .replace(/[\u00A0]/g, " ")
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

