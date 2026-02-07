import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { organizerOnly } from "../middleware/organizerOnly.js";
import { getEventParticipants} from "../controllers/organizer.participants.controller.js";

const router = express.Router();
router.use(authMiddleware, organizerOnly);

router.get("/events/:eventId/participants", getEventParticipants);
// router.put("/events/:eventId/attendance/manual", setAttendanceManual);

export default router;
