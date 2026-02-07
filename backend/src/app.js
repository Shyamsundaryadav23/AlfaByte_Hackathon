import express from "express";
import cors from "cors";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";

// Config
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import eventRoutes from "./routes/event.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import reportRoutes from "./routes/report.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import publicRoutes from "./routes/public.routes.js";
import organizerEventRoutes from "./routes/organizer.events.routes.js";
import certificateRoutes from "./routes/organizer.certificate.routes.js";
import organizerAttendanceRoutes from "./routes/organizer.attendance.routes.js";
import organizerAuthRoutes from "./routes/organizer.route.js";
import organizerParticipantsRoutes from "./routes/organizer.participants.routes.js";
import organizerQrRoutes from "./routes/organizer.qr.routes.js";
import studentQrRoutes from "./routes/student.qr.routes.js";
import studentAuthRoutes from "./routes/student.auth.routes.js";
import clubProfileRoutes from "./routes/club.profile.routes.js";
import studentEventRoutes from "./routes/student.events.routes.js";
import studentParticipationRoutes from "./routes/student.participation.routes.js"
import studentCertificateRoutes from "./routes/student.certificates.routes.js";
import publicCertRoutes from "./routes/public.certificate.routes.js";

// Middleware
import { authMiddleware } from "./middleware/auth.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/**
 * ✅ IMPORTANT:
 * Do NOT apply rateLimiter globally
 * because it blocks /api/public and /uploads (causes 429 + images fail)
 */

// ✅ NEVER rate-limit uploads (images)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ PUBLIC routes should NOT be rate-limited
app.use("/api/public", publicRoutes);

// ✅ AUTH routes should be rate-limited (protect OTP/login)
app.use("/api/students/auth", rateLimiter, studentAuthRoutes);
app.use("/api/auth", rateLimiter, authRoutes); // if used for admin/user auth
app.use("/api/organizers", rateLimiter, organizerAuthRoutes); // organizer login etc.
app.use("/api/admin", rateLimiter, adminRoutes); // admin auth + admin actions

// ✅ other APIs (optional limit) — if you want, keep limiter here
app.use("/api/users", rateLimiter, userRoutes);
app.use("/api/events", rateLimiter, eventRoutes);
app.use("/api/attendance", rateLimiter, attendanceRoutes);
app.use("/api/reports", rateLimiter, reportRoutes);
app.use("/api/registrations", rateLimiter, registrationRoutes);

app.use("/api/organizers", rateLimiter, organizerEventRoutes);
app.use("/api/organizers", rateLimiter, organizerAttendanceRoutes);
// app.use("/api/organizers", rateLimiter, certificateRoutes);
app.use("/api/organizers", rateLimiter, organizerParticipantsRoutes);
app.use("/api/organizers", rateLimiter, organizerQrRoutes);
app.use("/api/public", publicCertRoutes);


// Students protected routes
app.use("/api/students", rateLimiter, studentEventRoutes);
app.use("/api/students", rateLimiter, studentQrRoutes);
app.use("/api/students", rateLimiter, clubProfileRoutes);
app.use("/api/students", studentParticipationRoutes);
app.use("/api/students", studentCertificateRoutes);
// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error middleware (should be last)
app.use(errorMiddleware);

export default app;
