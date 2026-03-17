import type { Retailer } from "../utils/url";

export type ScrapeResult = {
  retailer: Retailer;
  name: string;
  imageUrl: string | null;
  price: number;
  currency: string | null;
};

export class ScrapeError extends Error {
  code:
    | "unsupported_retailer"
    | "fetch_failed"
    | "blocked"
    | "parse_failed"
    | "missing_fields";

  constructor(
    code: ScrapeError["code"],
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
  }
}

