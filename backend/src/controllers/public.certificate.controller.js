// controllers/public.certificate.controller.js
import { pool } from "../config/db.js";
import { buildVerificationHash } from "../utils/certificates.js";

export const verifyCertificatePublic = async (req, res) => {
  try {
    const { no, hash } = req.query;
    if (!no || !hash) return res.status(400).json({ error: "no and hash required" });

    const r = await pool.query(
      `
      SELECT
        r.certificate_no,
        r.verification_hash,
        r.issued_at,
        r.student_id,
        r.event_id,
        s.name AS student_name,
        s.roll_no,
        s.department,
        e.title AS event_title,
        e.start_time,
        c.name AS club_name
      FROM registrations r
      JOIN students s ON s.id = r.student_id
      JOIN events e ON e.id = r.event_id
      JOIN clubs c ON c.id = e.club_id
      WHERE r.certificate_no = $1
      `,
      [no]
    );

    if (!r.rows.length) return res.status(404).json({ verified: false, error: "Certificate not found" });

    const row = r.rows[0];
    if (!row.issued_at) return res.status(400).json({ verified: false, error: "Certificate not issued" });

    // recompute hash from trusted DB values
    const issuedAtISO = new Date(row.issued_at).toISOString();
    const expected = buildVerificationHash({
      certificateNo: row.certificate_no,
      studentId: row.student_id,
      eventId: row.event_id,
      issuedAtISO,
    });

    if (expected !== hash || row.verification_hash !== hash) {
      return res.status(400).json({ verified: false, error: "Invalid hash" });
    }

    return res.json({
      verified: true,
      certificate_no: row.certificate_no,
      issued_at: row.issued_at,
      student: {
        name: row.student_name,
        roll_no: row.roll_no,
        department: row.department,
      },
      event: {
        id: row.event_id,
        title: row.event_title,
        start_time: row.start_time,
        club: row.club_name,
      },
    });
  } catch (err) {
    return res.status(500).json({ verified: false, error: err.message });
  }
};
