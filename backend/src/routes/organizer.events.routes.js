import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { organizerOnly } from "../middleware/organizerOnly.js";
import {
  getMyClubEvents,
  createMyClubEvent,
  updateMyClubEventStatus,
} from "../controllers/organizer.events.controller.js";

const router = express.Router();

router.use(authMiddleware, organizerOnly);

router.get("/events", getMyClubEvents);
router.post("/events", createMyClubEvent);
router.put("/events/:eventId/status", updateMyClubEventStatus);

export default router;
