import { ScrapeError } from "./types";

export async function fetchHtml(url: string, customHeaders?: Record<string, string>): Promise<string> {
  const isHardRetailer = url.includes("zara.com") || url.includes("nike.com") || url.includes("hm.com") || url.includes("asos.com");
  const scraperApiKey = process.env.SCRAPER_API_KEY;
  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for proxies/firecrawl

  try {
    // 1. Try Firecrawl first if available for hard retailers
    if (isHardRetailer && firecrawlApiKey) {
      try {
        const fcRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${firecrawlApiKey}`
          },
          body: JSON.stringify({ url, formats: ["rawHtml"], waitFor: 1000 }),
          signal: controller.signal
        });

        if (fcRes.ok) {
          const fcData = await fcRes.json();
          if (fcData.success && fcData.data?.rawHtml) {
            return fcData.data.rawHtml;
          }
        }
      } catch (e) {
        console.error("Firecrawl attempt failed, falling back...", e);
      }
    }

    // 2. Prepare for standard fetch or ScraperAPI
    let fetchUrl = url;
    let fetchHeaders: Record<string, string> = { ...customHeaders };

    if (isHardRetailer && scraperApiKey) {
      fetchUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;
      fetchHeaders = {}; 
    }

    const defaultHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "priority": "u=1",
      "upgrade-insecure-requests": "1",
      "Cache-Control": "no-cache"
    };

    const res = await fetch(fetchUrl, {
      headers: { ...defaultHeaders, ...fetchHeaders },
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal
    });

    const text = await res.text();

    if (!res.ok) {
      throw new ScrapeError("fetch_failed", `Fetch failed (${res.status}).`, {
        status: res.status,
        bodySnippet: text.slice(0, 500)
      });
    }

    // crude block detection
    const lower = text.toLowerCase();
    if (lower.includes("captcha") || lower.includes("robot check") || lower.includes("interstitial/ic.html")) {
      throw new ScrapeError("blocked", "Retailer blocked automated scraping.");
    }

    return text;

  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new ScrapeError("fetch_failed", "Request timed out.");
    }
    if (e instanceof ScrapeError) throw e;
    throw new ScrapeError("fetch_failed", "Failed to fetch product page.", { cause: String(e) });
  } finally {
    clearTimeout(timeoutId);
  }
}

