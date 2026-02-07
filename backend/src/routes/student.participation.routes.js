import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getMyParticipation } from "../controllers/student.participation.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/me/participation", getMyParticipation);

export default router;
