// Pure residency/travel math — ported 1:1 from the migration-tracker.html derive() logic.
import type { Profile, Trip } from "./types";

const MS = 86400000;
export const PRESENCE_NEEDED = 913;
export const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function d(s: string): Date {
  return new Date(s + "T00:00:00");
}
export function daysB(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS);
}
export function addDays(dt: Date, n: number): Date {
  const x = new Date(dt);
  x.setDate(x.getDate() + n);
  return x;
}
export function iso(dt: Date): string {
  const m = dt.getMonth() + 1;
  const day = dt.getDate();
  // non-breaking hyphens to keep dates on one line, matching the prototype
  return dt.getFullYear() + "\u2011" + (m < 10 ? "0" : "") + m + "\u2011" + (day < 10 ? "0" : "") + day;
}
export function isoPlain(dt: Date): string {
  const m = dt.getMonth() + 1;
  const day = dt.getDate();
  return dt.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
}
export function plural(n: number, w: string): string {
  return n + " " + w + (Math.abs(n) === 1 ? "" : "s");
}
export function flagFromCode(cc?: string | null): string {
  if (!cc || cc.length !== 2) return "";
  const up = cc.toUpperCase();
  if (!/^[A-Z]{2}$/.test(up)) return "";
  return (
    String.fromCodePoint(0x1f1e6 + up.charCodeAt(0) - 65) +
    String.fromCodePoint(0x1f1e6 + up.charCodeAt(1) - 65)
  );
}
export function today(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export type DerivedTrip = {
  raw: Trip;
  depDate: Date;
  retDate: Date;
  ongoing: boolean;
  len: number;
};

export type Derived = {
  t: Date;
  rs: Date;
  trips: DerivedTrip[];
  totalAbroad: number;
  lprDays: number;
  present: number;
  current: DerivedTrip | null;
  natz5: Date;
  natzFile: Date;
};

export function derive(profile: Profile, trips: Trip[]): Derived {
  const t = today();
  const rs = d(profile.resident_since || isoPlain(t));
  const dtrips: DerivedTrip[] = trips
    .map((x) => {
      const depDate = d(x.departed);
      const ongoing = !x.returned;
      const retDate = ongoing ? t : d(x.returned as string);
      return { raw: x, depDate, retDate, ongoing, len: Math.max(0, daysB(depDate, retDate)) };
    })
    .sort((a, b) => a.depDate.getTime() - b.depDate.getTime());

  const totalAbroad = dtrips.reduce((s, x) => s + x.len, 0);
  const lprDays = Math.max(0, daysB(rs, t));
  const present = Math.max(0, lprDays - totalAbroad);
  const current = dtrips.filter((x) => x.ongoing).slice(-1)[0] || null;
  const natz5 = new Date(rs.getFullYear() + 5, rs.getMonth(), rs.getDate());
  const natzFile = addDays(natz5, -90);

  return { t, rs, trips: dtrips, totalAbroad, lprDays, present, current, natz5, natzFile };
}

export const WIN_PRESETS: [string, number | null][] = [
  ["7d", 7], ["30d", 30], ["90d", 90], ["365d", 365], ["all", null],
];

export function abroadInWindow(D: Derived, nDays: number | null): number {
  if (nDays == null) return D.totalAbroad;
  const start = addDays(D.t, -nDays);
  let total = 0;
  D.trips.forEach((x) => {
    const a = x.depDate > start ? x.depDate : start;
    const b = x.retDate < D.t ? x.retDate : D.t;
    const ov = daysB(a, b);
    if (ov > 0) total += ov;
  });
  return total;
}

export function tone(len: number): "ok" | "warn" | "bad" {
  return len >= 180 ? "bad" : len >= 150 ? "warn" : "ok";
}

export function absenceByYear(D: Derived): { year: number; days: number }[] {
  const byY: Record<number, number> = {};
  D.trips.forEach((x) => {
    const y0 = x.depDate.getFullYear();
    const y1 = x.retDate.getFullYear();
    for (let y = y0; y <= y1; y++) {
      const s = new Date(y, 0, 1);
      const e = new Date(y + 1, 0, 1);
      const a = x.depDate > s ? x.depDate : s;
      const b = x.retDate < e ? x.retDate : e;
      const ov = daysB(a, b);
      if (ov > 0) byY[y] = (byY[y] || 0) + ov;
    }
  });
  return Object.keys(byY)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => ({ year, days: byY[year] }));
}

export function byCountry(D: Derived): { key: string; code: string | null; days: number; trips: number }[] {
  const m: Record<string, { code: string | null; days: number; trips: number }> = {};
  D.trips.forEach((x) => {
    const k = x.raw.country || "?";
    if (!m[k]) m[k] = { code: x.raw.code, days: 0, trips: 0 };
    m[k].days += x.len;
    m[k].trips++;
  });
  return Object.keys(m)
    .sort((a, b) => m[b].days - m[a].days)
    .map((key) => ({ key, ...m[key] }));
}
