import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireVerifiedStudent } from "../middleware/requireVerifiedStudent.js";
import { registerForEvent } from "../controllers/student.eventRegistration.controller.js";

const router = express.Router();

// ✅ Matches frontend
router.post(
  "/clubs/:clubId/events/:eventId/register",
  authMiddleware,
  requireVerifiedStudent,
  registerForEvent
);

export default router;
