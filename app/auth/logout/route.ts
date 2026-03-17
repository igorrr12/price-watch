import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Next.js redirect needs absolute URL if returning Response sometimes, 
  // but NextResponse.redirect works with `new URL(..., request.url)`.
  const url = new URL("/", request.url);
  return NextResponse.redirect(url, { status: 302 });
}
