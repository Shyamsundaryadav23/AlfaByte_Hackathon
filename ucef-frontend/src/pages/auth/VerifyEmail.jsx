import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmailOtp } from "../../services/authStudent";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email] = useState(state?.email || "");
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyEmailOtp(email, otp);
      alert("Email verified — you are now logged in.");
      navigate("/student/dashboard");
    } catch (err) {
      alert(err.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Verify Email</h1>
        <p className="text-sm text-gray-600 mb-4">Enter the OTP sent to <strong>{email}</strong></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="OTP" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Verify</button>
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

export default VerifyEmail;
