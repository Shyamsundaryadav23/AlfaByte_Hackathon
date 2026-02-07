import axios from "axios";

const API = "http://localhost:5000/api/admin/members";

export const fetchMembers = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const fetchMembersByClub = async (clubId) => {
  const res = await axios.get(`${API}/club/${clubId}`);
  return res.data;
};

export const createMember = async (data) => {
  const res = await axios.post(API, data);
  return res.data;
};


export const updateMemberRole = async (id, role) => {
  await axios.put(`${API}/${id}/role`, { role });
};

export const toggleMember = async (id) => {
  await axios.put(`${API}/${id}/toggle`);
};
