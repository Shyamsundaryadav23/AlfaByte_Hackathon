import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EventExplorePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock fetch – replace with API
  useEffect(() => {
    const mockEvent = {
      id: eventId,
      title: "AI Hackathon",
      club: "Tech Club",
      description:
        "A national-level hackathon focused on AI, ML, and real-world problem solving.",
      type: "Hackathon",
      startDate: "2026-02-10",
      endDate: "2026-02-12",
      state: "Registration Open",
      attendanceMethod: ["QR", "Submission"],
      eligibilityRules: {
        attendancePercentage: 70,
        submissionRequired: true,
      },
    };

    setEvent(mockEvent);
    setLoading(false);
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading event details...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Event not found
      </div>
    );
  }

  const canRegister = event.state === "Registration Open";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Back */}
      <div className="px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Back to Events
        </button>
      </div>

      {/* Header */}
      <section className="bg-indigo-700 text-white py-10 px-8">
        <h1 className="text-4xl font-bold">{event.title}</h1>
        <p className="mt-2 text-lg">{event.club}</p>
        <span className="inline-block mt-4 px-4 py-1 rounded-full bg-white text-indigo-700 font-medium">
          {event.state}
        </span>
      </section>

      {/* Content */}
      <section className="px-8 py-10 max-w-4xl mx-auto bg-white shadow rounded-xl mt-6">
        <h2 className="text-2xl font-semibold mb-4">About the Event</h2>
        <p className="text-gray-700 mb-6">{event.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold">Event Type</h3>
            <p>{event.type}</p>
          </div>
          <div>
            <h3 className="font-semibold">Duration</h3>
            <p>
              {event.startDate} → {event.endDate}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Attendance Methods</h3>
          <ul className="list-disc list-inside text-gray-700">
            {event.attendanceMethod.map((method) => (
              <li key={method}>{method}</li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Certification Rules</h3>
          <ul className="list-disc list-inside text-gray-700">
            <li>
              Minimum Attendance:{" "}
              {event.eligibilityRules.attendancePercentage}%
            </li>
            <li>
              Submission Required:{" "}
              {event.eligibilityRules.submissionRequired ? "Yes" : "No"}
            </li>
          </ul>
        </div>

        {/* Action */}
        <div className="flex gap-4 mt-8">
          <button
            disabled={!canRegister}
            onClick={() => navigate("/student/dashboard")}
            className={`px-6 py-2 rounded font-semibold ${
              canRegister
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Register
          </button>

          {!canRegister && (
            <p className="text-sm text-gray-600 self-center">
              Registration is not open for this event.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventExplorePage;
