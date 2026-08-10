"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { CAT_ORDER, CAT_LABELS } from "@/lib/categories";

export type ProfileInput = {
  handle: string; category: string; resident_since: string; card_expires: string;
};

export function ProfileModal({
  open, profile, onSave, onClose,
}: {
  open: boolean;
  profile: Profile;
  onSave: (v: ProfileInput) => void;
  onClose: () => void;
}) {
  const [handle, setHandle] = useState("");
  const [category, setCategory] = useState("E16");
  const [since, setSince] = useState("");
  const [exp, setExp] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setErr("");
    setHandle(profile.handle || "");
    setCategory(profile.category || "E16");
    setSince(profile.resident_since || "");
    setExp(profile.card_expires || "");
  }, [open, profile]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function save() {
    if (!since) return setErr("// error: resident-since date is required.");
    onSave({ handle: handle.trim() || "resident", category, resident_since: since, card_expires: exp });
  }

  return (
    <div className={"overlay" + (open ? " active" : "")} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="titlebar">
          <span className="tt"><span className="hash">#</span> edit profile</span>
          <button className="x" onClick={onClose}>[x]</button>
        </div>
        <div className="mbody">
          <div className="field">
            <label className="lbl">handle <span style={{ color: "var(--green)" }}>&gt;</span></label>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="dima" />
          </div>
          <div className="field">
            <label className="lbl">gc category <span style={{ color: "var(--green)" }}>&gt;</span></label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CAT_ORDER.map((c) => (
                <option key={c} value={c}>
                  {c}{CAT_LABELS[c] ? "  ·  " + CAT_LABELS[c] : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="field two">
            <div>
              <label className="lbl">resident since <span style={{ color: "var(--green)" }}>&gt;</span></label>
              <input type="date" value={since} onChange={(e) => setSince(e.target.value)} />
            </div>
            <div>
              <label className="lbl">card expires <span style={{ color: "var(--green)" }}>&gt;</span></label>
              <input type="date" value={exp} onChange={(e) => setExp(e.target.value)} />
            </div>
          </div>
          <div className="err">{err}</div>
          <div className="btnrow">
            <button className="btn primary" onClick={save}>[ save ]</button>
            <button className="btn" onClick={onClose}>[ cancel ]</button>
          </div>
        </div>
      </div>
    </div>
  );
}
