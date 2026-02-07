import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { downloadCertificate } from "../controllers/student.certificates.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/certificates/:verificationCode/download", downloadCertificate);

export default router;
