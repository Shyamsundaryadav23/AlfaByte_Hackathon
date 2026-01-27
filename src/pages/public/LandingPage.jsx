import React, { useState, useEffect } from "react";
import ClubCard from "../../components/common/ClubCard";

// Dummy data for sponsors
const sponsors = [
  { id: 1, name: "Google", logo: "/assets/google.png" },
  { id: 2, name: "Microsoft", logo: "/assets/microsoft.png" },
  { id: 3, name: "AWS", logo: "/assets/aws.png" },
  { id: 4, name: "Tesla", logo: "/assets/tesla.png" },
];

const LandingPage = () => {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    setClubs([
      { id: 1, name: "Tech Club", logo: "/assets/tech.png" },
      { id: 2, name: "Robotics Club", logo: "/assets/robotics.png" },
      { id: 3, name: "AI & ML Club", logo: "/assets/ai.png" },
      { id: 4, name: "Cultural Club", logo: "/assets/cultural.png" },
    ]);
  }, []);

  return (
    <div className="bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white font-sans">
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-screen text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-indigo-700 to-pink-600 opacity-30 animate-gradient bg-[length:400%_400%]"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fadeIn">
            Welcome to UCEF
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-6 animate-fadeIn delay-200">
            Discover clubs, explore events, and build your participation journey!
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors animate-fadeIn delay-400">
            Register Now
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 md:px-20 text-center bg-black">
        <h2 className="text-4xl font-bold mb-6">About UCEF</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-300">
          Unified Campus Events Fabric (UCEF) is a state-driven participation platform
          that empowers students to track their event journey, organizers to manage
          event lifecycles, and administrators to audit participation records.
          Every action is role-aware and state-aware.
        </p>
      </section>

      {/* Clubs Grid */}
      <section className="py-20 px-6 md:px-20">
        <h2 className="text-3xl font-semibold mb-10 text-center">Clubs & Societies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </section>

      {/* Event Highlights / Schedule */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-t from-black via-purple-900 to-indigo-900 text-center">
        <h2 className="text-3xl font-bold mb-10">Event Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white text-black rounded-xl shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2">Hackathons</h3>
            <p>Participate in coding competitions, learn, and win exciting prizes.</p>
          </div>
          <div className="bg-white text-black rounded-xl shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2">Workshops</h3>
            <p>Hands-on sessions with industry experts on latest technologies.</p>
          </div>
          <div className="bg-white text-black rounded-xl shadow-lg p-6 hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2">Talks & Panels</h3>
            <p>Learn from leaders, innovators, and alumni sharing insights.</p>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-20 px-6 md:px-20 text-center">
        <h2 className="text-3xl font-bold mb-10">Our Sponsors</h2>
        <div className="flex flex-wrap justify-center items-center gap-12">
          {sponsors.map((sponsor) => (
            <img
              key={sponsor.id}
              src={sponsor.logo}
              alt={sponsor.name}
              className="h-16 object-contain filter brightness-110 hover:brightness-125 transition"
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
