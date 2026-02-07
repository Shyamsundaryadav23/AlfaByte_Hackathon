import React from "react";

const stateColors = {
  Registered: "bg-gray-200 text-gray-800",
  Attended: "bg-blue-200 text-blue-800",
  Qualified: "bg-yellow-200 text-yellow-800",
  Certified: "bg-green-200 text-green-800",
};

const ParticipationTimeline = ({ participations }) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Participation Timeline</h2>

      <div className="space-y-4">
        {participations
          .sort((a, b) => b.year - a.year)
          .map((p) => (
            <div
              key={p.eventId}
              className="bg-white p-5 rounded-xl shadow flex justify-between items-start"
            >
              <div>
                <h3 className="text-xl font-semibold">{p.eventName}</h3>
                <p className="text-gray-600">{p.club} · {p.year}</p>
                <p className="text-sm mt-2 text-gray-700">
                  Role: {p.role}
                </p>
                {p.attendancePercentage !== null && (
                  <p className="text-sm text-gray-700">
                    Attendance: {p.attendancePercentage}%
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600 italic">
                  {p.explanation}
                </p>
              </div>

              <span
                className={`px-4 py-1 rounded-full text-sm font-medium ${stateColors[p.participationState]}`}
              >
                {p.participationState}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
};

export default ParticipationTimeline;
