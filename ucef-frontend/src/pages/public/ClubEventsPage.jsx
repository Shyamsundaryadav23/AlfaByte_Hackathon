import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UpcomingEvents from "../../components/common/UpcomingEvents";
import LiveEvents from "../../components/common/LiveEvents";
import { ArrowLeft, Share2, Heart, Bell } from "lucide-react";
import { toast } from "sonner";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ClubEventsPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  /* ================= FETCH CLUB + EVENTS ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const clubRes = await fetch(`${BACKEND}/api/public/clubs/${clubId}`);
        const clubData = await clubRes.json();
        if (!clubRes.ok) throw new Error("Club not found");
        setClub(clubData);

        const evRes = await fetch(
          `${BACKEND}/api/public/clubs/${clubId}/events`
        );
        const evData = await evRes.json();
        setClubEvents(Array.isArray(evData) ? evData : []);
      } catch (err) {
        console.error(err);
        setClub(null);
        setClubEvents([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clubId]);

  /* ================= ACTIONS ================= */
  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    toast.success(
      !isFollowing
        ? "Following club! Notifications enabled."
        : "Unfollowed club"
    );
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading club...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Club not found</p>
      </div>
    );
  }

  const bannerSrc = club.image?.startsWith("http")
    ? club.image
    : `${BACKEND}${club.image}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* ================= BANNER ================= */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={bannerSrc}
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <h1 className="absolute bottom-8 left-8 text-white text-4xl font-bold">
          {club.name}
        </h1>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-12">
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleFollow}
            className={`px-5 py-2 rounded-lg flex items-center gap-2 ${
              isFollowing
                ? "bg-gray-200 text-gray-700"
                : "bg-blue-600 text-white"
            }`}
          >
            {isFollowing ? (
              <Heart className="w-5 h-5 fill-current" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
            {isFollowing ? "Following" : "Follow"}
          </button>

          <button
            onClick={handleShare}
            className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* 🔴 LIVE EVENTS */}
        <LiveEvents events={clubEvents} />

        {/* ⏳ UPCOMING EVENTS */}
        <UpcomingEvents events={clubEvents} />
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white py-8 mt-14 text-center">
        <p className="text-gray-400">
          © 2026 Unified Campus Events. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
