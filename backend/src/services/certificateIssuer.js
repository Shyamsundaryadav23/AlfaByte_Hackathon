// services/certificateIssuer.js
import { pool } from "../config/db.js";
import { buildCertificateNo, buildVerificationHash } from "../utils/certificates.js";
import { checkEligibility } from "./certificateEligibility.js";

export async function issueCertificateForStudent(eventId, studentId, { force = false } = {}) {
  // get event meta
  const ev = await pool.query(
    `SELECT id, start_time, status, event_seq FROM events WHERE id=$1`,
    [eventId]
  );
  if (!ev.rows.length) throw new Error("Event not found");

  const event = ev.rows[0];
  const year = new Date(event.start_time).getFullYear();
  const eventSeq = Number(event.event_seq || event.id);

  // ensure registration exists
  const reg = await pool.query(
    `SELECT certified, certificate_no, issued_at, verification_hash
     FROM registrations
     WHERE event_id=$1 AND student_id=$2`,
    [eventId, studentId]
  );
  if (!reg.rows.length) throw new Error("Student is not registered");

  // If already issued and not forcing -> return existing
  if (reg.rows[0].certificate_no && !force) {
    return {
      alreadyIssued: true,
      certificate_no: reg.rows[0].certificate_no,
      verification_hash: reg.rows[0].verification_hash,
      issued_at: reg.rows[0].issued_at,
    };
  }

  // eligibility check (policy-ready)
  const eligibility = await checkEligibility(eventId, studentId);
  if (!eligibility.eligible && !force) {
    return { eligible: false, ...eligibility };
  }

  // serial per event
  const serialRes = await pool.query(
    `SELECT COALESCE(MAX(
        NULLIF(split_part(certificate_no, '-', 5), '')::int
     ), 0) + 1 AS next_serial
     FROM registrations
     WHERE event_id=$1 AND certificate_no IS NOT NULL`,
    [eventId]
  );
  const nextSerial = Number(serialRes.rows[0]?.next_serial || 1);

  const certificateNo = buildCertificateNo({ year, eventSeq, serial: nextSerial });
  const issuedAt = new Date();
  const issuedAtISO = issuedAt.toISOString();
  const vHash = buildVerificationHash({
    certificateNo,
    studentId,
    eventId,
    issuedAtISO,
  });

  // update registrations
  await pool.query(
    `UPDATE registrations
     SET certified=true,
         certificate_no=$1,
         issued_at=$2,
         verification_hash=$3,
         eligibility_snapshot=$4
     WHERE event_id=$5 AND student_id=$6`,
    [certificateNo, issuedAt, vHash, JSON.stringify(eligibility), eventId, studentId]
  );

  return {
    eligible: true,
    certificate_no: certificateNo,
    verification_hash: vHash,
    issued_at: issuedAtISO,
    eligibility,
  };
}
