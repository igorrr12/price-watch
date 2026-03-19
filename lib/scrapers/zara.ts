import { fetchHtml } from "./fetchHtml";
import { getMeta, loadHtml, parseFirstPrice, firstText, firstAttr } from "./common";
import { ScrapeError, type ScrapeResult } from "./types";

export async function scrapeZara(url: string): Promise<ScrapeResult> {
  const idMatch = url.match(/-p(\d+)\.html/) || url.match(/[?&]v1=(\d+)/);
  const productId = idMatch ? idMatch[1] : null;
  
  let ajaxUrl = url.includes("?") ? `${url}&ajax=true` : `${url}?ajax=true`;
  
  if (productId) {
    const regionMatch = url.match(/zara\.com\/([^\/]+\/[^\/]+)\//);
    const region = regionMatch ? regionMatch[1] : "us/en";
    const detailUrl = `https://www.zara.com/${region}/product/id/${productId}/extra-detail?ajax=true`;
    try {
      const detailHtml = await fetchHtml(detailUrl, {
        "Accept": "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": url.split("?")[0],
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      });
      if (detailHtml.trim().startsWith("{")) {
        const data = JSON.parse(detailHtml);
        const name = data.name || data.analyticsData?.page?.productName;
        let price = data.pricing?.price?.value ? data.pricing.price.value / 100 : null;
        let currency = data.pricing?.price?.currency?.code;
        
        if (name && price) {
          return { retailer: "zara", name, imageUrl: data.imageUrl || null, price, currency: currency || "USD" };
        }
      }
    } catch (e) {
      // ignore and fall back
    }
  }

  const html = await fetchHtml(ajaxUrl, {
    "Accept": "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": url.split("?")[0]
  });

  // Try to parse JSON from main AJAX response
  if (html.trim().startsWith("{")) {
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
    const hasKey = Boolean(process.env.SCRAPER_API_KEY);
    const msg = hasKey 
      ? "Could not parse Zara product. The page structure might have changed."
      : "Could not parse Zara product. Please add a SCRAPER_API_KEY to bypass Zara's protection.";
    
    throw new ScrapeError("missing_fields", msg, {
      hasName: Boolean(name),
      hasPrice: Boolean(price),
      hasApiKey: hasKey
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

