import express from "express";
import { studentSignup, studentLogin, studentDashboard, getMyParticipationProfile } from "../controllers/student.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

// Public
router.post("/signup", studentSignup);
router.post("/login", studentLogin);

// Protected Student-only routes
router.get("/dashboard", authMiddleware, roleMiddleware("Student"), studentDashboard);

// Participation history (longitudinal)
router.get("/me/participation", authMiddleware, roleMiddleware("Student"), getMyParticipationProfile);

export default router;
