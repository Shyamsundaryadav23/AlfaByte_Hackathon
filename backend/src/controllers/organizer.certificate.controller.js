// import { pool } from "../config/db.js";
// import crypto from "crypto";

// export const issueCertificateForStudent = async (req, res) => {
//   try {
//     const { clubId } = req.user;
//     const { eventId } = req.params;
//     const { student_id } = req.body;

//     if (!student_id) return res.status(400).json({ error: "student_id required" });

//     // 1) Event belongs to club and should be completed
//     const ev = await pool.query(
//       "SELECT id, status, title FROM events WHERE id=$1 AND club_id=$2",
//       [eventId, clubId]
//     );
//     if (ev.rows.length === 0) return res.status(404).json({ error: "Event not found" });

//     if (ev.rows[0].status !== "Completed" && ev.rows[0].status !== "Archived") {
//       return res.status(400).json({ error: "Event must be Completed before issuing certificates" });
//     }

//     // 2) Must be registered
//     const reg = await pool.query(
//       "SELECT id FROM registrations WHERE event_id=$1 AND student_id=$2",
//       [eventId, student_id]
//     );
//     if (reg.rows.length === 0) return res.status(400).json({ error: "Student not registered for this event" });

//     // 3) Must be attended
//     const att = await pool.query(
//       "SELECT status FROM attendance WHERE event_id=$1 AND student_id=$2",
//       [eventId, student_id]
//     );
//     if (att.rows.length === 0 || att.rows[0].status !== "Present") {
//       return res.status(400).json({ error: "Student did not attend (Present) this event" });
//     }

//     // 4) Issue certificate (idempotent)
//     const code = crypto.randomBytes(6).toString("hex").toUpperCase();

//     const cert = await pool.query(
//       `INSERT INTO certificates (event_id, student_id, verification_code, issued_at)
//        VALUES ($1,$2,$3,NOW())
//        ON CONFLICT (event_id, student_id) DO UPDATE
//        SET issued_at=NOW()
//        RETURNING *`,
//       [eventId, student_id, code]
//     );

//     res.json({ message: "Certificate issued", certificate: cert.rows[0] });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// controllers/organizer.certificates.controller.js
import { issueCertificateForStudent } from "../services/certificateIssuer.js";

export const issueCertificate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { student_id, force } = req.body;

    const result = await issueCertificateForStudent(eventId, student_id, { force: !!force });

    if (result.eligible === false) {
      return res.status(400).json({ error: "Not eligible", details: result });
    }

    return res.json({ message: "Certificate issued", ...result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
