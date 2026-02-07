import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import { comparePassword } from "../utils/hash.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN ATTEMPT:", email, password);


  try {
    const result = await pool.query(
      "SELECT * FROM members WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const member = result.rows[0];

    if (member.status && member.status !== "Active") {
      return res.status(403).json({ error: "Member account is inactive" });
    }
    
    const isMatch = await comparePassword(password, member.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { memberId: member.id, clubId: member.club_id, role: member.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
        clubId: member.club_id,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { memberId } = req.user;
    const result = await pool.query(
      "SELECT id, name, email, role, club_id, status FROM members WHERE id=$1",
      [memberId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
