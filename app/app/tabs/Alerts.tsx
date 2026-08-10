"use client";

import type { Derived } from "@/lib/residency";
import { addDays, daysB, iso } from "@/lib/residency";
import { PromptBar } from "../components/PromptBar";

type Alert = { c: string; i: string; h: string; d: React.ReactNode };

export function Alerts({ D, cat }: { D: Derived; cat: string }) {
  const anyOver = D.trips.some((x) => x.len >= 180);
  const alerts: Alert[] = [];

  if (!anyOver) {
    alerts.push({ c: "ok", i: "🟢", h: "Status clear", d: `No trip has crossed 180 days. ${D.present} in-US days banked.` });
  } else {
    alerts.push({ c: "warn", i: "⚠️", h: "A trip crossed 180 days", d: "Review continuous-residence impact with an attorney." });
  }

  if (D.current) {
    const l180 = addDays(D.current.depDate, 180);
    const u180 = daysB(D.t, l180);
    const watch = D.current.len >= 150;
    alerts.push({
      c: watch ? "watch" : "info",
      i: watch ? "⏳" : "✈️",
      h: "Current trip · day " + D.current.len,
      d: (
        <>
          180-day line {iso(l180)} — <span className="code">{u180} days</span> away. 1-year line {iso(addDays(D.current.depDate, 365))}.
        </>
      ),
    });
  }

  alerts.push({
    c: "info", i: "📄", h: "Planning 6+ months away?",
    d: (<>File Form I-131 (re-entry permit) <span className="code">before</span> leaving — it can only be filed from inside the U.S.</>),
  });

  const natzLeft = daysB(D.t, D.natzFile);
  alerts.push({
    c: "goal", i: "🗽", h: "Naturalization on the horizon",
    d: `Eligible to file N-400 around ${iso(D.natzFile)} — ~${Math.round(natzLeft / 30)} months out. Keep banking in-US days.`,
  });

  return (
    <div className="panel-tab active" role="tabpanel">
      <PromptBar cat={cat} cmd="alerts" />
      <div className="body">
        <div className="comment">// live notices from your travel &amp; residency data.</div>

        <div className="block">
          <div className="bhead pink"><span className="ic">🔔</span> <span className="t">notifications</span></div>
          <div className="bsub">// what needs your attention right now</div>
          {alerts.map((a, i) => (
            <div className={"alert " + a.c} key={i}>
              <span className="ai">{a.i}</span>
              <div className="at">
                <div className="h">{a.h}</div>
                <div className="d">{a.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="block">
          <div className="bhead green"><span className="ic">💡</span> <span className="t">safety checklist</span></div>
          <div className="bsub">// habits that keep your status clean</div>
          {[
            ["on", "Keep every trip under 180 days", "// the CBP scrutiny + continuous-residence line"],
            ["on", "File taxes as a resident — Form 1040", "// never 1040-NR; it reads as abandonment"],
            ["", "Keep proof each trip is temporary", "// medical records, return tickets, U.S. ties"],
            ["", "Before any 6+ month trip: file Form I-131", "// re-entry permit — must be filed from inside the U.S."],
            ["", "Review long trips + CFC with an attorney", "// one consult before extended absences"],
          ].map(([m, label, sub], i) => (
            <div className="row" key={i}>
              <span className={"mark " + (m ? "on" : "")}>{m ? "[✓]" : "[ ]"}</span>
              <div className="main">
                <div className="label">{label}</div>
                <div className="sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="block">
          <div className="bhead blue"><span className="ic">📏</span> <span className="t">the thresholds</span></div>
          <div className="bsub">// the three lines that matter</div>
          <div className="row"><span className="mark on">[✓]</span><div className="main">
            <div className="label green">under 180 days / trip</div>
            <div className="sub">// low risk. questions possible, no presumption</div></div></div>
          <div className="row"><span className="mark go">[!]</span><div className="main">
            <div className="label orange">180 days – 1 year / trip</div>
            <div className="sub">// secondary inspection + rebuttable presumption</div></div></div>
          <div className="row"><span className="mark warn">[x]</span><div className="main">
            <div className="label red">over 1 year / trip</div>
            <div className="sub">// card invalid as travel doc; needs I-131 or SB-1</div></div></div>
        </div>
      </div>
    </div>
  );
}
