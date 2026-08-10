"use client";

import type { Derived } from "@/lib/residency";
import {
  PRESENCE_NEEDED, WD, addDays, daysB, flagFromCode, iso, plural, tone,
} from "@/lib/residency";
import { catLabel } from "@/lib/categories";
import type { Profile } from "@/lib/types";
import { Gauge } from "../components/Gauge";
import { PromptBar } from "../components/PromptBar";

export function Status({
  D, profile, cat, onEditProfile,
}: {
  D: Derived; profile: Profile; cat: string; onEditProfile: () => void;
}) {
  const ppPct = Math.min(1, D.present / PRESENCE_NEEDED);
  const natzLeft = daysB(D.t, D.natzFile);

  let current = null;
  if (D.current) {
    const cLen = D.current.len;
    const tn = tone(cLen);
    const line180 = addDays(D.current.depDate, 180);
    const line365 = addDays(D.current.depDate, 365);
    current = (
      <>
        <div className="row">
          <span className="mark go">[•]</span>
          <div className="main">
            <div className="label orange">
              {flagFromCode(D.current.raw.code)} Abroad — {D.current.raw.country}
              {D.current.raw.city ? " (" + D.current.raw.city + ")" : ""}
            </div>
            <div className="sub">departed {iso(D.current.depDate)} · in progress</div>
          </div>
          <div className="metric">{cLen}d</div>
        </div>
        <Gauge pct={Math.min(1, cLen / 180)} tone={tn} left={"day " + cLen + " of 180"} right={Math.round(Math.min(1, cLen / 180) * 100) + "%"} />
        <hr className="sep" />
        <div className="kv"><span className="k">180-day line</span>
          <span className="v o">{iso(line180)}  ·  in {plural(daysB(D.t, line180), "day")}</span></div>
        <div className="kv"><span className="k">1-year line</span>
          <span className="v r">{iso(line365)}  ·  in {plural(daysB(D.t, line365), "day")}</span></div>
      </>
    );
  } else {
    current = <div className="empty">// not abroad right now.</div>;
  }

  const headline = D.current
    ? D.current.len >= 180
      ? "current trip has passed 180 days — review status."
      : D.current.len >= 150
      ? "current trip nearing the 180-day line."
      : "no trip near any limit. you’re clear."
    : "currently in the U.S. no active trip.";

  return (
    <div className="panel-tab active" role="tabpanel">
      <PromptBar cat={cat} cmd="status" />
      <div className="body">
        <div className="comment">// lawful permanent resident. <span className="em">{headline}</span></div>
        <div className="metaline">🗓 {WD[D.t.getDay()]}  {iso(D.t)}</div>
        <div className="badges">🟢 <b>LPR active</b> &nbsp;·&nbsp; 🔥 <b>{D.present}</b> in-US days</div>

        <div className="block">
          <div className="bhead blue">
            <span className="ic">🪪</span> <span className="t">green card</span>
            <button className="act" onClick={onEditProfile}>edit</button>
          </div>
          <div className="bsub">// permanent resident card (form i-551)</div>
          <div className="kv"><span className="k">category</span><span className="v b">{catLabel(cat)}</span></div>
          <div className="kv"><span className="k">resident since</span><span className="v g">{iso(D.rs)}</span></div>
          <div className="kv"><span className="k">card expires</span>
            <span className="v">{profile.card_expires ? iso(new Date(profile.card_expires + "T00:00:00")) : "—"}</span></div>
          <div className="kv"><span className="k">type</span><span className="v">permanent · unconditional</span></div>
        </div>

        <div className="block">
          <div className="bhead orange">
            <span className="ic">✈️</span> <span className="t">current trip</span>
            <span className="count">{D.current ? "day " + D.current.len : "none"}</span>
          </div>
          <div className="bsub">// tracking against the 180-day scrutiny line</div>
          {current}
        </div>

        <div className="block">
          <div className="bhead green"><span className="ic">📊</span> <span className="t">physical presence</span></div>
          <div className="bsub">// toward the 913-day naturalization minimum</div>
          <Gauge pct={ppPct} tone="ok" left={D.present + " / " + PRESENCE_NEEDED + " days"} right={Math.round(ppPct * 100) + "%"} />
          <div className="kv"><span className="k">in-US days</span><span className="v g">{plural(D.present, "day")}</span></div>
          <div className="kv"><span className="k">days abroad</span><span className="v">{plural(D.totalAbroad, "day")}</span></div>
          <div className="kv"><span className="k">as resident</span><span className="v">{plural(D.lprDays, "day")}</span></div>
        </div>

        <div className="block">
          <div className="bhead purple"><span className="ic">🗽</span> <span className="t">naturalization</span></div>
          <div className="bsub">// general provision · 5-year path</div>
          <div className="kv"><span className="k">5-year mark</span><span className="v p">{iso(D.natz5)}</span></div>
          <div className="kv"><span className="k">n-400 earliest</span><span className="v p">~{iso(D.natzFile)}</span></div>
          <div className="kv"><span className="k">countdown</span>
            <span className="v">{natzLeft > 0 ? "in ~" + plural(natzLeft, "day") + " (" + Math.round(natzLeft / 30) + " mo)" : "eligible now"}</span></div>
        </div>
      </div>
    </div>
  );
}
