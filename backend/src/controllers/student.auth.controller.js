import crypto from "crypto";
import { pool } from "../config/db.js";
import { transporter } from "../config/mailer.js";
import { env } from "../config/env.js";
import { generateToken } from "../config/jwt.js";
import bcrypt from "bcryptjs";

const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name,email,password required" });
    }

    // ✅ Check existing student
    const existing = await pool.query(
      "SELECT id, is_email_verified FROM students WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists. Please login." });
    }

    // ✅ Hash password properly
    const passHash = await bcrypt.hash(password, 10);

    const otp = makeOtp();
    const otpHash = hash(otp);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // ✅ Insert into students (NOT users)
    const created = await pool.query(
      `INSERT INTO students 
        (name, email, password_hash, is_email_verified, email_verification_code, email_verification_expires)
       VALUES ($1,$2,$3,false,$4,$5)
       RETURNING id, email`,
      [name, email, passHash, otpHash, expires]
    );

    // ✅ Send OTP email
    await transporter.sendMail({
      from: env.MAIL_USER,
      to: email,
      subject: "Verify your email - UCEF",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
      `,
    });

    return res.json({
      message: "OTP sent to email",
      studentId: created.rows[0].id,
    });
  } catch (err) {
    console.error("registerStudent error:", err);
    return res.status(500).json({ error: "Registration failed. Server error." });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "email, otp required" });

    const row = await pool.query(
      `SELECT id, email_verification_code, email_verification_expires, is_email_verified
       FROM students WHERE email=$1`,
      [email]
    );

    if (row.rows.length === 0) return res.status(404).json({ error: "Student not found" });

    const s = row.rows[0];

    if (s.is_email_verified) return res.json({ message: "Already verified" });

    if (!s.email_verification_expires || new Date(s.email_verification_expires) < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const otpHash = hash(String(otp));
    if (otpHash !== s.email_verification_code) return res.status(400).json({ error: "Invalid OTP" });

    await pool.query(
      `UPDATE students
       SET is_email_verified=true,
           email_verification_code=NULL,
           email_verification_expires=NULL,
           updated_at=NOW()
       WHERE id=$1`,
      [s.id]
    );

    const token = generateToken({ userId: s.id, role: "Student" });

    return res.json({ message: "Email verified", token });
  } catch (err) {
    console.error("verifyEmailOtp error:", err);
    return res.status(500).json({ error: "Verification failed. Server error." });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const result = await pool.query(
      "SELECT id, name, email, password_hash, is_email_verified FROM students WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const student = result.rows[0];

    const match = await bcrypt.compare(password, student.password_hash);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    if (!student.is_email_verified)
      return res.status(403).json({ error: "Email not verified" });

    const token = generateToken({
      userId: student.id,
      role: "Student",
    });

    return res.json({
      token,
      role: "Student",
      name: student.name,
      email: student.email,
    });
  } catch (err) {
    console.error("loginStudent error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const result = await pool.query(
      `SELECT 
        name, email, phone, roll_no, department, gender, year
       FROM students
       WHERE id = $1`,
      [studentId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Student not found" });

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};