import axios from "axios";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const fetchMyParticipation = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${BACKEND}/api/students/me/participation`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
