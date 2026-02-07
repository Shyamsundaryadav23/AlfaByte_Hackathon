import express from "express";
import { registerStudent, verifyEmailOtp, loginStudent, getMyProfile } from "../controllers/student.auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireVerifiedStudent } from "../middleware/requireVerifiedStudent.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/verify-otp", verifyEmailOtp);
router.post("/login", loginStudent);
router.get("/me", authMiddleware, requireVerifiedStudent, getMyProfile); 

export default router;
