import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { leaveDev, getDevStatus, getDevGames } from "../controllers/devController.js";
const router = express.Router();

router.post("/leave", authMiddleware, requireUser, leaveDev);
router.get("", authMiddleware, requireUser, getDevStatus);
router.get("/games", authMiddleware, requireUser, getDevGames);


export default router;
