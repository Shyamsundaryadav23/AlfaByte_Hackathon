import express from "express";
import { signup, login } from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc Register new user
 */
router.post("/signup", signup);

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post("/login", login);

export default router;
