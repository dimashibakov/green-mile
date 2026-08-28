import type { Derived } from "@/lib/residency";
import { PRESENCE_NEEDED, addDays, dayDiff } from "@/lib/residency";

export function StatusStrip({ D }: { D: Derived }) {
  const anyOver = D.trips.some((x) => x.len >= 180);
  const ppPct = Math.min(1, D.present / PRESENCE_NEEDED);

  return (
    <div className="strip" aria-label="status summary">
      {anyOver ? (
        <>
          🟠 <b className="o">review</b>
        </>
      ) : (
        <>
          🟢 <b className="g">clear</b>
        </>
      )}
      <span className="sep">·</span>
      {D.current ? (
        <>
          trip <b className="o">d{D.current.len}</b>
        </>
      ) : (
        <b>in U.S.</b>
      )}
      <span className="sep">·</span>
      {D.current ? (
        <>
          180 in <b>{dayDiff(D.t, addDays(D.current.depDate, 180))}d</b>
        </>
      ) : (
        "no active trip"
      )}
      <span className="sep">·</span>
      913 <b className="g">{Math.round(ppPct * 100)}%</b>
    </div>
  );
}
