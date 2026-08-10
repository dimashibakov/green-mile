"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Trip } from "@/lib/types";
import { derive, iso } from "@/lib/residency";
import { Summary } from "./tabs/Summary";
import { Status } from "./tabs/Status";
import { Travel } from "./tabs/Travel";
import { Alerts } from "./tabs/Alerts";
import { TripModal, type TripInput } from "./components/TripModal";
import { ProfileModal, type ProfileInput } from "./components/ProfileModal";
import { saveTrip, deleteTrip, saveProfile, logout } from "./actions";

type Tab = "summary" | "status" | "travel" | "alerts";

export function AppClient({ profile, trips }: { profile: Profile; trips: Trip[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("summary");
  const [tripModal, setTripModal] = useState<{ open: boolean; trip: Trip | null }>({ open: false, trip: null });
  const [profileOpen, setProfileOpen] = useState(false);

  const cat = profile.category || "E16";
  const D = useMemo(() => derive(profile, trips), [profile, trips]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  function onSaveTrip(v: TripInput) {
    setTripModal({ open: false, trip: null });
    startTransition(async () => { await saveTrip(v); router.refresh(); });
  }
  function onDeleteTrip(id: string) {
    setTripModal({ open: false, trip: null });
    startTransition(async () => { await deleteTrip(id); router.refresh(); });
  }
  function onSaveProfile(v: ProfileInput) {
    setProfileOpen(false);
    startTransition(async () => { await saveProfile(v); router.refresh(); });
  }

  function exportData() {
    try {
      const payload = { profile, trips };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "green-mile-data.json";
      a.click();
    } catch {
      /* no-op */
    }
  }

  return (
    <main className="device" role="application" aria-label="Green Mile">
      <div className="appbar">
        <span className="who">
          <span className="dot">●</span> {profile.handle || "resident"} <span className="cat">· {cat}</span>
        </span>
        <span className="spacer"></span>
        <button className="mini" onClick={() => setProfileOpen(true)} title="edit profile">⚙ profile</button>
        <button className="mini logout" onClick={() => startTransition(() => { logout(); })} title="sign out">⏻ logout</button>
      </div>

      <div className="tabs" role="tablist" aria-label="Views">
        {(["summary", "status", "travel", "alerts"] as Tab[]).map((t) => (
          <button
            key={t}
            className="tab"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "summary" && <Summary D={D} cat={cat} />}
      {tab === "status" && <Status D={D} profile={profile} cat={cat} onEditProfile={() => setProfileOpen(true)} />}
      {tab === "travel" && (
        <Travel
          D={D}
          cat={cat}
          onAdd={() => setTripModal({ open: true, trip: null })}
          onEdit={(t) => setTripModal({ open: true, trip: t })}
          onDelete={onDeleteTrip}
        />
      )}
      {tab === "alerts" && <Alerts D={D} cat={cat} />}

      <div className="foot">// working tracker, not legal advice · data as of <b>{iso(D.t)}</b></div>

      <TripModal
        open={tripModal.open}
        trip={tripModal.trip}
        onSave={onSaveTrip}
        onDelete={onDeleteTrip}
        onClose={() => setTripModal({ open: false, trip: null })}
      />
      <ProfileModal
        open={profileOpen}
        profile={profile}
        onSave={onSaveProfile}
        onClose={() => setProfileOpen(false)}
      />
    </main>
  );
}
