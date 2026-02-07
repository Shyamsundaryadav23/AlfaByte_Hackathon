import React, { useEffect, useState } from "react";
import ParticipationTimeline from "../../components/participation/ParticipationTimeline";
import CertificateCard from "../../components/participation/CertificateCard";
import StatCard from "../../components/common/StatCard";
const StudentDashboard = () => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const mockParticipationData = [
      {
        eventId: "101",
        eventName: "AI Hackathon",
        club: "Tech Club",
        year: 2026,
        participationState: "Certified",
        role: "Participant",
        attendancePercentage: 92,
        certificateId: "CERT-AI-2026-001",
        explanation: "Certificate issued successfully.",
      },
      {
        eventId: "102",
        eventName: "Robotics Workshop",
        club: "Robotics Club",
        year: 2025,
        participationState: "Attended",
        role: "Participant",
        attendancePercentage: 60,
        certificateId: null,
        explanation:
          "Not certified because attendance was below the required 70%.",
      },
      {
        eventId: "103",
        eventName: "Tech Quiz",
        club: "Tech Club",
        year: 2024,
        participationState: "Registered",
        role: "Participant",
        attendancePercentage: null,
        certificateId: null,
        explanation: "Event not yet conducted.",
      },
    ];

    setParticipations(mockParticipationData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading your participation history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-8 py-6">
      
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track your campus participation journey
        </p>
      </header>

      {/* Menu Bar */}
      <div className="flex gap-6 border-b mb-8">
        {["overview", "timeline", "certificates"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold capitalize transition ${
              activeTab === tab
                ? "border-b-4 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-indigo-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === "overview" && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Events" value={participations.length} />
          <StatCard
            title="Certified Events"
            value={participations.filter(p => p.participationState === "Certified").length}
          />
          <StatCard
            title="Certificates Earned"
            value={participations.filter(p => p.certificateId).length}
          />
        </section>
      )}

      {activeTab === "timeline" && (
        <ParticipationTimeline participations={participations} />
      )}

      {activeTab === "certificates" && (
        <section>
          {participations.filter(p => p.certificateId).length === 0 ? (
            <p className="text-gray-600">No certificates earned yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participations
                .filter(p => p.certificateId)
                .map(p => (
                  <CertificateCard key={p.certificateId} participation={p} />
                ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
