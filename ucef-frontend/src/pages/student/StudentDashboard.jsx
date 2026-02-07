// StudentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import ParticipationTimeline from "../../components/participation/ParticipationTimeline";
import CertificateCard from "../../components/participation/CertificateCard";
import StatCard from "../../components/common/StatCard";
import QRScanner from "../../components/common/QRScanner";

import { fetchMyParticipation } from "../../services/participationService";
import { logout, fetchMyProfile } from "../../services/authStudent";

import {
  LayoutDashboard,
  Clock,
  Award,
  QrCode,
  User,
  LogOut,
  Pencil,
  Save,
  X,
  Menu,
} from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "certificates", label: "Certificates", icon: Award },
  { key: "qr-scanner", label: "QR Scanner", icon: QrCode },
];

const StudentDashboard = () => {
  const [participations, setParticipations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProfile, setEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    (async () => {
      try {
        const profileData = await fetchMyProfile();
        setProfile(profileData);

        const data = await fetchMyParticipation();
        const mapped = (data?.records || []).map((r) => ({
          eventId: r.event_id,
          eventName: r.event_title,
          club: r.club_name,
          year: new Date(r.start_time).getFullYear(),
          participationState: r.participation_state,
          attendancePercentage:
            r.attendance_status === "Present" ? 100 : null,
          certificateId: r.verification_code || null,
          explanation: r.explanation,
        }));

        setParticipations(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= STATS ================= */
    const stats = useMemo(() => {
      const totalRegistered = participations.length;

      const totalAttended = participations.filter(
        (p) => p.participationState === "Attended" || p.participationState === "Certified"
      ).length;

      const totalCertified = participations.filter(
        (p) => p.participationState === "Certified"
      ).length;

      // Club-wise summary
      const clubMap = new Map();
      for (const p of participations) {
        const key = p.club || "Unknown Club";
        if (!clubMap.has(key)) {
          clubMap.set(key, { club: key, registered: 0, attended: 0, certified: 0 });
        }
        const row = clubMap.get(key);
        row.registered += 1;
        if (p.participationState === "Attended" || p.participationState === "Certified") row.attended += 1;
        if (p.participationState === "Certified") row.certified += 1;
      }
      const clubSummary = Array.from(clubMap.values()).sort((a, b) => b.registered - a.registered);

      // Year-wise summary
      const yearMap = new Map();
      for (const p of participations) {
        const y = p.year || "Unknown";
        if (!yearMap.has(y)) {
          yearMap.set(y, { year: y, registered: 0, attended: 0, certified: 0 });
        }
        const row = yearMap.get(y);
        row.registered += 1;
        if (p.participationState === "Attended" || p.participationState === "Certified") row.attended += 1;
        if (p.participationState === "Certified") row.certified += 1;
      }
      const yearSummary = Array.from(yearMap.values()).sort((a, b) => Number(b.year) - Number(a.year));

      return {
        totalRegistered,
        totalAttended,
        totalCertified,
        clubSummary,
        yearSummary,
      };
    }, [participations]);


  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white">
        <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white">

      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/70 backdrop-blur">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <p className="font-semibold">Student Dashboard</p>
        <div className="w-6" />
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">

        {/* ================= SIDEBAR ================= */}
        <Sidebar
          profile={profile}
          activeTab={activeTab}
          setActiveTab={(t) => {
            setActiveTab(t);
            setSidebarOpen(false);
          }}
          onLogout={handleLogout}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ================= MAIN CONTENT ================= */}
        <main className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
          <h1 className="text-3xl font-bold mb-6">
            {TABS.find((t) => t.key === activeTab)?.label}
          </h1>

      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Top stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Registered" value={stats.totalRegistered} />
            <StatCard title="Total Attended" value={stats.totalAttended} />
            <StatCard title="Total Certified" value={stats.totalCertified} />
          </div>

          {/* Year-wise cards */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Year-wise Summary</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Participation breakdown by academic year.
                </p>
              </div>
            </div>

            {stats.yearSummary.length === 0 ? (
              <p className="text-gray-400 mt-4">No participation history yet.</p>
            ) : (
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.yearSummary.map((y) => (
                  <div
                    key={String(y.year)}
                    className="bg-black/25 border border-white/10 rounded-2xl p-4"
                  >
                    <p className="text-sm text-gray-400">Year</p>
                    <p className="text-2xl font-bold mt-1">{y.year}</p>

                    <div className="mt-4 space-y-2 text-sm">
                      <RowMini label="Registered" value={y.registered} />
                      <RowMini label="Attended" value={y.attended} />
                      <RowMini label="Certified" value={y.certified} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Club-wise summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-semibold">Club-wise Summary</h2>
              <p className="text-sm text-gray-400 mt-1">
                Participation totals grouped by club.
              </p>
            </div>

            {stats.clubSummary.length === 0 ? (
              <p className="p-6 text-gray-400">No participation history yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-gray-300">
                    <tr>
                      <th className="p-4 text-left">Club</th>
                      <th className="p-4 text-center">Registered</th>
                      <th className="p-4 text-center">Attended</th>
                      <th className="p-4 text-center">Certified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.clubSummary.map((c) => (
                      <tr key={c.club} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-4 font-medium">{c.club}</td>
                        <td className="p-4 text-center">{c.registered}</td>
                        <td className="p-4 text-center">{c.attended}</td>
                        <td className="p-4 text-center">{c.certified}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}


          {activeTab === "timeline" && (
            <ParticipationTimeline participations={participations} />
          )}

          {activeTab === "certificates" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {participations.filter(p => p.certificateId).length === 0
                ? <p className="text-gray-400">No certificates yet.</p>
                : participations
                    .filter(p => p.certificateId)
                    .map(p => (
                      <CertificateCard key={p.certificateId} participation={p} />
                    ))}
            </div>
          )}

          {activeTab === "qr-scanner" && (
            <QRScanner profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
};

/* ================= SIDEBAR COMPONENT ================= */
function Sidebar({ profile, activeTab, setActiveTab, onLogout, open, onClose }) {
  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static z-50 md:z-auto top-0 left-0 h-full w-[280px]
        bg-black md:bg-white/5 border-r border-white/10 p-4 transition-transform
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Close (mobile) */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <p className="font-semibold">Menu</p>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
            {profile.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{profile.name}</p>
            <p className="text-xs text-gray-400">{profile.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mt-4 flex flex-col gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                activeTab === key
                  ? "bg-blue-600 border-blue-500"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>
    </>
  );
}
function RowMini({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-100">{value}</span>
    </div>
  );
}


export default StudentDashboard;
