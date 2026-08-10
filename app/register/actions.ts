"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const handle = String(formData.get("handle") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const category = String(formData.get("category") || "E16");
  const resident_since = String(formData.get("resident_since") || "");
  const card_expires = String(formData.get("card_expires") || "");

  if (!handle) redirect("/register?e=" + encodeURIComponent("pick a handle."));
  if (!email) redirect("/register?e=" + encodeURIComponent("email required."));
  if (!password) redirect("/register?e=" + encodeURIComponent("password required."));
  if (!resident_since) redirect("/register?e=" + encodeURIComponent("set your resident-since date."));

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // consumed by the DB trigger to seed public.profiles
      data: { handle, category, resident_since, card_expires: card_expires || null },
    },
  });
  if (error) redirect("/register?e=" + encodeURIComponent(error.message.toLowerCase()));

  if (data.session) redirect("/app");
  // email confirmation is on: no session yet
  redirect("/login?message=" + encodeURIComponent("check your email to confirm, then sign in."));
}
