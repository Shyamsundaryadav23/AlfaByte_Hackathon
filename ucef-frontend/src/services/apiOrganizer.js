const API = "http://localhost:5000/api/organizers";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("organizerToken")}`,
  "Content-Type": "application/json",
});

export const organizerLogin = async (payload) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const fetchMyOrganizerProfile = async () => {
  const res = await fetch(`${API}/profile`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

export const fetchMyClubEvents = async () => {
  const res = await fetch(`${API}/events`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
};

export const createMyClubEvent = async (data) => {
  const res = await fetch(`${API}/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateMyEventStatus = async (eventId, status) => {
  const res = await fetch(`${API}/events/${eventId}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const openAttendance = async (eventId) => {
  const res = await fetch(`${API}/events/${eventId}/attendance/open`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
};

// ✅ participants
export const fetchEventParticipants = async (eventId, day) => {
  const qs = day ? `?day=${encodeURIComponent(day)}` : "";
  const res = await fetch(
    `${API}/events/${eventId}/participants${qs}`, // ✅ FIXED
    { headers: authHeaders() }
  );

  if (!res.ok) throw new Error("Failed to fetch participants");
  return res.json();
};



// ✅ manual attendance
export const setManualAttendance = async (eventId, student_id, status) => {
  const res = await fetch(`${API}/events/${eventId}/attendance/manual`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ student_id, status }),
  });
  return res.json();
};

// ✅ issue certificate
export const issueCertificate = async (eventId, student_id) => {
  const res = await fetch(`${API}/events/${eventId}/certificates/issue`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ student_id }),
  });
  return res.json();
};

export const openEventQr = async (eventId, qr_type, day) => {
  const token = localStorage.getItem("organizerToken");

  const res = await fetch(`${API}/api/organizers/events/${eventId}/qr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ qr_type, day }), // ✅ day: "YYYY-MM-DD"
  });

  return res.json();
};
