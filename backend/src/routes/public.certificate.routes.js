import express from "express";
import { verifyCertificatePublic } from "../controllers/public.certificate.controller.js";

const router = express.Router();
router.get("/certificates/verify", verifyCertificatePublic);

export default router;
