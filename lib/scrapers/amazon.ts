import { fetchHtml } from "./fetchHtml";
import { getMeta, loadHtml, parseFirstPrice, firstText, firstAttr } from "./common";
import { ScrapeError, type ScrapeResult } from "./types";

export async function scrapeAmazon(url: string): Promise<ScrapeResult> {
  const html = await fetchHtml(url);
  const $ = loadHtml(html);

  const name =
    firstText($, ["#productTitle", "h1#title span", "h1 span#productTitle"]) ??
    getMeta($, 'meta[property="og:title"]');

  const imageUrl =
    firstAttr($, ["#imgTagWrapperId img", "#landingImage", "img#landingImage"], "src") ??
    getMeta($, 'meta[property="og:image"]');

  const ogAmount = getMeta($, 'meta[property="og:price:amount"]');
  const ogCurrency = getMeta($, 'meta[property="og:price:currency"]');

  let price: number | null = null;
  let currency: string | null = ogCurrency ?? null;

  if (ogAmount) {
    const p = Number.parseFloat(ogAmount.replace(/[^\d.]/g, ""));
    if (Number.isFinite(p)) price = p;
  }

  if (price == null) {
    const parsed = parseFirstPrice($, [
      "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
      "#corePriceDisplay_desktop_feature_div .a-price-whole",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      ".a-price .a-offscreen"
    ]);
    if (parsed) {
      price = parsed.amount;
      currency = currency ?? parsed.currency;
    }
  }

  if (!name || !price) {
    throw new ScrapeError("missing_fields", "Could not parse Amazon product.", {
      hasName: Boolean(name),
      hasPrice: Boolean(price)
    });
  }

  return {
    retailer: "amazon",
    name,
    imageUrl,
    price,
    currency
  };
}

