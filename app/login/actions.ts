"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email) redirect("/login?e=" + encodeURIComponent("enter an email to continue."));
  if (!password) redirect("/login?e=" + encodeURIComponent("password required."));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?e=" + encodeURIComponent(error.message.toLowerCase()));
  redirect("/app");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
