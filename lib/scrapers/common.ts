import * as cheerio from "cheerio";
import { parsePriceText } from "../utils/money";

export function loadHtml(html: string) {
  return cheerio.load(html);
}

export function getMeta(
  $: cheerio.CheerioAPI,
  selector: string
): string | null {
  const val = $(selector).attr("content")?.trim();
  return val && val.length > 0 ? val : null;
}

export function firstText(
  $: cheerio.CheerioAPI,
  selectors: string[]
): string | null {
  for (const sel of selectors) {
    const t = $(sel).first().text().replace(/\s+/g, " ").trim();
    if (t) return t;
  }
  return null;
}

export function firstAttr(
  $: cheerio.CheerioAPI,
  selectors: string[],
  attr: string
): string | null {
  for (const sel of selectors) {
    const v = $(sel).first().attr(attr)?.trim();
    if (v) return v;
  }
  return null;
}

export function parseFirstPrice(
  $: cheerio.CheerioAPI,
  selectors: string[]
): { amount: number; currency: string | null } | null {
  const t = firstText($, selectors);
  if (!t) return null;
  const money = parsePriceText(t);
  if (!money) return null;
  return { amount: money.amount, currency: money.currency };
}

