import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseServerClient();

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, url, domain, retailer, name, image_url, currency, last_price, last_checked_at")
    .eq("id", params.id)
    .single();

  if (pErr) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { data: points, error: ppErr } = await supabase
    .from("price_points")
    .select("created_at, price")
    .eq("product_id", params.id)
    .order("created_at", { ascending: true })
    .limit(120);

  if (ppErr) {
    return NextResponse.json({ error: "Failed to load price history." }, { status: 500 });
  }

  return NextResponse.json({ product, points });
}

