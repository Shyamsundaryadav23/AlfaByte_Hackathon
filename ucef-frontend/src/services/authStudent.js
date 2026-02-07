import { apiRequest } from "./apiClient";

export async function studentLogin(email, password) {
  const data = await apiRequest("/students/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  if (data?.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", "Student");
    localStorage.setItem("studentName", data.name);
    localStorage.setItem("studentEmail", data.email);
  }

  return data;
}


export async function studentSignup(name, email, password) {
  // Call the email-verification registration endpoint
  return await apiRequest("/students/auth/register", {
    method: "POST",
    body: { name, email, password },
    auth: false
  });
}

export async function verifyEmailOtp(email, otp) {
  const data = await apiRequest("/students/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
    auth: false
  });
  if (data?.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

export const fetchMyProfile = () =>
  apiRequest("/students/auth/me", { method: "GET" });

