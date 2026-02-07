import { registerStudent, loginStudent } from "../services/student.service.js";

// Signup
export const studentSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const student = await registerStudent(name, email, password);
    res.status(201).json({ message: "Student created", student });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login
export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, student } = await loginStudent(email, password);
    res.json({ token, role: student.role, name: student.name });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// Dashboard
export const studentDashboard = async (req, res) => {
  try {
    const studentId = req.user.userId;
    res.json({ message: "Welcome to your dashboard", studentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Longitudinal participation profile (Registered vs Attended vs Certified)
export const getMyParticipationProfile = async (req, res, next) => {
  try {
    const studentId = req.user.userId;

    const { query } = await import("../config/db.js");

    const result = await query(
      `
      SELECT
        e.id AS event_id,
        e.title AS event_title,
        e.event_type,
        e.status AS event_status,
        e.start_time,
        e.end_time,
        c.name AS club_name,
        r.created_at AS registered_at,
        a.check_in_time,
        a.check_out_time,
        a.status AS attendance_status,
        cert.verification_code,
        cert.certificate_type,
        cert.issued_at,
        CASE
          WHEN cert.id IS NOT NULL THEN 'Certified'
          WHEN a.status = 'Present' THEN 'Attended'
          WHEN r.id IS NOT NULL THEN 'Registered'
          ELSE 'None'
        END AS participation_state,
        CASE
          WHEN r.id IS NULL THEN 'Not registered'
          WHEN a.status IS NULL THEN 'Registered but no attendance record'
          WHEN a.status <> 'Present' THEN 'Attendance not marked as present'
          WHEN cert.id IS NULL THEN 'Attended, awaiting certificate (or not eligible)'
          ELSE 'Certificate issued'
        END AS explanation
      FROM events e
      LEFT JOIN clubs c ON c.id = e.club_id
      LEFT JOIN registrations r
        ON r.event_id = e.id AND r.student_id = $1
      LEFT JOIN attendance a
        ON a.event_id = e.id AND a.student_id = $1
      LEFT JOIN certificates cert
        ON cert.event_id = e.id AND cert.student_id = $1
      WHERE r.id IS NOT NULL OR a.event_id IS NOT NULL OR cert.event_id IS NOT NULL
      ORDER BY e.start_time DESC;
      `,
      [studentId]
    );

    res.json({ studentId, records: result.rows });
  } catch (err) {
    next(err);
  }
};
