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

  // Try ld+json first
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "{}");
      const products = Array.isArray(data) ? data : [data];
      for (const p of products) {
        if (p["@type"] === "Product" || p["@type"] === "http://schema.org/Product") {
          const offers = Array.isArray(p.offers) ? p.offers : [p.offers];
          for (const offer of offers) {
             if (offer && offer.price) {
               price = Number.parseFloat(String(offer.price));
               currency = offer.priceCurrency || currency;
               if (price) break;
             }
          }
        }
        if (price) break;
      }
    } catch (e) {
      // ignore parse errors
    }
  });

  // Try parsing from Asos global config script
  if (price == null) {
    $('script').each((_, el) => {
      const content = $(el).html() || "";
      if (content.toLowerCase().includes("asos.pdp.config") || content.includes("current\":{")) {
        try {
          // Look for price value directly if config object is messy
          const valueMatch = content.match(/"current":\s*{\s*"value":\s*([\d.]+)/i);
          if (valueMatch) {
            price = Number.parseFloat(valueMatch[1]);
          }
          const currencyMatch = content.match(/"currency":\s*"([^"]+)"/i);
          if (currencyMatch) {
             currency = currencyMatch[1];
          }
        } catch (e) {}
      }
    });
  }

  // Broad fallback: Search for price pattern near product ID in the whole HTML
  if (price == null) {
    const rawMatch = html.match(/"value":\s*([\d.]+)/);
    if (rawMatch) {
      price = Number.parseFloat(rawMatch[1]);
    }
  }

  if (price == null && ogAmount) {
    const p = Number.parseFloat(ogAmount.replace(/[^\d.]/g, ""));
    if (Number.isFinite(p)) price = p;
  }

  if (price == null) {
    const parsed = parseFirstPrice($, [
      '[data-testid="product-price"]',
      '[data-testid="current-price"]',
      'span[data-testid="price-amount"]',
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
    console.log("ASOS Parsing failed. Name:", name, "Price:", price);
    console.log("ASOS HTML Snippet:", html.slice(0, 1000));
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

