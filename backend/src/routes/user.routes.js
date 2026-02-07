import express from "express";
import { getUsers, changeUserRole } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users (Admin only)
 */
router.get("/", authMiddleware, roleMiddleware("Admin"), getUsers);

/**
 * @route PUT /api/users/role
 * @desc Change user role (Admin only)
 */
router.put("/role", authMiddleware, roleMiddleware("Admin"), changeUserRole);

export default router;
