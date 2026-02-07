import express from "express";
import { createNewEvent, getEvents, changeEventStatus } from "../controllers/event.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @route POST /api/events
 * @desc Create event (Organizer/Admin)
 */
router.post("/", authMiddleware, roleMiddleware("Organizer", "Admin"), createNewEvent);

/**
 * @route GET /api/events
 * @desc Get all events
 */
router.get("/", authMiddleware, getEvents);

/**
 * @route PUT /api/events/status
 * @desc Update event status (Organizer/Admin)
 */
router.put("/status", authMiddleware, roleMiddleware("Organizer", "Admin"), changeEventStatus);

export default router;
