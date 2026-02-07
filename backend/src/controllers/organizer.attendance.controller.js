import { pool } from "../config/db.js";
import crypto from "crypto";

export const openAttendanceSession = async (req, res) => {
  const { clubId } = req.user;
  const { eventId } = req.params;

  // verify event belongs to club
  const ev = await pool.query("SELECT id FROM events WHERE id=$1 AND club_id=$2", [eventId, clubId]);
  if (ev.rows.length === 0) return res.status(404).json({ error: "Event not found" });

  const code = crypto.randomBytes(3).toString("hex").toUpperCase(); // like "A1B2C3"
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    `UPDATE events SET attendance_session_code=$1, attendance_session_expires=$2
     WHERE id=$3 AND club_id=$4`,
    [code, expiresAt, eventId, clubId]
  );

  res.json({ message: "Attendance session opened", code, expiresAt });
};

export const markAttendanceBySession = async (req, res) => {
  const { eventId } = req.params;
  const { student_id, code } = req.body;

  const ev = await pool.query(
    "SELECT attendance_session_code, attendance_session_expires FROM events WHERE id=$1",
    [eventId]
  );
  if (ev.rows.length === 0) return res.status(404).json({ error: "Event not found" });

  const { attendance_session_code, attendance_session_expires } = ev.rows[0];

  if (!attendance_session_code || !attendance_session_expires) {
    return res.status(400).json({ error: "Attendance is not open for this event" });
  }
  if (code !== attendance_session_code) {
    return res.status(400).json({ error: "Invalid attendance code" });
  }
  if (new Date(attendance_session_expires) < new Date()) {
    return res.status(400).json({ error: "Attendance code expired" });
  }

  await pool.query(
    `INSERT INTO attendance (event_id, student_id, status)
     VALUES ($1,$2,'Present')
     ON CONFLICT (event_id, student_id) DO UPDATE SET status='Present'`,
    [eventId, student_id]
  );

  res.json({ message: "Attendance marked" });
};
