import { fetchHtml } from "./fetchHtml";
import { getMeta, loadHtml, parseFirstPrice, firstText, firstAttr } from "./common";
import { ScrapeError, type ScrapeResult } from "./types";

export async function scrapeZara(url: string): Promise<ScrapeResult> {
  const ajaxUrl = url.includes("?") ? `${url}&ajax=true` : `${url}?ajax=true`;
  const html = await fetchHtml(ajaxUrl);
  
  // If it's the AJAX endpoint, it returns JSON
  if (url.includes("ajax=true") || html.trim().startsWith("{")) {
    try {
      const data = JSON.parse(html);
      const productData = data.product || data;
      const name = productData.name || data.analyticsData?.page?.productName;
      
      let price: number | null = null;
      let currency: string | null = null;

      if (productData.pricing?.price) {
        price = productData.pricing.price.value / 100;
        currency = productData.pricing.price.currency?.code;
      } else if (data.analyticsData?.page?.price) {
        price = Number.parseFloat(data.analyticsData.page.price);
        currency = data.analyticsData.page.currency;
      }

      if (name && price) {
        return {
          retailer: "zara",
          name,
          imageUrl: productData.imageUrl || null,
          price,
          currency: currency || "USD"
        };
      }
    } catch (e) {
      // fallback to HTML parsing
    }
  }

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

  // Try ld+json first
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || "{}");
      if (data["@type"] === "Product" || data["@type"] === "http://schema.org/Product") {
        const offers = data.offers;
        if (offers) {
          const mainOffer = Array.isArray(offers) ? offers[0] : offers;
          if (mainOffer.price) price = Number.parseFloat(String(mainOffer.price));
          if (mainOffer.priceCurrency) currency = mainOffer.priceCurrency;
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  });

  if (price == null && ogAmount) {
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

