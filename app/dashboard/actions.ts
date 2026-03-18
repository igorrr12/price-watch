"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function deleteTracker(trackerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("trackers")
    .delete()
    .eq("id", trackerId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}

export async function renewTracker(trackerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("trackers")
    .update({ active: true, consecutive_failures: 0, paused_reason: null })
    .eq("id", trackerId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}
