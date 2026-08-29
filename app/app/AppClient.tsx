"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Trip } from "@/lib/types";
import { derive, iso } from "@/lib/residency";
import { Summary } from "./tabs/Summary";
import { Status } from "./tabs/Status";
import { Travel } from "./tabs/Travel";
import { Alerts } from "./tabs/Alerts";
import { TripModal, type TripInput } from "./components/TripModal";
import { ProfileModal, type ProfileInput } from "./components/ProfileModal";
import { AppBar } from "./components/AppBar";
import { StatusStrip } from "./components/StatusStrip";
import { saveTrip, deleteTrip, saveProfile, logout } from "./actions";
import { setTheme as persistTheme } from "@/app/actions/theme";

type Tab = "summary" | "status" | "travel" | "alerts";
type Theme = "dark" | "light";

export function AppClient({ profile, trips }: { profile: Profile; trips: Trip[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("summary");
  const [tripModal, setTripModal] = useState<{ open: boolean; trip: Trip | null }>({ open: false, trip: null });
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme((document.documentElement.getAttribute("data-theme") as Theme) || "dark");
  }, []);

  const cat = profile.category || "E16";
  const D = useMemo(() => derive(profile, trips), [profile, trips]);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    void persistTheme(next);
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

  function exportJson() {
    window.location.href = "/app/export";
  }

  function exportPdf() {
    window.location.href = "/app/export/pdf";
  }

  return (
    <main className="device" role="application" aria-label="Green Mile">
      <AppBar
        handle={profile.handle || "resident"}
        category={cat}
        onAddTrip={() => setTripModal({ open: true, trip: null })}
        onProfile={() => setProfileOpen(true)}
        onExportJson={exportJson}
        onExportPdf={exportPdf}
        onLogout={() => startTransition(() => { logout(); })}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "light" : "dark"}
      />
      <StatusStrip D={D} />

      <div className="tabs" role="tablist" aria-label="Views">
        {(["summary", "status", "travel", "alerts"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className="tab"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "summary" && <Summary D={D} cat={cat} onExport={exportJson} />}
      {tab === "status" && (
        <Status D={D} profile={profile} cat={cat} onEditProfile={() => setProfileOpen(true)} onExport={exportJson} />
      )}
      {tab === "travel" && (
        <Travel
          D={D}
          cat={cat}
          onExport={exportJson}
          onAdd={() => setTripModal({ open: true, trip: null })}
          onEdit={(t) => setTripModal({ open: true, trip: t })}
          onDelete={onDeleteTrip}
        />
      )}
      {tab === "alerts" && <Alerts D={D} cat={cat} onExport={exportJson} />}

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
