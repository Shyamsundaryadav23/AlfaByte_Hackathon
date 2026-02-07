import axios from "axios";

const API = "http://localhost:5000/api/admin";

/* View Clubs */
export const fetchClubs = async () => {
  const res = await axios.get(`${API}/clubs`);
  return res.data;
};


export const createClub = async (formData) => {
  const res = await axios.post(`${API}/clubs`, formData); // ✅ remove headers
  return res.data;
};

/* Toggle Club */
export const toggleClub = async (id) => {
  await axios.put(`${API}/clubs/${id}/toggle`);
};

export const fetchAuditLogs = async () => {
  const res = await axios.get(`${API}/audit`);
  return res.data;
};
