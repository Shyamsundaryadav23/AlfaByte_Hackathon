import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { organizerOnly } from "../middleware/organizerOnly.js";
import {
  getCertificateTemplate,
  saveCertificateTemplate,
} from "../controllers/organizer.certificateTemplate.controller.js";

const router = express.Router();
router.use(authMiddleware, organizerOnly);

router.get("/events/:eventId/certificate/template", getCertificateTemplate);
router.put("/events/:eventId/certificate/template", saveCertificateTemplate);

export default router;
