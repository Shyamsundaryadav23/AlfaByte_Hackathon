import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentRegistrationForm from "./StudentRegistrationForm";
export default function FirstTimeJoinFlow() {
  const { clubId, eventId } = useParams();
  const navigate = useNavigate();

  // which step user is on
  const [step, setStep] = useState("signup"); // signup | otp | details

  // Signup form
  const [signup, setSignup] = useState({
    name: "",
    email: "",
    password: "",
  });

  // OTP
  const [otp, setOtp] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Event registration details (auto-fill name/email)
  const [details, setDetails] = useState({
    name: "",
    email: "",
    rollNo: "",
    department: "",
    phone: "",
    gender: "",
    year: "",
  });

  // ✅ If already logged in, skip signup+otp and go direct to details
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedName = localStorage.getItem("studentName");
    const savedEmail = localStorage.getItem("studentEmail");

    if (token && savedName && savedEmail) {
      setDetails((prev) => ({ ...prev, name: savedName, email: savedEmail }));
      setStep("details");
    }
  }, []);

  // handlers
  const onChangeSignup = (e) =>
    setSignup({ ...signup, [e.target.name]: e.target.value });

  const onChangeDetails = (e) =>
    setDetails({ ...details, [e.target.name]: e.target.value });

  // ✅ STEP 1: Signup → sends OTP email
  const submitSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/students/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return alert(data.error || "Signup failed");
      }

      // open OTP modal + message
      setOtpModalOpen(true);
      setStep("otp");

      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert("Network error. Please try again.");
    }
  };

  // ✅ STEP 2: Verify OTP → get token
  const submitOtp = async () => {
    if (!otp) return alert("Enter OTP");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/students/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signup.email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return alert(data.error || "OTP verification failed");
      }

      // Save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("studentName", signup.name);
      localStorage.setItem("studentEmail", signup.email);

      // Auto-fill details form
      setDetails((prev) => ({ ...prev, name: signup.name, email: signup.email }));

      setOtpModalOpen(false);
      setStep("details");

      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert("Network error. Please try again.");
    }
  };

  // ✅ STEP 3: Submit event registration details
  const submitDetails = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please verify your email first.");
      return setStep("signup");
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/students/clubs/${clubId}/events/${eventId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(details),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return alert(data.error || "Registration failed");
      }

      setLoading(false);

      // ✅ redirect to club event page
      navigate(`/club/${clubId}`);
    } catch (err) {
      setLoading(false);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-5">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* STEP TITLE */}
        {step === "signup" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-300 mb-6">
              First time? Create your account to join this event.
            </p>

            <form onSubmit={submitSignup}>
              <Field label="Name">
                <input
                  name="name"
                  value={signup.name}
                  onChange={onChangeSignup}
                  className="inputDark"
                  required
                />
              </Field>

              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  value={signup.email}
                  onChange={onChangeSignup}
                  className="inputDark"
                  required
                />
              </Field>

              <Field label="Password">
                <input
                  name="password"
                  type="password"
                  value={signup.password}
                  onChange={onChangeSignup}
                  className="inputDark"
                  required
                />
              </Field>

              <button
                disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
              >
                {loading ? "Sending OTP..." : "Submit & Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* DETAILS FORM */}
        {step === "details" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Event Registration</h1>
            <form onSubmit={submitDetails}>
              <Field label="Name">
                <input
                  name="name"
                  value={details.name}
                  className="inputDark"
                  readOnly
                />
              </Field>

              <Field label="Email">
                <input
                  name="email"
                  value={details.email}
                  className="inputDark"
                  readOnly
                />
              </Field>

              <Field label="Roll No">
                <input
                  name="rollNo"
                  value={details.rollNo}
                  onChange={onChangeDetails}
                  className="inputDark"
                  required
                />
              </Field>

              <Field label="Department">
                <select
                  name="department"
                  value={details.department}
                  onChange={onChangeDetails}
                  className="inputDark"
                  required
                >
                  <option value="">Select Department</option>
                  {[
                    "Computer Engineering",
                    "Electronics & Telecommunication Engineering",
                    "Mechanical Engineering",
                    "Civil Engineering",
                    "Information Technology",
                    "AI & DS Engineering",
                  ].map((d) => (
                    <option key={d} value={d} className="text-black">
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Phone">
                <input
                  name="phone"
                  value={details.phone}
                  onChange={onChangeDetails}
                  className="inputDark"
                  required
                />
              </Field>

              <Field label="Gender">
                <select
                  name="gender"
                  value={details.gender}
                  onChange={onChangeDetails}
                  className="inputDark"
                  required
                >
                  <option value="">Select Gender</option>
                  {["Male", "Female", "Other"].map((g) => (
                    <option key={g} value={g} className="text-black">
                      {g}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Year">
                <select
                  name="year"
                  value={details.year}
                  onChange={onChangeDetails}
                  className="inputDark"
                  required
                >
                  <option value="">Select Year</option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                    <option key={y} value={y} className="text-black">
                      {y}
                    </option>
                  ))}
                </select>
              </Field>

              <button
                disabled={loading}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-semibold"
              >
                {loading ? "Registering..." : "Submit & Join Event"}
              </button>
            </form>
          </>
        )}
      </div>

      {/* ✅ OTP MODAL */}
      {otpModalOpen && (
        <OtpModal
          loading={loading}
          email={signup.email}
          otp={otp}
          setOtp={setOtp}
          onVerify={submitOtp}
          onClose={() => setOtpModalOpen(false)}
        />
      )}

      {/* Tailwind helper */}
      <style>{`
        .inputDark{
          width: 100%;
          padding: 12px 14px;
          margin-top: 6px;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          outline: none;
        }
        .inputDark:focus{
          border: 1px solid rgba(59,130,246,0.9);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-gray-200">{label}</label>
      {children}
    </div>
  );
}

function OtpModal({ loading, email, otp, setOtp, onVerify, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-600 mt-1">
          We sent an OTP to <span className="font-semibold">{email}</span>.<br />
          Please check your inbox (and spam folder).
        </p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          className="w-full mt-4 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="w-1/2 py-3 rounded-xl border font-semibold hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onVerify}
            disabled={loading}
            className="w-1/2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
