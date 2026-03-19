import { fetchHtml } from "./fetchHtml";
import { getMeta, loadHtml, parseFirstPrice, firstText, firstAttr } from "./common";
import { ScrapeError, type ScrapeResult } from "./types";

export async function scrapeZara(url: string): Promise<ScrapeResult> {
  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
  const scraperApiKey = process.env.SCRAPER_API_KEY;

  // 1. If we have Firecrawl, try the plain URL first as it's more reliable
  if (firecrawlApiKey) {
    try {
      const html = await fetchHtml(url);
      const result = parseZaraHtml(html, url);
      if (result) return result;
    } catch (e) {
      // ignore and fall back to AJAX
    }
  }

  // 2. Fallback to AJAX-based scraping (original logic)
  // Prioritize v1 parameter as it's the internal ID used by Zara's AJAX API
  const idMatch = url.match(/[?&]v1=(\d+)/) || url.match(/-p(\d+)\.html/);
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
        "Referer": url.split("?")[0]
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

  const finalResult = parseZaraHtml(html, url);
  if (finalResult) return finalResult;

  const hasScraperKey = Boolean(scraperApiKey);
  const hasFirecrawlKey = Boolean(firecrawlApiKey);
  
  let msg = "Could not parse Zara product. The page structure might have changed.";
  if (!hasScraperKey && !hasFirecrawlKey) {
    msg = "Could not parse Zara product. Please add a FIRECRAWL_API_KEY or SCRAPER_API_KEY to bypass Zara's protection.";
  }
  
  throw new ScrapeError("missing_fields", msg, {
    hasScraperKey,
    hasFirecrawlKey
  });
}

function parseZaraHtml(html: string, url: string): ScrapeResult | null {
  const $ = loadHtml(html);

  const name =
    firstText($, [
      '.product-detail-info__header-name',
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
      '.price-current__amount',
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

  if (!name || !price) return null;

  return {
    retailer: "zara",
    name,
    imageUrl,
    price,
    currency
  };
}

