import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { passwordChangeLimiter } from "../middleware/rateLimit.js";
import { getAllRequests, changePassword, getMyKeys } from "../controllers/userController.js";
const router = express.Router();

router.get("/getAllRequests", authMiddleware, requireUser, getAllRequests);
router.post("/changePassword", authMiddleware, requireUser, passwordChangeLimiter, changePassword);

router.get("/keys", authMiddleware, requireUser, getMyKeys);

export default router;