import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentSignup } from "../../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentSignup(form.name, form.email, form.password);
      alert("OTP sent to your email. Enter it to verify.");
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      alert(err.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Student Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Institute Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Register</button>
        </form>
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

export default Register;
