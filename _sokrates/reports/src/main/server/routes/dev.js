import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { leaveDev, getDevStatus, getDevGames, disableAllMyGames, transferGameOwnership } from "../controllers/devController.js";
const router = express.Router();

router.post("/leave", authMiddleware, requireUser, leaveDev);
router.get("", authMiddleware, requireUser, getDevStatus);
router.get("/games", authMiddleware, requireUser, getDevGames);
router.patch("/disable-all", authMiddleware, requireUser, disableAllMyGames);
router.post("/transfer-game", authMiddleware, requireUser, transferGameOwnership);


export default router;
