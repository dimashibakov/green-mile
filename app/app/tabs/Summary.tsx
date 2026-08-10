"use client";

import { useState } from "react";
import type { Derived } from "@/lib/residency";
import {
  PRESENCE_NEEDED, WIN_PRESETS, abroadInWindow, absenceByYear, addDays, daysB, plural,
} from "@/lib/residency";
import { Gauge } from "../components/Gauge";
import { Hbar } from "../components/Hbar";
import { PromptBar } from "../components/PromptBar";

export function Summary({ D, cat }: { D: Derived; cat: string }) {
  const [win, setWin] = useState("all");
  const anyOver = D.trips.some((x) => x.len >= 180);
  const ppPct = Math.min(1, D.present / PRESENCE_NEEDED);
  const winDays = (WIN_PRESETS.find((p) => p[0] === win) || ["all", null])[1] as number | null;
  const years = absenceByYear(D);
  const maxY = years.reduce((m, y) => Math.max(m, y.days), 0);

  return (
    <div className="panel-tab active" role="tabpanel">
      <PromptBar cat={cat} cmd="summary" />
      <div className="body">
        <div className="comment">
          // <span className="em">{anyOver ? "a trip needs a closer look." : "all clear. keep banking in-US days."}</span>
        </div>

        <div className="block">
          <div className="bhead green"><span className="ic">👁</span> <span className="t">lifetime overview</span></div>
          <div className="bsub">// counted from your resident-since date</div>
          <div className="kv"><span className="k">days as resident</span><span className="v g">{plural(D.lprDays, "day")}</span></div>
          <div className="kv"><span className="k">in-US days</span><span className="v g">{plural(D.present, "day")}</span></div>
          <div className="kv"><span className="k">days abroad</span><span className="v">{plural(D.totalAbroad, "day")}</span></div>
          <div className="kv"><span className="k">trips logged</span><span className="v">{D.trips.length}</span></div>
        </div>

        <div className="block">
          <div className="bhead orange"><span className="ic">🔥</span> <span className="t">standing</span></div>
          <div className="bsub">// current risk posture</div>
          <div className="kv"><span className="k">status</span>
            <span className={"v " + (anyOver ? "o" : "g")}>{anyOver ? "🟠 review needed" : "🟢 clear"}</span></div>
          <div className="kv"><span className="k">current trip</span>
            <span className="v">{D.current ? "day " + D.current.len + " · " + D.current.raw.country : "in the U.S."}</span></div>
          <div className="kv"><span className="k">nearest limit</span>
            <span className="v">{D.current ? "180d in " + plural(daysB(D.t, addDays(D.current.depDate, 180)), "day") : "no active trip"}</span></div>
        </div>

        <div className="block">
          <div className="bhead blue"><span className="ic">🗓</span> <span className="t">data window</span></div>
          <div className="bsub">// days abroad within a chosen range</div>
          <div className="presets">
            {WIN_PRESETS.map(([label]) => (
              <button key={label} className="preset" aria-pressed={win === label} onClick={() => setWin(label)}>
                [{label}]
              </button>
            ))}
          </div>
          <div className="kv"><span className="k">abroad in window</span>
            <span className="v o">{plural(abroadInWindow(D, winDays), "day")}  [{win}]</span></div>
        </div>

        <div className="block">
          <div className="bhead green"><span className="ic">📊</span> <span className="t">presence toward 913</span></div>
          <div className="bsub">// naturalization physical-presence minimum</div>
          <Gauge pct={ppPct} tone="ok" left={D.present + " / " + PRESENCE_NEEDED} right={Math.round(ppPct * 100) + "%"} />
        </div>

        <div className="block">
          <div className="bhead purple"><span className="ic">📅</span> <span className="t">absence by year</span></div>
          <div className="bsub">// how your days abroad spread across the calendar</div>
          {years.length === 0 ? (
            <div className="empty">// no absences recorded.</div>
          ) : (
            years.map((y) => (
              <Hbar key={y.year} k={String(y.year)} pct={maxY ? Math.round((y.days / maxY) * 100) : 0} val={y.days + "d"} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
