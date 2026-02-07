import express from "express";
import { login, getProfile } from "../controllers/organizer.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { organizerOnly } from "../middleware/organizerOnly.js";

const router = express.Router();

router.post("/login", login);
router.get("/profile", authMiddleware, organizerOnly, getProfile);

export default router;
