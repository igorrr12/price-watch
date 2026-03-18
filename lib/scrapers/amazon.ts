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

  // Try scraping price from page elements (also extracts currency text like "PLN 147.86")
  if (price == null || !currency) {
    const parsed = parseFirstPrice($, [
      "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
      "#corePriceDisplay_desktop_feature_div .a-price-whole",
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      ".a-price .a-offscreen"
    ]);
    if (parsed) {
      price = price ?? parsed.amount;
      currency = currency ?? parsed.currency;
    }
  }

  // Last-resort: search the entire page text for currency symbols/codes if we have a price but no currency
  if (price != null && !currency) {
    const pageText = $("body").text();
    if (pageText.includes("zł") || pageText.includes("PLN")) currency = "PLN";
    else if (pageText.includes("€") || pageText.includes("EUR")) currency = "EUR";
    else if (pageText.includes("£") || pageText.includes("GBP")) currency = "GBP";
    else if (pageText.includes("$") || pageText.includes("USD")) currency = "USD";
  }

  // Domain-based fallback for unambiguous regional TLDs
  if (!currency) {
    if (url.includes("amazon.co.uk")) currency = "GBP";
    else if (url.includes("amazon.pl"))  currency = "PLN";
    else if (url.includes("amazon.de") || url.includes("amazon.fr") ||
             url.includes("amazon.it") || url.includes("amazon.es")) currency = "EUR";
    else if (url.includes("amazon.ca"))  currency = "CAD";
    else if (url.includes("amazon.se"))  currency = "SEK";
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

