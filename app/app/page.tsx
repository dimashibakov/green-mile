import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Trip, NewsItem } from "@/lib/types";
import { AppClient } from "./AppClient";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, handle, category, resident_since, card_expires")
    .eq("id", user.id)
    .single();

  const profile: Profile =
    profileRow ?? {
      id: user.id,
      handle: (user.email || "resident").split("@")[0],
      category: "E16",
      resident_since: null,
      card_expires: null,
    };

  const { data: tripRows } = await supabase
    .from("trips")
    .select("id, user_id, country, city, code, departed, returned, reason")
    .eq("user_id", user.id)
    .order("departed", { ascending: true });

  const trips: Trip[] = tripRows ?? [];

  const { data: newsRows } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(40);

  const news: NewsItem[] = newsRows ?? [];

  return <AppClient profile={profile} trips={trips} initialNews={news} />;
}
