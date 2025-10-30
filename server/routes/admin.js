import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { devFormLimiter, adminActionLimiter } from "../middleware/rateLimit.js";
import {postForm, getAllRequests, acceptRequest, declineRequest, isPendingRequest} from "../controllers/adminController.js"
const router = express.Router();

router.post("/request-dev", authMiddleware, requireUser, devFormLimiter, postForm);
router.get("/isPendingRequest", authMiddleware, requireUser, devFormLimiter, isPendingRequest);
router.get("/getAllRequests", authMiddleware, requireUser, adminActionLimiter, getAllRequests);
router.post("/acceptRequest", authMiddleware, requireUser, adminActionLimiter, acceptRequest);
router.post("/declineRequest", authMiddleware, requireUser, adminActionLimiter, declineRequest);
export default router;