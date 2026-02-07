import nodemailer from "nodemailer";
import { env } from "./env.js";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,          // ✅ IMPORTANT
  secure: false,      // ✅ must be false for 587
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS, // Google App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});
