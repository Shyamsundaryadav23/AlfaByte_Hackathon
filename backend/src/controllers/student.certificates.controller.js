import { pool } from "../config/db.js";
import { renderCertificatePDF } from "../services/certificateRenderer.js";

export const downloadCertificate = async (req, res) => {
  const studentId = req.user.userId;
  const { certificateNo } = req.params;

  const r = await pool.query(
    `
    SELECT
      r.certificate_no,
      r.verification_hash,
      r.issued_at,
      s.name AS student_name,
      s.roll_no,
      s.department,
      e.title AS event_title,
      e.start_time,
      e.end_time,
      c.name AS club_name,
      t.template_html
    FROM registrations r
    JOIN students s ON s.id=r.student_id
    JOIN events e ON e.id=r.event_id
    JOIN clubs c ON c.id=e.club_id
    JOIN certificate_templates t ON t.event_id=e.id
    WHERE r.student_id=$1 AND r.certificate_no=$2
    `,
    [studentId, certificateNo]
  );

  if (!r.rows.length)
    return res.status(404).json({ error: "Certificate not found" });

  const d = r.rows[0];

  const verify_url = `${process.env.PUBLIC_BACKEND_URL}/api/public/certificates/verify?no=${d.certificate_no}&hash=${d.verification_hash}`;

  const pdf = await renderCertificatePDF(d.template_html, {
    student_name: d.student_name,
    roll_no: d.roll_no,
    department: d.department,
    event_title: d.event_title,
    club_name: d.club_name,
    start_date: new Date(d.start_time).toLocaleDateString("en-IN"),
    end_date: new Date(d.end_time).toLocaleDateString("en-IN"),
    issued_at: new Date(d.issued_at).toLocaleDateString("en-IN"),
    certificate_no: d.certificate_no,
    verification_hash: d.verification_hash,
    verify_url,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${d.certificate_no}.pdf"`
  );
  res.send(pdf);
};
