"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TripInput } from "./components/TripModal";
import type { ProfileInput } from "./components/ProfileModal";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function saveTrip(input: TripInput) {
  const { supabase, user } = await requireUser();
  const row = {
    user_id: user.id,
    country: input.country,
    city: input.city || null,
    code: input.code || null,
    departed: input.departed,
    returned: input.returned || null,
    reason: input.reason || null,
  };
  if (input.id) {
    await supabase.from("trips").update(row).eq("id", input.id);
  } else {
    await supabase.from("trips").insert(row);
  }
  revalidatePath("/app");
}

export async function deleteTrip(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("trips").delete().eq("id", id);
  revalidatePath("/app");
}

export async function saveProfile(input: ProfileInput) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("profiles")
    .update({
      handle: input.handle,
      category: input.category,
      resident_since: input.resident_since,
      card_expires: input.card_expires || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  revalidatePath("/app");
}

export async function logout() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}
