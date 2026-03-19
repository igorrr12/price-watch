import { ScrapeError } from "./types";

export async function fetchHtml(url: string, customHeaders?: Record<string, string>): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  let res: Response;
  try {
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
      "priority": "u=1", // Added priority header
      "upgrade-insecure-requests": "1",
      "Cache-Control": "no-cache"
    };

    res = await fetch(url, {
      headers: { ...defaultHeaders, ...customHeaders },
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal
    });
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw new ScrapeError("fetch_failed", "Request timed out after 10 seconds.");
    }
    throw new ScrapeError("fetch_failed", "Failed to fetch product page.", {
      cause: String(e)
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await res.text();

  if (!res.ok) {
    throw new ScrapeError("fetch_failed", `Fetch failed (${res.status}).`, {
      status: res.status,
      bodySnippet: text.slice(0, 500)
    });
  }

  // crude block detection (captcha / bot checks)
  const lower = text.toLowerCase();
  if (lower.includes("captcha") || lower.includes("robot check")) {
    throw new ScrapeError("blocked", "Retailer blocked automated scraping.");
  }

  return text;
}

