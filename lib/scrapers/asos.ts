import { fetchHtml } from "./fetchHtml";
import { getMeta, loadHtml, parseFirstPrice, firstText } from "./common";
import { ScrapeError, type ScrapeResult } from "./types";

export async function scrapeAsos(url: string): Promise<ScrapeResult> {
  const html = await fetchHtml(url);
  const $ = loadHtml(html);

  const name =
    firstText($, ["h1", '[data-testid="product-title"]']) ??
    getMeta($, 'meta[property="og:title"]');

  const imageUrl =
    getMeta($, 'meta[property="og:image"]') ??
    getMeta($, 'meta[name="twitter:image"]');

  const ogAmount = getMeta($, 'meta[property="product:price:amount"]') ?? getMeta($, 'meta[property="og:price:amount"]');
  const ogCurrency = getMeta($, 'meta[property="product:price:currency"]') ?? getMeta($, 'meta[property="og:price:currency"]');

  let price: number | null = null;
  let currency: string | null = ogCurrency ?? null;

  if (ogAmount) {
    const p = Number.parseFloat(ogAmount.replace(/[^\d.]/g, ""));
    if (Number.isFinite(p)) price = p;
  }

  if (price == null) {
    const parsed = parseFirstPrice($, [
      '[data-testid="product-price"]',
      '[data-testid="current-price"]',
      ".current-price",
      ".product-price",
      "span[class*='price']"
    ]);
    if (parsed) {
      price = parsed.amount;
      currency = currency ?? parsed.currency;
    }
  }

  if (!name || !price) {
    throw new ScrapeError("missing_fields", "Could not parse ASOS product.", {
      hasName: Boolean(name),
      hasPrice: Boolean(price)
    });
  }

  return {
    retailer: "asos",
    name,
    imageUrl,
    price,
    currency
  };
}

