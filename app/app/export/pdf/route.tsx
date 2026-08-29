import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Trip } from "@/lib/types";
import {
  absenceByYear,
  byCountry,
  derive,
  isoPlain,
  today,
} from "@/lib/residency";
import Report from "./report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [{ data: profileRow }, { data: tripRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("departed", { ascending: true }),
  ]);

  const profile: Profile =
    profileRow ?? {
      id: user.id,
      handle: (user.email || "resident").split("@")[0],
      category: "E16",
      resident_since: null,
      card_expires: null,
    };

  const trips: Trip[] = tripRows ?? [];
  const D = derive(profile, trips);
  const generated = isoPlain(today());

  const buf = await renderToBuffer(
    <Report
      profile={profile}
      D={D}
      generated={generated}
      byCountry={byCountry(D)}
      byYear={absenceByYear(D)}
    />
  );

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="green-mile-report.pdf"',
    },
  });
}
