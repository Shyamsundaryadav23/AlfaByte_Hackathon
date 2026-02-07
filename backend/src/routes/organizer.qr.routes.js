import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { organizerOnly } from "../middleware/organizerOnly.js";
import { openEventQr } from "../controllers/organizer.qr.controller.js";

const router = express.Router();
router.use(authMiddleware, organizerOnly);

router.post("/events/:eventId/qr/open", openEventQr);

export default router;
