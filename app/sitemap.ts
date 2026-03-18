import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Fetch all product IDs to include in sitemap
  const { data: products } = await supabase.from("products").select("id, last_checked_at");

  const baseUrl = "https://pricewatch.top";

  const productEntries: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${baseUrl}/track/${p.id}`,
    lastModified: p.last_checked_at ? new Date(p.last_checked_at) : new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...productEntries,
  ];
}
