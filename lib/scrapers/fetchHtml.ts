import { ScrapeError } from "./types";

export async function fetchHtml(url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, {
      // Many retailers show different HTML without a UA.
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9"
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

