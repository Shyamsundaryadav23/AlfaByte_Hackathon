import express from "express";
import { getEventReports } from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @route GET /api/reports
 * @desc Admin generates event reports
 */
router.get("/", authMiddleware, roleMiddleware("Admin"), getEventReports);

export default router;
