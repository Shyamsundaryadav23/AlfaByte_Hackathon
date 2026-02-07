import express from "express";
import {
  getAllClubs,
  adminCreateClub,
  toggleClubStatus,
  getAuditLogs,
  getClubById
} from "../controllers/admin.controller.js";
import {
  getMembers,
  addMember,
  updateMemberRole,
  toggleMemberStatus,
  getMembersByClub
} from "../controllers/member.controller.js";
import { upload } from "../config/upload.js";

const router = express.Router();

/* Clubs */
router.get("/clubs", getAllClubs);
router.post("/clubs", upload.single("image"), adminCreateClub);
router.put("/clubs/:id/toggle", toggleClubStatus);

router.get("/members", getMembers);
router.post("/members", addMember);
router.get("/members/club/:clubId", getMembersByClub);
router.put("/members/:id/toggle", toggleMemberStatus);
router.put("/members/:id/role", updateMemberRole);
router.get("/clubs/:id", getClubById);

/* Audit Logs */
router.get("/audit", getAuditLogs);

export default router;
