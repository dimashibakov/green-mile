"use client";

import { useEffect, useRef, useState } from "react";

type AppBarProps = {
  handle: string;
  category: string;
  onAddTrip: () => void;
  onProfile: () => void;
  onExport: () => void;
  onLogout: () => void;
  onToggleTheme?: () => void;
  themeLabel?: string;
};

export function AppBar({
  handle,
  category,
  onAddTrip,
  onProfile,
  onExport,
  onLogout,
  onToggleTheme,
  themeLabel,
}: AppBarProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="appbar">
      <span className="who">
        <span className="dot">●</span> {handle}{" "}
        <span className="cat">· {category}</span>
      </span>
      <span className="spacer"></span>
      <button type="button" className="addbtn" onClick={onAddTrip} title="add trip">
        + add trip
      </button>
      <div className="ovfwrap" ref={wrapRef}>
        <button
          type="button"
          className="ovfbtn"
          aria-haspopup="true"
          aria-expanded={open}
          title="more"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          ⋯
        </button>
        <div className="ovf" role="menu" hidden={!open}>
          <button type="button" className="oi" role="menuitem" onClick={() => { onProfile(); setOpen(false); }}>
            <span className="k">⚙</span> profile
          </button>
          <button type="button" className="oi" role="menuitem" onClick={() => { onExport(); setOpen(false); }}>
            <span className="k">⤴</span> export
          </button>
          {onToggleTheme && (
            <button type="button" className="oi" role="menuitem" onClick={() => { onToggleTheme(); setOpen(false); }}>
              <span className="k">☀</span> {themeLabel ?? "theme"}
            </button>
          )}
          <button
            type="button"
            className="oi logout"
            role="menuitem"
            onClick={() => { onLogout(); setOpen(false); }}
          >
            <span className="k">⏻</span> logout
          </button>
        </div>
      </div>
    </div>
  );
}
