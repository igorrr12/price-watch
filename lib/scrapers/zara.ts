import { fetchHtml } from "./fetchHtml";
import { getMeta, loadHtml, parseFirstPrice, firstText, firstAttr } from "./common";
import { ScrapeError, type ScrapeResult } from "./types";

export async function scrapeZara(url: string): Promise<ScrapeResult> {
  const html = await fetchHtml(url);
  const $ = loadHtml(html);

  const name =
    firstText($, [
      'h1[data-qa="product-name"]',
      'h1[class*="product"]',
      "h1"
    ]) ?? getMeta($, 'meta[property="og:title"]');

  const imageUrl =
    getMeta($, 'meta[property="og:image"]') ??
    firstAttr($, ["img"], "src");

  const ogAmount =
    getMeta($, 'meta[property="product:price:amount"]') ??
    getMeta($, 'meta[property="og:price:amount"]');
  const ogCurrency =
    getMeta($, 'meta[property="product:price:currency"]') ??
    getMeta($, 'meta[property="og:price:currency"]');

  let price: number | null = null;
  let currency: string | null = ogCurrency ?? null;

  if (ogAmount) {
    const p = Number.parseFloat(ogAmount.replace(/[^\d.]/g, ""));
    if (Number.isFinite(p)) price = p;
  }

  if (price == null) {
    const parsed = parseFirstPrice($, [
      '[data-qa="product-price"]',
      '[data-qa="price"]',
      "span.price__amount",
      "span[class*='price']"
    ]);
    if (parsed) {
      price = parsed.amount;
      currency = currency ?? parsed.currency;
    }
  }

  if (!name || !price) {
    throw new ScrapeError("missing_fields", "Could not parse Zara product.", {
      hasName: Boolean(name),
      hasPrice: Boolean(price)
    });
  }

  return {
    retailer: "zara",
    name,
    imageUrl,
    price,
    currency
  };
}

