import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET() {
  // Auth sessions are not wired yet; keep this endpoint disabled for now.
  // The UI reads directly from Supabase in server components where needed.
  const _supabase = await createSupabaseServerClient();

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

