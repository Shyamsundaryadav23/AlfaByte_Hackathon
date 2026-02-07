import { pool } from "../config/db.js";

export const saveClubProfileAndRegister = async (req, res) => {
  const { clubId, eventId } = req.params;
  const studentId = req.user.userId;

  const { rollNo, department, phone, gender, year } = req.body;

  if (!rollNo || !department || !phone || !gender || !year) {
    return res.status(400).json({ error: "All fields required" });
  }

  // Ensure profile exists (upsert)
  await pool.query(
    `INSERT INTO club_student_profiles (club_id, student_id, roll_no, department, phone, gender, year)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (club_id, student_id)
     DO UPDATE SET roll_no=EXCLUDED.roll_no, department=EXCLUDED.department, phone=EXCLUDED.phone,
                   gender=EXCLUDED.gender, year=EXCLUDED.year`,
    [clubId, studentId, rollNo, department, phone, gender, year]
  );

  // Register event
  await pool.query(
    `INSERT INTO registrations(event_id, student_id)
     VALUES ($1,$2)
     ON CONFLICT (event_id, student_id) DO NOTHING`,
    [eventId, studentId]
  );

  res.json({ message: "Profile saved and event registered" });
};
