

import { Link } from "react-router-dom";
const BACKEND = import.meta.env.VITE_BACKEND_URL;
export default function ClubCard({ club }) {
  const logoSrc = club.image
    ? club.image.startsWith("http")
      ? club.image
      : `${BACKEND}${club.image}`
    : "/placeholder.png"; 
  return (
    <Link to={`/club/${club.id}`}>
      <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500 hover:shadow-blue-500/40 hover:shadow-2xl transition duration-300 cursor-pointer">
        
        {/* Logo */}
        <img
          src={logoSrc}
          alt={club.name}
          className="w-16 h-16 mx-auto group-hover:scale-110 transition"
        />

        {/* Title */}
        <h2 className="text-xl font-bold text-white mt-4 text-center">
          {club.name}
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-sm mt-3 text-center">
          {club.description}
        </p>

        {/* Button */}
        <button className="mt-5 w-full bg-blue-600 py-2 rounded-xl hover:bg-blue-700 text-white font-semibold">
          View Events →
        </button>
      </div>
    </Link>
  );
}
