// import { pool } from "../config/db.js";

// // registrations + attendance + certificate status in one list
// export const getEventParticipants = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const { day } = req.query;

//     // event meta
//     const ev = await pool.query(
//       "SELECT id, title, start_time, end_time, status FROM events WHERE id=$1",
//       [eventId]
//     );
//     if (!ev.rows.length) return res.status(404).json({ error: "Event not found" });

//     // participants + day-wise attendance (fallback Absent)
//     const q = await pool.query(
//       `
//       SELECT 
//         r.student_id,
//         s.name,
//         s.email,
//         COALESCE(a.status, 'Absent') AS attendance_status,
//         r.certified,
//         r.verification_code
//       FROM registrations r
//       JOIN students s ON s.id = r.student_id
//       LEFT JOIN attendance a 
//         ON a.event_id = r.event_id 
//        AND a.student_id = r.student_id
//        AND ($2::date IS NULL OR a.day = $2::date)
//       WHERE r.event_id = $1
//       ORDER BY s.name ASC
//       `,
//       [eventId, day || null]
//     );

//     return res.json({
//       eventStatus: ev.rows[0].status,
//       event: ev.rows[0], // ✅ includes start_time/end_time
//       participants: q.rows,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Failed to fetch participants" });
//   }
// };

// // manual mark present/absent
// export const setAttendanceManual = async (req, res) => {
//   try {
//     const { clubId } = req.user;
//     const { eventId } = req.params;
//     const { student_id, status } = req.body;

//     if (!student_id) return res.status(400).json({ error: "student_id required" });
//     if (!["Present", "Absent"].includes(status)) {
//       return res.status(400).json({ error: "status must be Present or Absent" });
//     }

//     const ev = await pool.query(
//       "SELECT id FROM events WHERE id=$1 AND club_id=$2",
//       [eventId, clubId]
//     );
//     if (ev.rows.length === 0) return res.status(404).json({ error: "Event not found" });

//     await pool.query(
//       `
//       INSERT INTO attendance (event_id, student_id, status, marked_at)
//       VALUES ($1,$2,$3,NOW())
//       ON CONFLICT (event_id, student_id)
//       DO UPDATE SET status=$3, marked_at=NOW()
//       `,
//       [eventId, student_id, status]
//     );

//     res.json({ message: "Attendance updated" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import { pool } from "../config/db.js";

// registrations + attendance + certificate status in one list
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { day } = req.query;

    // event meta
    const ev = await pool.query(
      "SELECT id, title, start_time, end_time, status FROM events WHERE id=$1",
      [eventId]
    );
    if (!ev.rows.length) return res.status(404).json({ error: "Event not found" });

    // participants + day-wise attendance (fallback Absent)
    const q = await pool.query(
      `
      SELECT 
        r.student_id,
        s.name,
        s.email,
        COALESCE(a.status, 'Absent') AS attendance_status,

        -- certificate fields that exist
        r.certified,
        r.certificate_no,
        r.verification_hash,
        r.issued_at

      FROM registrations r
      JOIN students s ON s.id = r.student_id
      LEFT JOIN attendance a 
        ON a.event_id = r.event_id 
       AND a.student_id = r.student_id
       AND ($2::date IS NULL OR a.day = $2::date)
      WHERE r.event_id = $1
      ORDER BY s.name ASC
      `,
      [eventId, day || null]
    );

    return res.json({
      eventStatus: ev.rows[0].status,
      event: ev.rows[0],
      participants: q.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch participants" });
  }
};
