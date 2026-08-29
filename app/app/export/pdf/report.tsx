import type { ReactNode } from "react";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Profile } from "@/lib/types";
import type { Derived } from "@/lib/residency";
import {
  PRESENCE_NEEDED,
  dayDiff,
  isoPlain,
  plural,
} from "@/lib/residency";
import { catLabel } from "@/lib/categories";

Font.register({
  family: "JetBrains Mono",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@v2.304/fonts/ttf/JetBrainsMono-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@v2.304/fonts/ttf/JetBrainsMono-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const C = {
  ink: "#14212c",
  muted: "#64748b",
  green: "#2f9e5f",
  orange: "#c9821f",
  red: "#d0463f",
  panel: "#f5f8f6",
  border: "#dbe4de",
  band: "#0d1520",
  accent: "#6fe394",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "JetBrains Mono",
    fontSize: 9,
    color: C.ink,
    paddingBottom: 48,
    backgroundColor: C.white,
  },
  band: {
    backgroundColor: C.band,
    padding: 14,
    marginBottom: 16,
  },
  bandText: { color: C.accent, fontSize: 10, fontWeight: 700 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  subline: { fontSize: 9, color: C.muted, marginBottom: 12 },
  banner: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    fontWeight: 700,
    fontSize: 10,
  },
  bannerClear: { backgroundColor: "#e8f5ee", color: C.green },
  bannerReview: { backgroundColor: "#fdf3e7", color: C.orange },
  panel: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  panelTitle: { fontSize: 10, fontWeight: 700, marginBottom: 6, color: C.green },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 120, color: C.muted },
  value: { flex: 1 },
  barTrack: {
    height: 10,
    backgroundColor: C.border,
    borderRadius: 3,
    marginTop: 4,
    marginBottom: 4,
  },
  barFill: { height: 10, backgroundColor: C.green, borderRadius: 3 },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 700,
    fontSize: 8,
    color: C.muted,
  },
  tableRow: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: "#eef2ef" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 7,
    color: C.muted,
    lineHeight: 1.4,
  },
  colNum: { width: 18 },
  colDest: { flex: 2 },
  colDate: { width: 72 },
  colDays: { width: 44, textAlign: "right" },
  colReason: { flex: 1.5 },
  colCountry: { flex: 1 },
  colYear: { width: 48 },
});

type CountryRow = { key: string; code: string | null; days: number; trips: number };
type YearRow = { year: number; days: number };

export type ReportProps = {
  profile: Profile;
  D: Derived;
  generated: string;
  byCountry: CountryRow[];
  byYear: YearRow[];
};

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  if (typeof d === "string") return d;
  return isoPlain(d);
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={s.panel}>
      <Text style={s.panelTitle}>{title}</Text>
      {children}
    </View>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export default function Report({ profile, D, generated, byCountry, byYear }: ReportProps) {
  const cat = profile.category || "E16";
  const handle = profile.handle || "resident";
  const anyOver = D.trips.some((x) => x.len >= 180);
  const pct = Math.min(100, Math.round((D.present / PRESENCE_NEEDED) * 100));
  const barW = `${pct}%`;
  const natzCountdown = dayDiff(D.t, D.natzFile);
  const tripsDesc = [...D.trips].reverse();

  return (
    <Document title="Green Mile Residency Report">
      <Page size="A4" style={s.page} wrap>
        <View style={s.band}>
          <Text style={s.bandText}>green-mile // residency &amp; travel report</Text>
        </View>

        <View style={{ paddingHorizontal: 40, paddingTop: 4 }}>
          <Text style={s.title}>Green Card Residency Report</Text>
          <Text style={s.subline}>
            resident[{cat}]@USCIS · {handle} · generated {generated}
          </Text>

          <View style={[s.banner, anyOver ? s.bannerReview : s.bannerClear]}>
            <Text>STATUS: {anyOver ? "REVIEW" : "CLEAR"}</Text>
          </View>

          <Panel title="Green Card">
            <KV label="category" value={catLabel(cat)} />
            <KV label="resident since" value={fmtDate(profile.resident_since)} />
            <KV label="card expires" value={fmtDate(profile.card_expires)} />
            <KV label="type" value="permanent · unconditional" />
          </Panel>

          <Panel title="Physical Presence">
            <KV label="days as resident" value={plural(D.lprDays, "day")} />
            <KV label="in-US days" value={plural(D.present, "day")} />
            <KV label="days abroad" value={plural(D.totalAbroad, "day")} />
            <KV label="trips logged" value={String(D.trips.length)} />
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: barW }]} />
            </View>
            <Text>
              {D.present} / {PRESENCE_NEEDED} · {pct}%
            </Text>
          </Panel>

          {D.current && (
            <Panel title="Current Trip">
              <KV
                label="destination"
                value={`${D.current.raw.country}${D.current.raw.city ? ` (${D.current.raw.city})` : ""}`}
              />
              <KV label="departed" value={`${fmtDate(D.current.raw.departed)} · day ${D.current.len}`} />
              {D.line180 && (
                <KV
                  label="180-day line"
                  value={`${fmtDate(D.line180)} · in ${plural(dayDiff(D.t, D.line180), "day")}`}
                />
              )}
              {D.line365 && (
                <KV
                  label="1-year line"
                  value={`${fmtDate(D.line365)} · in ${plural(dayDiff(D.t, D.line365), "day")}`}
                />
              )}
            </Panel>
          )}

          <Panel title="Trip Log">
            <View style={s.tableHead}>
              <Text style={s.colNum}>#</Text>
              <Text style={s.colDest}>Destination</Text>
              <Text style={s.colDate}>Departed</Text>
              <Text style={s.colDate}>Returned</Text>
              <Text style={s.colDays}>Days</Text>
              <Text style={s.colReason}>Reason</Text>
            </View>
            {tripsDesc.length === 0 ? (
              <Text style={{ color: C.muted, fontStyle: "italic" }}>No trips logged.</Text>
            ) : (
              tripsDesc.map((t, i) => (
                <View key={t.raw.id} style={s.tableRow} wrap={false}>
                  <Text style={s.colNum}>{tripsDesc.length - i}</Text>
                  <Text style={s.colDest}>
                    {t.raw.country}
                    {t.raw.city ? ` — ${t.raw.city}` : ""}
                  </Text>
                  <Text style={s.colDate}>{fmtDate(t.raw.departed)}</Text>
                  <Text style={s.colDate}>{t.ongoing ? "— (ongoing)" : fmtDate(t.raw.returned)}</Text>
                  <Text style={s.colDays}>{t.len}d</Text>
                  <Text style={s.colReason}>{t.raw.reason || "—"}</Text>
                </View>
              ))
            )}
          </Panel>

          <Panel title="Breakdown — By Country">
            {byCountry.length === 0 ? (
              <Text style={{ color: C.muted }}>—</Text>
            ) : (
              byCountry.map((c) => (
                <View key={c.key} style={s.tableRow}>
                  <Text style={s.colCountry}>{c.key}</Text>
                  <Text style={s.colDays}>{c.days}d</Text>
                  <Text style={{ flex: 1 }}>{c.trips} trip{c.trips === 1 ? "" : "s"}</Text>
                </View>
              ))
            )}
          </Panel>

          <Panel title="Breakdown — By Year">
            {byYear.length === 0 ? (
              <Text style={{ color: C.muted }}>—</Text>
            ) : (
              byYear.map((y) => (
                <View key={y.year} style={s.tableRow}>
                  <Text style={s.colYear}>{y.year}</Text>
                  <Text style={s.colDays}>{y.days}d abroad</Text>
                </View>
              ))
            )}
          </Panel>

          <Panel title="Naturalization">
            <KV label="5-year mark" value={fmtDate(D.natz5)} />
            <KV label="N-400 earliest" value={fmtDate(D.natzFile)} />
            <KV
              label="countdown"
              value={
                natzCountdown > 0
                  ? `~${plural(natzCountdown, "day")} · ~${Math.round(natzCountdown / 30)} mo`
                  : "eligible now"
              }
            />
          </Panel>
        </View>

        <View style={s.footer} fixed>
          <Text>
            Counting method: USCIS-exact — departure &amp; return count as present; completed trip =
            return − departure − 1; ongoing counts to today.
          </Text>
          <Text>Personal working record, not legal advice.</Text>
        </View>
      </Page>
    </Document>
  );
}
