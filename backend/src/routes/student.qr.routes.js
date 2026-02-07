import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { scanEventQr } from "../controllers/student.qr.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/events/:eventId/qr/scan", scanEventQr);

export default router;
