import React from "react";
import { useNavigate } from "react-router-dom";

const ClubCard = ({ club }) => {
  const navigate = useNavigate();

  const goToClub = () => {
    navigate(`/club/${club.id}`);
  };

  return (
    <div
      className="bg-white text-black rounded-xl shadow-lg p-5 cursor-pointer hover:scale-105 transition-transform"
      onClick={goToClub}
    >
      <img
        src={club.logo}
        alt={club.name}
        className="w-full h-40 object-contain mb-4"
      />
      <h3 className="text-xl font-semibold text-center">{club.name}</h3>
      <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
        View Events
      </button>
    </div>
  );
};

export default ClubCard;
