import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { organizerOnly } from "../middleware/organizerOnly.js";
import {
  openAttendanceSession,
  markAttendanceBySession
} from "../controllers/organizer.attendance.controller.js";

const router = express.Router();
router.use(authMiddleware, organizerOnly);

// organizer opens attendance session
router.post("/events/:eventId/attendance/open", openAttendanceSession);

// organizer can also mark manually by code (optional)
router.post("/events/:eventId/attendance/mark", markAttendanceBySession);

export default router;
