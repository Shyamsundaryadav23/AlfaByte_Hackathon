import React from "react";

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-center">
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <p className="text-3xl font-bold text-indigo-600">{value}</p>
    </div>
  );
};

export default StatCard;
