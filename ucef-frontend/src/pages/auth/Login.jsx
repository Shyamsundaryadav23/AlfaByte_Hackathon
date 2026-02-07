import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentLogin } from "../../services/authStudent";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await studentLogin(form.email, form.password);
      // authService stores token already; store role if provided
      if (data?.role) localStorage.setItem("role", data.role);
      navigate("/student/dashboard");
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Student Login
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Unified Campus Events Fabric (UCEF)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Institute Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          New student?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-indigo-600 cursor-pointer font-semibold"
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-semibold">{label}</label>
    <input {...props} className="w-full border rounded px-3 py-2 mt-1" />
  </div>
);

export default Login;
