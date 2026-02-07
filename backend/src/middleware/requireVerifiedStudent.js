import { pool } from "../config/db.js";

export const requireVerifiedStudent = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const r = await pool.query("SELECT is_email_verified FROM students WHERE id=$1", [userId]);

    if (r.rows.length === 0) return res.status(401).json({ error: "Student not found" });
    if (!r.rows[0].is_email_verified) return res.status(403).json({ error: "Email not verified" });

    next();
  } catch (err) {
    console.error("requireVerifiedStudent error:", err);
    res.status(500).json({ error: "Verification check failed" });
  }
};
