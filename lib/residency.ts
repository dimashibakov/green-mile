// USCIS physical-presence counting: departure & return days count as in-U.S.;
// only full calendar days between count as abroad (completed trips: span − 1).
import type { Profile, Trip } from "./types";

const MS = 86400000;
export const PRESENCE_NEEDED = 913;
export const PRESENCE_TARGET = 913;
export const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function d(s: string): Date {
  return new Date(s + "T00:00:00");
}

/** Whole calendar days between two dates (same as prototype daysB). */
export function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS);
}

/** @deprecated alias */
export const daysB = dayDiff;

export function addDays(dt: Date, n: number): Date {
  const x = new Date(dt);
  x.setDate(x.getDate() + n);
  return x;
}

export function iso(dt: Date): string {
  const m = dt.getMonth() + 1;
  const day = dt.getDate();
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

export type TripFlag = "over-year" | "over-180" | "near-180" | "safe";

export function tripFlag(len: number): TripFlag {
  if (len >= 365) return "over-year";
  if (len >= 180) return "over-180";
  if (len >= 150) return "near-180";
  return "safe";
}

export function tone(len: number): "ok" | "warn" | "bad" {
  const f = tripFlag(len);
  if (f === "over-year" || f === "over-180") return "bad";
  if (f === "near-180") return "warn";
  return "ok";
}

/**
 * Abroad days for one trip.
 * @param conservative — prototype span (inclusive, no −1 on completed trips)
 */
export function tripAbroadDays(
  departed: Date,
  returned: Date | null,
  todayDate: Date,
  conservative = false
): number {
  const end = returned ?? todayDate;
  const span = dayDiff(departed, end);
  if (conservative) return Math.max(0, span);
  if (!returned) return Math.max(0, span);
  return Math.max(0, span - 1);
}

function abroadInterval(
  departed: Date,
  returned: Date | null,
  todayDate: Date,
  conservative: boolean
): { start: Date; end: Date } | null {
  if (conservative) {
    const end = returned ?? todayDate;
    if (end < departed) return null;
    return { start: departed, end };
  }
  if (!returned) {
    if (todayDate < addDays(departed, 1)) return null;
    return { start: addDays(departed, 1), end: todayDate };
  }
  const start = addDays(departed, 1);
  const end = addDays(returned, -1);
  if (end < start) return null;
  return { start, end };
}

function overlapDays(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): number {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  if (end < start) return 0;
  return dayDiff(start, end) + 1;
}

export type DerivedTrip = {
  raw: Trip;
  depDate: Date;
  retDate: Date;
  ongoing: boolean;
  len: number;
  flag: TripFlag;
};

export type Derived = {
  t: Date;
  rs: Date;
  trips: DerivedTrip[];
  totalAbroad: number;
  lprDays: number;
  present: number;
  presentDays: number;
  current: DerivedTrip | null;
  natz5: Date;
  natzFile: Date;
  line180: Date | null;
  line365: Date | null;
};

export function derive(profile: Profile, trips: Trip[], conservative = false): Derived {
  const t = today();
  const rs = d(profile.resident_since || isoPlain(t));
  const dtrips: DerivedTrip[] = trips
    .map((x) => {
      const depDate = d(x.departed);
      const ongoing = !x.returned;
      const retDate = ongoing ? t : d(x.returned as string);
      const len = tripAbroadDays(depDate, ongoing ? null : retDate, t, conservative);
      return { raw: x, depDate, retDate, ongoing, len, flag: tripFlag(len) };
    })
    .sort((a, b) => a.depDate.getTime() - b.depDate.getTime());

  const totalAbroad = dtrips.reduce((s, x) => s + x.len, 0);
  const lprDays = Math.max(0, dayDiff(rs, t));
  const present = Math.max(0, lprDays - totalAbroad);
  const current = dtrips.filter((x) => x.ongoing).slice(-1)[0] || null;
  const natz5 = new Date(rs.getFullYear() + 5, rs.getMonth(), rs.getDate());
  const natzFile = addDays(natz5, -90);
  const line180 = current ? addDays(current.depDate, 180) : null;
  const line365 = current ? addDays(current.depDate, 365) : null;

  return {
    t,
    rs,
    trips: dtrips,
    totalAbroad,
    lprDays,
    present,
    presentDays: present,
    current,
    natz5,
    natzFile,
    line180,
    line365,
  };
}

export const WIN_PRESETS: [string, number | null][] = [
  ["7d", 7],
  ["30d", 30],
  ["90d", 90],
  ["365d", 365],
  ["all", null],
];

export function abroadInWindow(
  D: Derived,
  nDays: number | null,
  conservative = false
): number {
  if (nDays == null) return D.totalAbroad;
  const rangeStart = addDays(D.t, -nDays);
  const rangeEnd = D.t;
  let total = 0;
  D.trips.forEach((x) => {
    const interval = abroadInterval(
      x.depDate,
      x.ongoing ? null : x.retDate,
      D.t,
      conservative
    );
    if (!interval) return;
    total += overlapDays(interval.start, interval.end, rangeStart, rangeEnd);
  });
  return total;
}

export function absenceByYear(D: Derived, conservative = false): { year: number; days: number }[] {
  const byY: Record<number, number> = {};
  D.trips.forEach((x) => {
    const interval = abroadInterval(
      x.depDate,
      x.ongoing ? null : x.retDate,
      D.t,
      conservative
    );
    if (!interval) return;
    let cursor = new Date(interval.start);
    while (cursor <= interval.end) {
      const y = cursor.getFullYear();
      byY[y] = (byY[y] || 0) + 1;
      cursor = addDays(cursor, 1);
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

export function countdownDays(from: Date, to: Date): number {
  return dayDiff(from, to);
}
