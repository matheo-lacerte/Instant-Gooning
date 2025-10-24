import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import {postForm, getAllRequests, acceptRequest, declineRequest} from "../controllers/adminController.js"
const router = express.Router();

router.post("/request-dev", authMiddleware, requireUser, postForm);
router.get("/getAllRequests", authMiddleware, requireUser, getAllRequests);
router.post("/acceptRequest", authMiddleware, requireUser, acceptRequest);
router.post("/declineRequest", authMiddleware, requireUser, declineRequest);
export default router;