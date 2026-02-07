// import React, { useEffect, useState } from "react";
// import { ShieldCheck, Save } from "lucide-react";
// import { toast } from "sonner";
// import axios from "axios";

// const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// export default function EventPolicyPanel({ event }) {
//   const [attendancePolicy, setAttendancePolicy] = useState("ENTRY_EXIT");
//   const [rule, setRule] = useState("ALL_DAYS");
//   const [minPercent, setMinPercent] = useState(60);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (!event) return;

//     setAttendancePolicy(event.attendance_policy || "ENTRY_EXIT");

//     const cp = event.certificate_policy || {};
//     setRule(cp.rule || "ALL_DAYS");
//     setMinPercent(cp.min_percent || 60);
//   }, [event]);

//   const savePolicy = async () => {
//     try {
//       setSaving(true);

//       const certificate_policy =
//         rule === "MIN_PERCENT"
//           ? { rule, min_percent: Number(minPercent) }
//           : { rule };

//       const token = localStorage.getItem("organizerToken");

//       await axios.patch(
//         `${BACKEND}/api/organizer/events/${event.id}/policy`,
//         {
//           attendance_policy: attendancePolicy,
//           certificate_policy,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       toast.success("Event policy updated");
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Failed to save policy");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
//       <div className="flex items-center gap-2">
//         <ShieldCheck className="w-5 h-5 text-blue-600" />
//         <h2 className="text-lg font-semibold text-gray-900">
//           Attendance & Certificate Policy
//         </h2>
//       </div>

//       {/* Attendance Policy */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           Attendance Method
//         </label>
//         <select
//           value={attendancePolicy}
//           onChange={(e) => setAttendancePolicy(e.target.value)}
//           className="w-full border rounded-xl px-4 py-2"
//         >
//           <option value="ENTRY_EXIT">Entry + Exit QR</option>
//           <option value="SINGLE_QR">Single QR Scan</option>
//           <option value="MANUAL">Manual Attendance</option>
//           <option value="HYBRID">Hybrid (QR + Manual)</option>
//         </select>
//       </div>

//       {/* Certificate Policy */}
//       <div>
//         <label className="block text-sm font-semibold text-gray-700 mb-2">
//           Certificate Eligibility Rule
//         </label>

//         <select
//           value={rule}
//           onChange={(e) => setRule(e.target.value)}
//           className="w-full border rounded-xl px-4 py-2 mb-3"
//         >
//           <option value="ALL_DAYS">Must attend all days</option>
//           <option value="MIN_PERCENT">Minimum attendance percentage</option>
//         </select>

//         {rule === "MIN_PERCENT" && (
//           <div className="flex items-center gap-3">
//             <input
//               type="number"
//               min="1"
//               max="100"
//               value={minPercent}
//               onChange={(e) => setMinPercent(e.target.value)}
//               className="w-24 border rounded-lg px-3 py-2"
//             />
//             <span className="text-sm text-gray-600">% attendance required</span>
//           </div>
//         )}
//       </div>

//       {/* Save */}
//       <button
//         onClick={savePolicy}
//         disabled={saving}
//         className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
//       >
//         <Save className="w-4 h-4" />
//         {saving ? "Saving..." : "Save Policy"}
//       </button>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";

export default function EventPolicyPanel({ event }) {
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/organizers/events/${event.id}/certificate/template`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("organizerToken")}` },
    })
      .then((r) => r.json())
      .then((d) => setHtml(d.template_html || ""));
  }, [event.id]);

  const save = async () => {
    setSaving(true);
    await fetch(
      `/api/organizers/events/${event.id}/certificate/template`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("organizerToken")}`,
        },
        body: JSON.stringify({ template_html: html }),
      }
    );
    setSaving(false);
    alert("Template saved");
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-6">
      <h3 className="text-lg font-semibold mb-2">Certificate Template (HTML)</h3>

      <textarea
        className="w-full min-h-[260px] bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-sm"
        value={html}
        onChange={(e) => setHtml(e.target.value)}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold"
        >
          {saving ? "Saving..." : "Save Template"}
        </button>

        <a
          href="https://github.com"
          target="_blank"
          className="text-sm text-blue-400 underline"
        >
          Template help
        </a>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Use placeholders like <b>{"{{student_name}}"}</b>,{" "}
        <b>{"{{certificate_no}}"}</b>,{" "}
        <b>{"{{qr_data_url}}"}</b>
      </p>
    </div>
  );
}
