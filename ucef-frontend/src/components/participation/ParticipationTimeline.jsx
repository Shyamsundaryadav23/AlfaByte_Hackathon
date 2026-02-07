import React, { useMemo } from "react";

const stateStyles = {
  Registered: "border-gray-500/30 bg-gray-500/10 text-gray-200",
  Attended: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  Qualified: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  Certified: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
};

export default function ParticipationTimeline({ participations }) {
  const rows = useMemo(() => {
    const list = Array.isArray(participations) ? [...participations] : [];
    return list.sort((a, b) => {
      const ay = Number(a.year || 0);
      const by = Number(b.year || 0);
      if (by !== ay) return by - ay;
      return String(a.eventName || "").localeCompare(String(b.eventName || ""));
    });
  }, [participations]);

  if (rows.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-gray-400">
        No participation history yet.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {rows.map((p) => {
        const chip =
          stateStyles[p.participationState] || stateStyles.Registered;

        return (
          <div
            key={p.eventId}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
          >
            <div className="min-w-0">
              <h3 className="text-lg md:text-xl font-semibold text-white line-clamp-1">
                {p.eventName || "Untitled Event"}
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                {p.club || "Unknown Club"} · {p.year || "—"}
              </p>

              {p.attendancePercentage !== null && p.attendancePercentage !== undefined && (
                <p className="text-sm text-gray-300 mt-2">
                  Attendance: <b>{p.attendancePercentage}%</b>
                </p>
              )}

              {p.explanation && (
                <p className="mt-2 text-sm text-gray-400 italic">
                  {p.explanation}
                </p>
              )}
            </div>

            <span
              className={`shrink-0 px-4 py-1 rounded-full text-sm font-semibold border ${chip}`}
            >
              {p.participationState || "Registered"}
            </span>
          </div>
        );
      })}
    </section>
  );
}
