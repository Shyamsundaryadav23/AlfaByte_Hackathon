import { query } from "../config/db.js";
import { hasStudentAttended } from "../models/attendance.model.js";
import crypto from "crypto";

export const generateCertificate = async (eventId, studentId, type) => {
  const eligible = await hasStudentAttended(eventId, studentId);
  if (!eligible) throw new Error("Student not eligible");

  const code = crypto.randomBytes(8).toString("hex");

  const result = await query(
    `INSERT INTO certificates (event_id, student_id, certificate_type, verification_code)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [eventId, studentId, type, code]
  );

  return result.rows[0];
};

export const verifyCertificate = async (code) => {
  const result = await query(
    `SELECT c.*, u.name, e.title
     FROM certificates c
     JOIN users u ON c.student_id = u.id
     JOIN events e ON c.event_id = e.id
     WHERE verification_code = $1`,
    [code]
  );
  return result.rows[0];
};
