import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const EventExplorePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${BACKEND}/api/public/events/${eventId}`);
        const data = await res.json();

        if (!res.ok || data?.error) {
          setEvent(null);
          return;
        }

        setEvent(data);
      } catch (e) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  const start = useMemo(() => (event?.start_time ? new Date(event.start_time) : null), [event]);
  const end = useMemo(() => (event?.end_time ? new Date(event.end_time) : null), [event]);
  const isPast = end ? end < new Date() : false;

  const normalizeImage = (raw) => {
    if (!raw) return "/event-placeholder.jpg";
    if (raw.startsWith("http")) return raw;
    if (raw.startsWith("uploads/")) return `${BACKEND}/${raw}`;
    if (raw.startsWith("/uploads/")) return `${BACKEND}${raw}`;
    return `${BACKEND}/${raw}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Event not found
      </div>
    );
  }

  const banner = normalizeImage(event.image_url);
  const venue = event.venue || "PCCOE Campus";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Back */}
      <div className="px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Back
        </button>
      </div>

      {/* Header */}
      <section className="bg-blue-400 text-white py-10 px-8 border border-indigo-700">
        <h1 className="text-4xl font-bold">{event.title}</h1>
        <p className="mt-2 text-lg">{event.club_name || `Club: ${event.club_id}`}</p>

        <span className="inline-block mt-4 px-4 py-1 rounded-full bg-white text-indigo-700 font-medium">
          {event.status}
        </span>
      </section>

      {/* Content */}
      <section className="px-8 py-10 max-w-4xl mx-auto bg-white shadow rounded-xl mt-6">
        <img
          src={banner}
          alt={event.title}
          className="w-full h-full object-cover rounded-lg mb-6"
          onError={(e) => {
            e.currentTarget.src = "/event-placeholder.jpg";
          }}
        />

        <h2 className="text-2xl font-semibold mb-4 ">About the Event</h2>
        <div className="mb-6 bg-red-900/10 p-4 rounded-lg border border-red-400">
        <p className="text-gray-700 mb-6 text-justify">{event.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-indigo-300 p-4 rounded-lg border border-indigo-500">
            <h3 className="font-semibold">Event Type</h3>
            <p>{event.event_type}</p>
          </div>
          <div>
            <div className="bg-indigo-300 p-4 rounded-lg border border-indigo-500">
            <h3 className="font-semibold">Venue</h3>
            <p>{venue}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Start Time</h3>
            <p>{start ? start.toLocaleString() : "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold">End Time</h3>
            <p>{end ? end.toLocaleString() : "-"}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Registration Stats</h3>
          <p className="text-gray-700">
            {(event.registered_count ?? 0)}/{event.capacity ?? 200} registered
          </p>
        </div>

        {/* Action */}
        <div className="flex gap-4 mt-8 ">
          <button
            disabled={isPast}
            onClick={() => navigate(`/club/${event.club_id}/event/${event.id}/join`)}
            className={`px-6 py-2 rounded font-semibold ${
              isPast
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isPast ? "Event Ended" : "Register"}
          </button>

          {isPast && (
            <p className="text-sm text-gray-600 self-center">
              Registration closed (event ended).
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventExplorePage;
