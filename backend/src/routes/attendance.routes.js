import express from "express";
import { registerForEvent, markAttendanceQR, getAttendance } from "../controllers/attendance.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @route POST /api/attendance/register
 * @desc Student registers for an event
 */
router.post("/register", authMiddleware, roleMiddleware("Student"), registerForEvent);

/**
 * @route POST /api/attendance/mark
 * @desc Organizer/Admin marks attendance
 */
router.post(
  "/qr",
  authMiddleware,
  roleMiddleware("Student"),
  markAttendanceQR
);


/**
 * @route GET /api/attendance/:eventId
 * @desc Get attendance list for an event
 */
router.get("/:eventId", authMiddleware, roleMiddleware("Organizer", "Admin"), getAttendance);

export default router;
