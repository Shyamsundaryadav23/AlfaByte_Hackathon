import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { organizerLogin } from "../../services/apiOrganizer";

export default function OrganizerLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const res = await organizerLogin(form);
    if (res.error) return setError(res.error);

    localStorage.setItem("organizerToken", res.token);
    localStorage.setItem("organizerMember", JSON.stringify(res.member));
    navigate("/organizer/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-950 to-black">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center">Organizer Login</h2>
        <p className="text-gray-400 text-center mt-2">
          Access your club’s event console
        </p>

        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-white/5 border border-white/10 text-white p-3 rounded-xl outline-none focus:border-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-white/5 border border-white/10 text-white p-3 rounded-xl outline-none focus:border-blue-500"
            required
          />

          <button className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-xl">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
