"use client";

import { useEffect, useState } from "react";
import type { Trip } from "@/lib/types";
import { d } from "@/lib/residency";

export type TripInput = {
  id?: string;
  country: string; city: string; code: string;
  departed: string; returned: string; reason: string;
};

export function TripModal({
  open, trip, onSave, onDelete, onClose,
}: {
  open: boolean;
  trip: Trip | null;
  onSave: (v: TripInput) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [code, setCode] = useState("");
  const [departed, setDeparted] = useState("");
  const [returned, setReturned] = useState("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setErr("");
    setCountry(trip?.country || "");
    setCity(trip?.city || "");
    setCode(trip?.code || "");
    setDeparted(trip?.departed || "");
    setReturned(trip?.returned || "");
    setReason(trip?.reason || "");
  }, [open, trip]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function save() {
    const c = country.trim();
    if (!c) return setErr("// error: country is required.");
    if (!departed) return setErr("// error: set a departure date.");
    if (returned && d(returned) < d(departed)) return setErr("// error: return is before departure.");
    onSave({ id: trip?.id, country: c, city: city.trim(), code: code.trim(), departed, returned, reason: reason.trim() });
  }

  return (
    <div className={"overlay" + (open ? " active" : "")} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="titlebar">
          <span className="tt"><span className="hash">#</span> {trip ? "edit trip" : "add trip"}</span>
          <button className="x" onClick={onClose}>[x]</button>
        </div>
        <div className="mbody">
          <div className="field">
            <label className="lbl">country <span style={{ color: "var(--green)" }}>&gt;</span></label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Russia" />
          </div>
          <div className="field two">
            <div>
              <label className="lbl">city <span style={{ color: "var(--green)" }}>&gt;</span></label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Moscow" />
            </div>
            <div>
              <label className="lbl">code <span style={{ color: "var(--green)" }}>&gt;</span></label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ru" maxLength={2} />
            </div>
          </div>
          <div className="field two">
            <div>
              <label className="lbl">departed <span style={{ color: "var(--green)" }}>&gt;</span></label>
              <input type="date" value={departed} onChange={(e) => setDeparted(e.target.value)} />
            </div>
            <div>
              <label className="lbl">returned <span style={{ color: "var(--green)" }}>&gt;</span></label>
              <input type="date" value={returned} onChange={(e) => setReturned(e.target.value)} />
            </div>
          </div>
          <div className="comment" style={{ margin: "-4px 0 6px" }}>
            // leave &quot;returned&quot; empty if the trip is still ongoing.
          </div>
          <div className="field">
            <label className="lbl">reason <span style={{ color: "var(--green)" }}>&gt;</span></label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="family · medical · work" />
          </div>
          <div className="err">{err}</div>
          <div className="btnrow">
            <button className="btn primary" onClick={save}>[ save ]</button>
            <button className="btn" onClick={onClose}>[ cancel ]</button>
            <span style={{ flex: 1 }}></span>
            {trip && (
              <button className="btn danger" onClick={() => onDelete(trip.id)}>[ delete ]</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
