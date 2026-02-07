import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireVerifiedStudent } from "../middleware/requireVerifiedStudent.js";
import { saveClubProfileAndRegister } from "../controllers/club.profile.controller.js";

const router = express.Router();

router.post(
  "/clubs/:clubId/events/:eventId/register",
  authMiddleware,
  requireVerifiedStudent,
  saveClubProfileAndRegister
);

export default router;
