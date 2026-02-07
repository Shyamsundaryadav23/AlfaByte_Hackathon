import { pool } from "../config/db.js";

export const registerEvent = async (req, res) => {
  const { eventId, studentId } = req.body;

  try {
    const registration = await pool.query(
      "INSERT INTO registrations (event_id, student_id) VALUES ($1,$2) RETURNING *",
      [eventId, studentId]
    );

    res.json(registration.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Already registered or error occurred" });
  }
};
