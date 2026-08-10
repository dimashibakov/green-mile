"use client";

export function Hbar({ k, pct, val }: { k: string; pct: number; val: string }) {
  return (
    <div className="hbar">
      <span className="hb-key">{k}</span>
      <span className="hb-track">
        <span className="hb-fill" style={{ width: pct + "%" }}></span>
      </span>
      <span className="hb-val">{val}</span>
    </div>
  );
}
