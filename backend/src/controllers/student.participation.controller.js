// import { pool } from "../config/db.js";

// /**
//  * Returns longitudinal participation for current student:
//  * - Registered: student has registration row
//  * - Attended: at least one attendance row status='Present' (any day)
//  * - Certified: registration.certified=true OR verification_code not null
//  */
// export const getMyParticipation = async (req, res) => {
//   try {
//     const studentId = req.user?.userId;
//     if (!studentId) return res.status(401).json({ error: "Unauthorized" });

//     const r = await pool.query(
//       `
//       SELECT
//         r.event_id,
//         e.title AS event_title,
//         e.start_time,
//         e.end_time,
//         e.event_type,
//         e.venue,
//         c.name AS club_name,

//         -- certificate info (you already store these in registrations)
//         r.certified,
//         r.verification_code,

//         -- event-wise attendance aggregation:
//         -- if ANY attendance row is Present => Present else Absent
//         CASE
//           WHEN COALESCE(att.present_count, 0) > 0 THEN 'Present'
//           ELSE 'Absent'
//         END AS attendance_status,

//         -- participation state (priority: Certified > Attended > Registered)
//         CASE
//           WHEN (r.certified = true OR r.verification_code IS NOT NULL) THEN 'Certified'
//           WHEN COALESCE(att.present_count, 0) > 0 THEN 'Attended'
//           ELSE 'Registered'
//         END AS participation_state,

//         -- explanation for UI
//         CASE
//           WHEN (r.certified = true OR r.verification_code IS NOT NULL)
//             THEN 'You attended and certificate was issued.'
//           WHEN COALESCE(att.present_count, 0) > 0
//             THEN 'You attended this event, certificate not issued yet.'
//           ELSE 'You registered but attendance is not marked.'
//         END AS explanation

//       FROM registrations r
//       JOIN events e ON e.id = r.event_id
//       JOIN clubs c ON c.id = e.club_id

//       LEFT JOIN (
//         SELECT
//           event_id,
//           student_id,
//           COUNT(*) FILTER (WHERE status = 'Present') AS present_count
//         FROM attendance
//         WHERE student_id = $1
//         GROUP BY event_id, student_id
//       ) att
//         ON att.event_id = r.event_id
//        AND att.student_id = r.student_id

//       WHERE r.student_id = $1
//       ORDER BY e.start_time DESC
//       `,
//       [studentId]
//     );

//     return res.json({ records: r.rows });
//   } catch (err) {
//     console.error("getMyParticipation error:", err);
//     return res.status(500).json({ error: "Failed to fetch participation" });
//   }
// };

import { pool } from "../config/db.js";
import { evaluateParticipation } from "../utils/participationPolicyEngine.js";

const safeJson = (v, fallback = {}) => {
  if (!v) return fallback;
  if (typeof v === "object") return v; // JSONB comes as object
  try { return JSON.parse(v); } catch { return fallback; }
};

export const getMyParticipation = async (req, res) => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) return res.status(401).json({ error: "Unauthorized" });

    /* ================= BASE DATA ================= */
    const base = await pool.query(
      `
      SELECT
        r.event_id,
        e.title AS event_title,
        e.start_time,
        e.end_time,
        e.event_type,
        e.venue,
        e.attendance_policy,
        e.certificate_policy,
        c.name AS club_name,

        r.certified,
        r.certificate_no,
        r.issued_at,
        r.verification_hash,
        r.eligibility_snapshot,

        (DATE(e.end_time) - DATE(e.start_time) + 1) AS total_days
      FROM registrations r
      JOIN events e ON e.id = r.event_id
      JOIN clubs c ON c.id = e.club_id
      WHERE r.student_id = $1
      ORDER BY e.start_time DESC
      `,
      [studentId]
    );

    /* ================= ATTENDANCE DATA ================= */
    const att = await pool.query(
      `
      SELECT event_id, day, status
      FROM attendance
      WHERE student_id = $1
      `,
      [studentId]
    );

    const attendanceByEvent = {};
    for (const row of att.rows) {
      attendanceByEvent[row.event_id] ||= [];
      attendanceByEvent[row.event_id].push(row);
    }

    /* ================= COMPUTE PARTICIPATION ================= */
    const records = base.rows.map((ev) => {
      const attendanceRows = attendanceByEvent[ev.event_id] || [];

      const result = evaluateParticipation({
        attendanceRows,
        totalDays: Number(ev.total_days),
        attendancePolicy: ev.attendance_policy || "MANUAL",
        certificatePolicy: safeJson(ev.certificate_policy, {}),
      });

      const hasCertificate =
        ev.certified === true || !!ev.certificate_no || !!ev.verification_hash;

      const participation_state = hasCertificate
        ? "Certified"
        : result.attended
        ? "Attended"
        : "Registered";

      const explanationLines = [
        `Registered `,
        `Attendance: ${result.attendedDays}/${ev.total_days} days (${result.attendancePercent}%)`,
        result.explanation,
        `Certificate: ${
          hasCertificate
            ? "Issued "
            : result.certificateEligible
            ? "Eligible "
            : "Not eligible"
        }`,
      ];

      return {
        event_id: ev.event_id,
        event_title: ev.event_title,
        club_name: ev.club_name,
        start_time: ev.start_time,
        end_time: ev.end_time,
        event_type: ev.event_type,
        venue: ev.venue,

        participation_state,
        attended_days: result.attendedDays,
        total_days: Number(ev.total_days),
        attendance_percent: result.attendancePercent,

        certified: ev.certified,
        certificate_no: ev.certificate_no,
        issued_at: ev.issued_at,
        verification_hash: ev.verification_hash,
        eligibility_snapshot: ev.eligibility_snapshot,

        explanation: explanationLines.join("\n"),
      };
    });

    return res.json({ records });
  } catch (err) {
    console.error("getMyParticipation error:", err?.message);
    console.error(err);
    return res.status(500).json({ error: err?.message || "Failed to fetch participation" });
  }
};
