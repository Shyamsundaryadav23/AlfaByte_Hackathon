// controllers/student.qr.controller.js
import { pool } from "../config/db.js";

export const scanEventQr = async (req, res) => {
  try {
    const studentId = req.user?.userId;
    const { eventId } = req.params;
    const { token } = req.body;

    if (!studentId) return res.status(401).json({ error: "Invalid student token" });
    if (!token) return res.status(400).json({ error: "token required" });

    // ✅ Check event exists and is Live
    const ev = await pool.query(
      "SELECT status FROM events WHERE id=$1",
      [eventId]
    );
    if (ev.rows.length === 0) return res.status(404).json({ error: "Event not found" });
    if (ev.rows[0].status !== "Live") return res.status(400).json({ error: "Event is not Live" });

    // ✅ find QR session by token (now includes day)
    const session = await pool.query(
      `SELECT event_id, day, qr_type, expires_at, is_active
       FROM event_qr_sessions
       WHERE token=$1`,
      [token]
    );

    if (session.rows.length === 0) return res.status(400).json({ error: "Invalid QR" });

    const s = session.rows[0];

    if (!s.is_active) return res.status(400).json({ error: "QR is not active" });

    // ✅ Expired → deactivate
    if (new Date(s.expires_at) < new Date()) {
      await pool.query("UPDATE event_qr_sessions SET is_active=false WHERE token=$1", [token]);
      return res.status(400).json({ error: "QR expired" });
    }

    if (String(s.event_id) !== String(eventId)) {
      return res.status(400).json({ error: "QR does not belong to this event" });
    }

    // ✅ Save scan day-wise
    await pool.query(
      `INSERT INTO event_qr_scans(event_id, day, student_id, qr_type, scanned_at)
       VALUES ($1,$2,$3,$4,NOW())
       ON CONFLICT (event_id, day, student_id, qr_type) DO NOTHING`,
      [eventId, s.day, studentId, s.qr_type]
    );

    /**
     * ✅ QR SPECIAL: capture student details snapshot in DB
     * You can store into separate table: event_scan_student_snapshot
     * If you already have a table, use that.
     */
    await pool.query(
      `INSERT INTO event_scan_student_snapshot(event_id, day, student_id, roll_no, department, phone, gender, year, created_at)
       SELECT $1,$2,$3, roll_no, department, phone, gender, year, NOW()
       FROM students
       WHERE id=$3
       ON CONFLICT (event_id, day, student_id) DO NOTHING`,
      [eventId, s.day, studentId]
    );

    // EXIT → verify ENTRY (same day) → mark attendance present
    if (s.qr_type === "EXIT") {
      const entry = await pool.query(
        `SELECT 1 FROM event_qr_scans
         WHERE event_id=$1 AND day=$2 AND student_id=$3 AND qr_type='ENTRY'`,
        [eventId, s.day, studentId]
      );

      if (entry.rows.length > 0) {
        await pool.query(
          `INSERT INTO attendance(event_id, day, student_id, status)
           VALUES ($1,$2,$3,'Present')
           ON CONFLICT (event_id, day, student_id)
           DO UPDATE SET status='Present'`,
          [eventId, s.day, studentId]
        );

        return res.json({ message: "Exit scanned ✅ Attendance marked Present" });
      }

      return res.json({ message: "Exit scanned. Entry missing ❌ Attendance not marked yet." });
    }

    return res.json({ message: "Entry scanned ✅ Now scan Exit at end." });
  } catch (err) {
    console.error("scanEventQr error:", err);
    res.status(500).json({ error: err.message });
  }
};
