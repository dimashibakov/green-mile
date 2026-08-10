"use client";

export function Gauge({
  pct,
  tone = "ok",
  left,
  right,
  n = 20,
}: {
  pct: number;
  tone?: "ok" | "warn" | "bad";
  left: string;
  right: string;
  n?: number;
}) {
  const filled = Math.max(0, Math.min(n, Math.round(pct * n)));
  const rightCls = tone === "bad" ? "pct bad" : tone === "warn" ? "pct warn" : "pct";
  return (
    <div className="gauge">
      <div className="cells" aria-hidden="true">
        {Array.from({ length: n }).map((_, i) => {
          let cls = "cell";
          if (i < filled) {
            cls += " f";
            if (tone === "warn") cls += " warnc";
            if (tone === "bad") cls += " badc";
          }
          return <span key={i} className={cls}></span>;
        })}
      </div>
      <div className="glabel">
        <span>{left}</span>
        <span className={rightCls}>{right}</span>
      </div>
    </div>
  );
}
