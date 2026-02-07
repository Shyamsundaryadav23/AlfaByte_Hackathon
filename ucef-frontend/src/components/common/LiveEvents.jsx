import React, { useMemo } from "react";
import EventCard from "./EventCard";
import { Radio } from "lucide-react";

export default function LiveEvents({ events }) {
  const liveEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];

    // ✅ Primary source of truth: backend status
    const byStatus = events.filter((e) => e.status === "Live");

    // ✅ Optional safety check (time window)
    const now = new Date();
    return byStatus.filter((e) => {
      if (!e.start_time || !e.end_time) return false;
      const start = new Date(e.start_time);
      const end = new Date(e.end_time);
      return now >= start && now <= end;
    });
  }, [events]);

  if (liveEvents.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
        </span>
        LIVE NOW
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {liveEvents.map((event) => (
          <div key={event.id} className="relative">
            {/* 🔴 Live badge */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow animate-pulse">
              <Radio className="w-3 h-3" />
              LIVE
            </div>

            <EventCard event={event} />
          </div>
        ))}
      </div>
    </section>
  );
}
