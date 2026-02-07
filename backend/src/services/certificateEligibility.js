// services/certificateEligibility.js
import { pool } from "../config/db.js";

/**
 * Basic eligibility (current system):
 * eligible if student has at least 1 Present attendance row for the event
 * (works for single-day + multi-day, but minimal rule).
 *
 * Later you can replace this with your policy engine rules.
 */
export async function checkEligibility(eventId, studentId) {
  const att = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE status='Present') AS present_count,
            COUNT(*) AS total_days
     FROM attendance
     WHERE event_id=$1 AND student_id=$2`,
    [eventId, studentId]
  );

  const presentCount = Number(att.rows[0]?.present_count || 0);
  const totalDays = Number(att.rows[0]?.total_days || 0);

  const eligible = presentCount > 0; // baseline

  return {
    eligible,
    presentCount,
    totalDays,
    explanation: eligible
      ? `Attendance: Present on ${presentCount} day(s) ✅`
      : `Attendance not marked Present`,
  };
}
