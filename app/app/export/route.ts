import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: trips }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("trips").select("*").eq("user_id", user.id).order("departed", { ascending: true }),
  ]);

  return new NextResponse(JSON.stringify({ profile, trips: trips ?? [] }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="green-mile-data.json"',
    },
  });
}
