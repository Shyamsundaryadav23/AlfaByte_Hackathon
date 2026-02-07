import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { organizerOnly } from "../middleware/organizerOnly.js";
import { issueCertificate } from "../controllers/organizer.certificate.controller.js";

const router = express.Router();
router.use(authMiddleware, organizerOnly);

router.post("/events/:eventId/certificates/issue", issueCertificate);

export default router;
