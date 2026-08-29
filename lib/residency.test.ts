import { describe, expect, it } from "vitest";
import {
  abroadInWindow,
  absenceByYear,
  addDays,
  d,
  dayDiff,
  derive,
  PRESENCE_NEEDED,
  tripAbroadDays,
  tripFlag,
  tone,
} from "./residency";
import type { Profile, Trip } from "./types";

const profile: Profile = {
  id: "u1",
  handle: "dima",
  category: "E16",
  resident_since: "2020-01-01",
  card_expires: "2030-01-01",
};

function mkTrip(partial: Partial<Trip> & Pick<Trip, "departed">): Trip {
  return {
    id: partial.id ?? "t1",
    user_id: "u1",
    country: partial.country ?? "Russia",
    city: partial.city ?? null,
    code: partial.code ?? "ru",
    departed: partial.departed,
    returned: partial.returned ?? null,
    reason: partial.reason ?? null,
  };
}

describe("tripAbroadDays (USCIS exact)", () => {
  it("counts zero on departure day for same-day return", () => {
    const dep = d("2024-06-01");
    expect(tripAbroadDays(dep, d("2024-06-01"), dep)).toBe(0);
  });

  it("counts days between for completed trip (dep/return present in U.S.)", () => {
    const dep = d("2024-06-01");
    const ret = d("2024-06-10");
    // Jun 2–9 abroad = 8 days
    expect(tripAbroadDays(dep, ret, dep)).toBe(8);
    expect(dayDiff(dep, ret) - 1).toBe(8);
  });

  it("counts ongoing trip from departure to today", () => {
    const dep = d("2024-06-01");
    const today = d("2024-06-03");
    expect(tripAbroadDays(dep, null, today)).toBe(2);
  });

  it("conservative mode matches prototype inclusive span", () => {
    const dep = d("2024-06-01");
    const ret = d("2024-06-10");
    expect(tripAbroadDays(dep, ret, dep, true)).toBe(9);
  });
});

describe("tripFlag / tone thresholds", () => {
  it("maps 180/365 boundaries", () => {
    expect(tripFlag(179)).toBe("near-180");
    expect(tripFlag(180)).toBe("over-180");
    expect(tripFlag(364)).toBe("over-180");
    expect(tripFlag(365)).toBe("over-year");
    expect(tone(180)).toBe("bad");
    expect(tone(150)).toBe("warn");
    expect(tone(100)).toBe("ok");
  });
});

describe("derive", () => {
  it("computes present days toward 913", () => {
    const trips = [mkTrip({ departed: "2024-01-02", returned: "2024-01-05" })];
    const D = derive(profile, trips);
    // Jan 3–4 abroad (dep Jan 2, ret Jan 5 both present)
    expect(D.totalAbroad).toBe(2);
    expect(D.present).toBe(D.lprDays - 2);
    expect(D.present).toBeLessThanOrEqual(D.lprDays);
  });

  it("tracks ongoing current trip and 180/365 lines", () => {
    const trips = [mkTrip({ departed: "2026-01-01", returned: null })];
    const D = derive(profile, trips);
    expect(D.current).not.toBeNull();
    expect(D.line180).toEqual(addDays(d("2026-01-01"), 180));
    expect(D.line365).toEqual(addDays(d("2026-01-01"), 365));
  });
});

describe("abroadInWindow", () => {
  it("sums overlap inside window only", () => {
    const trips = [mkTrip({ departed: "2024-01-01", returned: "2024-01-20" })];
    const D = derive(profile, trips);
    const in7 = abroadInWindow(D, 7);
    expect(in7).toBeGreaterThanOrEqual(0);
    expect(in7).toBeLessThanOrEqual(D.totalAbroad);
  });

  it("returns total when window is all", () => {
    const trips = [mkTrip({ departed: "2024-01-01", returned: "2024-01-10" })];
    const D = derive(profile, trips);
    expect(abroadInWindow(D, null)).toBe(D.totalAbroad);
  });
});

describe("absenceByYear", () => {
  it("splits a cross-year trip", () => {
    const trips = [mkTrip({ departed: "2023-12-20", returned: "2024-01-10" })];
    const D = derive(profile, trips);
    const years = absenceByYear(D);
    expect(years.some((y) => y.year === 2023)).toBe(true);
    expect(years.some((y) => y.year === 2024)).toBe(true);
    expect(years.reduce((s, y) => s + y.days, 0)).toBe(D.totalAbroad);
  });
});

describe("PRESENCE_NEEDED", () => {
  it("is 913", () => {
    expect(PRESENCE_NEEDED).toBe(913);
  });
});
