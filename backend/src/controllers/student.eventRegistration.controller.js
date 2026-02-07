// import { pool } from "../config/db.js";

// export const registerForEvent = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const studentId = req.user.userId;

//     const { rollNo, department, phone, gender, year } = req.body;

//     if (!rollNo || !department || !phone || !gender || !year) {
//       return res.status(400).json({
//         error: "rollNo, department, phone, gender, year are required",
//       });
//     }

//     // ✅ check student exists
//     const s = await pool.query("SELECT id FROM students WHERE id=$1", [studentId]);
//     if (s.rows.length === 0) return res.status(404).json({ error: "Student not found" });

//     // ✅ Save/update student profile fields
//     await pool.query(
//       `UPDATE students
//        SET roll_no=$1,
//            department=$2,
//            phone=$3,
//            gender=$4,
//            year=$5,
//            updated_at=NOW()
//        WHERE id=$6`,
//       [rollNo, department, phone, gender, year, studentId]
//     );

//     // ✅ insert registration (prevent duplicates)
//     const created = await pool.query(
//       `INSERT INTO registrations (event_id, student_id, created_at)
//        VALUES ($1, $2, NOW())
//        ON CONFLICT (student_id, event_id) DO NOTHING
//        RETURNING id`,
//       [eventId, studentId]
//     );

//     if (created.rows.length === 0) {
//       return res.status(409).json({ error: "Already registered for this event" });
//     }

//     return res.json({
//       message: "Registered successfully",
//       registrationId: created.rows[0].id,
//     });
//   } catch (err) {
//     console.error("registerForEvent error:", err);
//     return res.status(500).json({ error: "Event registration failed" });
//   }
// };
import { pool } from "../config/db.js";

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user.userId;

    const { rollNo, department, phone, gender, year } = req.body;

    /* ================= STUDENT PROFILE ================= */
    const studentRes = await pool.query(
      `SELECT roll_no, department, phone, gender, year
       FROM students WHERE id=$1`,
      [studentId]
    );

    if (studentRes.rows.length === 0)
      return res.status(404).json({ error: "Student not found" });

    const profile = studentRes.rows[0];
    const profileComplete =
      profile.roll_no &&
      profile.department &&
      profile.phone &&
      profile.gender &&
      profile.year;

    if (!profileComplete) {
      if (!rollNo || !department || !phone || !gender || !year) {
        return res.status(400).json({
          error: "Profile incomplete. Please fill required details.",
        });
      }

      await pool.query(
        `UPDATE students
         SET roll_no=$1, department=$2, phone=$3, gender=$4, year=$5, updated_at=NOW()
         WHERE id=$6`,
        [rollNo, department, phone, gender, year, studentId]
      );
    }

    /* ================= EVENT CAPACITY CHECK ================= */
    const eventRes = await pool.query(
      `SELECT capacity FROM events WHERE id=$1`,
      [eventId]
    );

    if (eventRes.rows.length === 0)
      return res.status(404).json({ error: "Event not found" });

    const capacity = eventRes.rows[0].capacity ?? 200;

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM registrations WHERE event_id=$1`,
      [eventId]
    );

    const registeredCount = Number(countRes.rows[0].count);

    if (registeredCount >= capacity) {
      return res.status(409).json({ error: "Event is full" });
    }

    /* ================= REGISTER EVENT ================= */
    const created = await pool.query(
      `INSERT INTO registrations (event_id, student_id, created_at)
       VALUES ($1,$2,NOW())
       ON CONFLICT (student_id, event_id) DO NOTHING
       RETURNING id`,
      [eventId, studentId]
    );

    if (created.rows.length === 0) {
      return res.status(409).json({ error: "Already registered" });
    }

    /* ================= UPDATE registered_count ================= */
    await pool.query(
      `UPDATE events
       SET registered_count = registered_count + 1
       WHERE id = $1`,
      [eventId]
    );

    return res.json({
      message: "Registered successfully",
      registrationId: created.rows[0].id,
    });
  } catch (err) {
    console.error("registerForEvent error:", err);
    res.status(500).json({ error: "Event registration failed" });
  }
};
