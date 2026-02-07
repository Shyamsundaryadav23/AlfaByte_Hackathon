import { query } from "../config/db.js";

export const registerStudent = async (eventId, studentId) => {
  const result = await query(
    `INSERT INTO registrations (event_id, student_id)
     VALUES ($1,$2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [eventId, studentId]
  );
  return result.rows[0];
};

// Mark attendance (QR entry/exit)
// export const markAttendance = async (eventId, studentId, type) => {
//   if (type === "entry") {
//     const result = await query(
//       `UPDATE attendance
//        SET check_in_time = NOW(), status = 'Present'
//        WHERE event_id = $1 AND student_id = $2
//        RETURNING *`,
//       [eventId, studentId]
//     );
//     // If no row exists, create it
//     if (result.rowCount === 0) {
//       const insertResult = await query(
//         `INSERT INTO attendance (event_id, student_id, check_in_time, status)
//          VALUES ($1, $2, NOW(), 'Present')
//          RETURNING *`,
//         [eventId, studentId]
//       );
//       return insertResult.rows[0];
//     }
//     return result.rows[0];
//   } else if (type === "exit") {
//     const result = await query(
//       `UPDATE attendance
//        SET check_out_time = NOW()
//        WHERE event_id = $1 AND student_id = $2
//        RETURNING *`,
//       [eventId, studentId]
//     );
//     return result.rows[0];
//   } else {
//     throw new Error("Invalid attendance type");
//   }
// };
export const markAttendance = async (eventId, studentId, type) => {
  if (type === "entry") {
    // Upsert attendance row
    const result = await query(
      `INSERT INTO attendance (event_id, student_id, check_in_time, status)
       VALUES ($1, $2, NOW(), 'Present')
       ON CONFLICT (event_id, student_id)
       DO UPDATE SET check_in_time = NOW(), status = 'Present'
       RETURNING *`,
      [eventId, studentId]
    );
    return result.rows[0];
  } else if (type === "exit") {
    // Only update check_out_time if entry exists
    const result = await query(
      `UPDATE attendance
       SET check_out_time = NOW()
       WHERE event_id = $1 AND student_id = $2 AND check_in_time IS NOT NULL
       RETURNING *`,
      [eventId, studentId]
    );
    if (result.rowCount === 0) {
      throw new Error("Cannot mark exit: student did not check in");
    }
    return result.rows[0];
  } else {
    throw new Error("Invalid attendance type");
  }
};


// Get event attendance
export const getEventAttendance = async (eventId) => {
  const result = await query(
    `SELECT a.*, u.name, u.email
     FROM attendance a
     JOIN users u ON a.student_id = u.id
     WHERE a.event_id = $1`,
    [eventId]
  );
  return result.rows;
};

export const hasStudentAttended = async (eventId, studentId) => {
  const result = await query(
    `SELECT * FROM attendance WHERE event_id = $1 AND student_id = $2 AND status = 'Present'`,
    [eventId, studentId]
  );
  return result.rowCount > 0;
};
