// services/autoCertificateJob.js
import { pool } from "../config/db.js";
import { issueCertificateForStudent } from "./certificateIssuer.js";

export async function issueCertificatesForEventIfCompleted(eventId) {
  // event must be Completed
  const ev = await pool.query(`SELECT status FROM events WHERE id=$1`, [eventId]);
  if (!ev.rows.length) return;
  if (ev.rows[0].status !== "Completed") return;

  // all registered students
  const regs = await pool.query(
    `SELECT student_id FROM registrations WHERE event_id=$1`,
    [eventId]
  );

  for (const row of regs.rows) {
    try {
      // auto: don't force
      await issueCertificateForStudent(eventId, row.student_id, { force: false });
    } catch {
      // ignore one student failure; keep job going
    }
  }
}
