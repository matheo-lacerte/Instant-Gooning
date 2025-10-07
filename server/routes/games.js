import express from "express";
import { getAllGames, getGameById, createGame } from "../controllers/gamesController.js";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
const router = express.Router();

router.get("/getAllGames", getAllGames);
router.get("/getGameById/:id", getGameById);
router.post("/createGame", authMiddleware, requireUser, createGame);
export default router;