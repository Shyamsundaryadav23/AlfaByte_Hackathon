import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventCard from "../../components/event/EventCard";

const ClubEventsPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock fetch — replace with API call later
  useEffect(() => {
    // Mock club data
    const mockClubs = [
      { id: "1", name: "Tech Club" },
      { id: "2", name: "Robotics Club" },
      { id: "3", name: "AI & ML Club" },
      { id: "4", name: "Cultural Club" },
    ];
    const selectedClub = mockClubs.find((c) => c.id === clubId);
    setClub(selectedClub);

    // Mock events data
    const mockEvents = [
      {
        id: "101",
        title: "AI Hackathon",
        type: "Hackathon",
        startDate: "2026-02-10",
        endDate: "2026-02-12",
        state: "Registration Open",
      },
      {
        id: "102",
        title: "Robotics Workshop",
        type: "Workshop",
        startDate: "2026-03-01",
        endDate: "2026-03-01",
        state: "Published",
      },
      {
        id: "103",
        title: "Tech Quiz",
        type: "Competition",
        startDate: "2026-04-05",
        endDate: "2026-04-05",
        state: "Draft",
      },
    ];
    setEvents(mockEvents);
    setLoading(false);
  }, [clubId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading events...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">Club not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Back Button */}
      <div className="px-8 py-4">
        <button
          className="text-indigo-600 hover:text-indigo-800 font-semibold"
          onClick={() => navigate(-1)}
        >
          &larr; Back to Clubs
        </button>
      </div>

      {/* Club Header */}
      <section className="text-center py-8 bg-indigo-700 text-white">
        <h1 className="text-4xl font-bold">{club.name}</h1>
        <p className="mt-2 text-lg">
          Explore all events organized by this club
        </p>
      </section>

      {/* Events Grid */}
      <section className="px-8 py-12">
        <h2 className="text-3xl font-semibold mb-6">Upcoming Events</h2>
        {events.length === 0 ? (
          <p>No events available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ClubEventsPage;
