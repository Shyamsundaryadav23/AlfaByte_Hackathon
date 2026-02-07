import express from "express";
import { registerEvent } from "../controllers/registration.controller.js";

const router = express.Router();

router.post("/", registerEvent);

export default router;
