export type Retailer = "amazon" | "asos" | "zara";

export function getHostname(inputUrl: string): string {
  const u = new URL(inputUrl);
  return u.hostname.toLowerCase();
}

export function detectRetailer(inputUrl: string): Retailer | null {
  const host = getHostname(inputUrl);

  if (host.includes("amazon.")) return "amazon";
  if (host.endsWith("asos.com") || host.includes(".asos.com")) return "asos";
  if (host.endsWith("zara.com") || host.includes(".zara.com")) return "zara";

  return null;
}

const DROP_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "igshid",
  "spm",
  "tag",
  "ref",
  "ref_",
  "referrer",
  "psc",
  "pd_rd_w",
  "pd_rd_wg",
  "pd_rd_r",
  "pf_rd_p",
  "pf_rd_r",
  "qid",
  "sr"
]);

export function normalizeUrl(inputUrl: string): string {
  const u = new URL(inputUrl);
  u.hash = "";

  // Drop noisy query params; keep the rest (sorted for stable canonicalization)
  const kept: Array<[string, string]> = [];
  u.searchParams.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!DROP_QUERY_PARAMS.has(k)) kept.push([key, value]);
  });
  kept.sort(([a], [b]) => a.localeCompare(b));

  u.search = "";
  for (const [k, v] of kept) u.searchParams.append(k, v);

  // Amazon has many variants; a stable normalization that works widely is:
  // keep `/dp/<ASIN>` or `/gp/product/<ASIN>` path if present.
  if (u.hostname.toLowerCase().includes("amazon.")) {
    const dpMatch = u.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    const gpMatch = u.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    const asin = dpMatch?.[1] ?? gpMatch?.[1];
    if (asin) {
      u.pathname = `/dp/${asin.toUpperCase()}`;
      u.search = "";
    }
  }

  // Trim trailing slash except root
  if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
    u.pathname = u.pathname.slice(0, -1);
  }

  return u.toString();
}

