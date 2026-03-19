import { ScrapeError } from "./types";

export async function fetchHtml(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, {
      // Many retailers show different HTML without a UA.
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": url.split("?")[0],
        "Cache-Control": "no-cache"
      },
      redirect: "follow",
      cache: "no-store"
    });
  } catch (e) {
    throw new ScrapeError("fetch_failed", "Failed to fetch product page.", {
      cause: String(e)
    });
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

