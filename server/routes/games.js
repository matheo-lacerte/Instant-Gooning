import express from "express";
import { getAllGames, getGameById, createGame, updateGame, deleteGame } from "../controllers/gamesController.js";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { writeLimiter } from "../middleware/rateLimit.js";
const router = express.Router();

router.get("/getAllGames", getAllGames);
router.get("/getGameById/:id", getGameById);
router.post("/createGame", authMiddleware, requireUser, writeLimiter, createGame);
router.patch("/update/:id", authMiddleware, requireUser, writeLimiter, updateGame);
router.delete("/delete/:id", authMiddleware, requireUser, writeLimiter, deleteGame);
export default router;