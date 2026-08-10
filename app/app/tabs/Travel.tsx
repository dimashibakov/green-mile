"use client";

import type { Derived } from "@/lib/residency";
import { byCountry, flagFromCode, iso, plural, tone } from "@/lib/residency";
import type { Trip } from "@/lib/types";
import { Hbar } from "../components/Hbar";
import { PromptBar } from "../components/PromptBar";

export function Travel({
  D, cat, onAdd, onEdit, onDelete,
}: {
  D: Derived; cat: string;
  onAdd: () => void; onEdit: (t: Trip) => void; onDelete: (id: string) => void;
}) {
  const countries = byCountry(D);
  const maxC = countries.reduce((m, c) => Math.max(m, c.days), 0);
  const over = D.trips.filter((x) => x.len >= 180).length;
  const longest = D.trips.length ? D.trips.reduce((m, x) => (x.len > m.len ? x : m), D.trips[0]) : null;

  return (
    <div className="panel-tab active" role="tabpanel">
      <PromptBar cat={cat} cmd="travel --log" />
      <div className="body">
        <div className="comment">
          // <span className="em">{D.trips.length} trips logged · {D.totalAbroad} days abroad total.</span>
        </div>

        <div className="block">
          <div className="bhead green">
            <span className="ic">🧳</span> <span className="t">trip log</span>
            <button className="act" onClick={onAdd}>+ add trip</button>
          </div>
          <div className="bsub">// each stay outside the U.S., newest first</div>
          {D.trips.length === 0 ? (
            <div className="empty">
              // no trips yet. <button className="cmd-link" onClick={onAdd}>$ add trip</button> to start your log.
            </div>
          ) : (
            D.trips.slice().reverse().map((x) => {
              const tn = tone(x.len);
              const fe = tn === "bad" ? "🔴" : tn === "warn" ? "🟠" : "🟢";
              const range = iso(x.depDate) + " → " + (x.ongoing ? "now" : iso(x.retDate));
              return (
                <div className="row" key={x.raw.id}>
                  <span className={"mark " + (x.ongoing ? "go" : "on")}>{x.ongoing ? "[•]" : "[✓]"}</span>
                  <div className="main">
                    <div className="label green">
                      {flagFromCode(x.raw.code)} {x.raw.country}
                      {x.raw.city ? " — " + x.raw.city : ""}
                    </div>
                    <div className="sub">
                      // {range} · {x.ongoing ? "ongoing · " : ""}{x.raw.reason || ""}{"  "}
                      <button className="actlink" onClick={() => onEdit(x.raw)}>[edit]</button>{" "}
                      <button className="actlink del" onClick={() => onDelete(x.raw.id)}>[del]</button>
                    </div>
                  </div>
                  <div className="metric">{x.len}d {fe}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="block">
          <div className="bhead blue"><span className="ic">🌍</span> <span className="t">by country</span></div>
          <div className="bsub">// total days absent, per destination</div>
          {countries.length === 0 ? (
            <div className="empty">// nothing logged yet.</div>
          ) : (
            countries.map((c) => (
              <Hbar
                key={c.key}
                k={(c.code || c.key.slice(0, 2)).toLowerCase()}
                pct={maxC ? Math.round((c.days / maxC) * 100) : 0}
                val={c.days + "d · " + c.trips}
              />
            ))
          )}
        </div>

        <div className="block">
          <div className="bhead orange"><span className="ic">📐</span> <span className="t">stats</span></div>
          <div className="bsub">// how your trips stack up against the limits</div>
          <div className="kv"><span className="k">total trips</span><span className="v">{D.trips.length}</span></div>
          <div className="kv"><span className="k">days abroad</span><span className="v">{plural(D.totalAbroad, "day")}</span></div>
          <div className="kv"><span className="k">longest trip</span>
            <span className="v">{longest ? longest.len + "d · " + longest.raw.country + " (" + iso(longest.depDate) + ")" : "—"}</span></div>
          <div className="kv"><span className="k">avg trip</span>
            <span className="v">{D.trips.length ? plural(Math.round(D.totalAbroad / D.trips.length), "day") : "—"}</span></div>
          <div className="kv"><span className="k">over 180d</span>
            <span className={"v " + (over ? "r" : "g")}>{over} trips</span></div>
        </div>
      </div>
    </div>
  );
}
