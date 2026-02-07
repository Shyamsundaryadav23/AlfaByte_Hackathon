import React, { useEffect, useState } from "react";
import { fetchClubs, toggleClub, createClub } from "../../services/apiAdmin";
import ClubUpload from "../../components/common/ClubUpload";
import { useNavigate } from "react-router-dom";

export default function ManageClubs() {
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadClubs();
  }, []);

  // Load clubs from backend
  const loadClubs = async () => {
    const data = await fetchClubs();
    setClubs(data);
  };

  // Add club handler
const addClubHandler = async (formData) => {
  try {
    const res = await createClub(formData);

    alert(res.message); // Club added successfully

    loadClubs();
  } catch (err) {
    alert(err.response?.data?.error || "Something went wrong");
  }
};



  // Activate/Deactivate club
  const toggleStatus = async (id) => {
    await toggleClub(id);
    loadClubs();
  };


  return (
    <div className="min-h-screen bg-gray-100 px-8 py-6">

      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:underline font-semibold"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Club Governance</h1>

      {/* Add Club Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Register New Club</h2>

        <ClubUpload addClub={addClubHandler} />
      </div>

      {/* Club Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">
          Registered Clubs
        </h2>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Logo</th>
              <th className="p-4 text-left">Club Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

<tbody>
  {clubs.map((club) => {
    const logoSrc =
      club.image && club.image.startsWith("http")
        ? club.image
        : club.image
        ? `http://localhost:5000${club.image}`
        : null;

    return (
      <tr key={club.id} className="border-b hover:bg-gray-50">
        {/* Logo */}
        <td className="p-4">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Logo</span>
          )}
        </td>

        {/* Club Name */}
        <td className="p-4 font-semibold">{club.name}</td>

        {/* Category */}
        <td className="p-4">{club.category}</td>

        {/* Status */}
        <td className="p-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              club.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {club.status}
          </span>
        </td>

        {/* Actions */}
        <td className="p-4 flex gap-4">
          <button
            onClick={() => toggleStatus(club.id)}
            className="text-indigo-600 hover:underline font-semibold"
          >
            {club.status === "Active" ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => navigate(`/admin/clubs/${club.id}/members`)}
            className="text-blue-600 hover:underline font-semibold"
          >
            Manage Members
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

        </table>

        {/* Empty Message */}
        {clubs.length === 0 && (
          <p className="p-6 text-gray-500">No clubs registered yet.</p>
        )}
      </div>
    </div>
  );
}
