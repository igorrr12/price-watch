import { detectRetailer } from "../utils/url";
import { scrapeAmazon } from "./amazon";
import { scrapeAsos } from "./asos";
import { scrapeZara } from "./zara";
import { ScrapeError, type ScrapeResult } from "./types";

export async function scrapeProduct(url: string): Promise<ScrapeResult> {
  const retailer = detectRetailer(url);
  if (!retailer) {
    throw new ScrapeError(
      "unsupported_retailer",
      "Retailer not yet supported."
    );
  }

  switch (retailer) {
    case "amazon":
      return scrapeAmazon(url);
    case "asos":
      return scrapeAsos(url);
    case "zara":
      return scrapeZara(url);
  }
}

export { ScrapeError };
export type { ScrapeResult };

