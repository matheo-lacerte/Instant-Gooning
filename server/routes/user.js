import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { passwordChangeLimiter } from "../middleware/rateLimit.js";
import { getAllRequests, changePassword, changeUserProfile } from "../controllers/userController.js";
const router = express.Router();

router.get("/getAllRequests", authMiddleware, requireUser, getAllRequests);
router.post("/changePassword", authMiddleware, requireUser, passwordChangeLimiter, changePassword);
router.post("/changeUserProfile", authMiddleware, requireUser, changeUserProfile);
export default router;