import { createClient } from "@supabase/supabase-js";

export async function linkAnonymousTrackersToUser(opts: {
  userId: string;
  email: string | null | undefined;
}) {
  const email = (opts.email ?? "").trim().toLowerCase();
  if (!email) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return;

  const supabaseAdmin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // Ensure the public profile exists to satisfy foreign key constraints
  await supabaseAdmin.from("profiles").upsert({ id: opts.userId }, { onConflict: "id" }).select().single();

  // Link trackers
  await supabaseAdmin
    .from("trackers")
    .update({ user_id: opts.userId })
    .eq("email", email)
    .is("user_id", null);
}

