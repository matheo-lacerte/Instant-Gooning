import express from "express";
import { getAllGames, getGameById, createGame, updateGame } from "../controllers/gamesController.js";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
const router = express.Router();

router.get("/getAllGames", getAllGames);
router.get("/getGameById/:id", getGameById);
router.post("/createGame", authMiddleware, requireUser, createGame);
router.patch("/update/:id", authMiddleware, requireUser, updateGame);
export default router;