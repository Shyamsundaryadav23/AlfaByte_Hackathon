import React, { useEffect, useState } from "react";
import ClubCard from "./ClubCard";
import { getAllClubs } from "../../services/apiClub";

export default function ClubsSection({ search, filter, setFilter }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Academic", "Sports", "Arts", "Technology"];

  // ✅ Fetch clubs from backend
  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const data = await getAllClubs();
      setClubs(data);
    } catch (err) {
      console.error("Failed to load clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtering
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = club.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      filter === "All" || club.category === filter;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="bg-black py-20 px-10">
      <h2 className="text-4xl font-bold text-white text-center">
        Explore Registered College Clubs
      </h2>

      {/* Filters */}
      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full font-semibold ${
              filter === cat
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-white text-center mt-10">
          Loading clubs from database...
        </p>
      )}

      {/* Clubs Grid */}
      <div className="grid md:grid-cols-4 gap-8 mt-12">
        {filteredClubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>

      {/* No clubs */}
      {!loading && filteredClubs.length === 0 && (
        <p className="text-gray-400 text-center mt-10">
          No clubs found.
        </p>
      )}
    </section>
  );
}
