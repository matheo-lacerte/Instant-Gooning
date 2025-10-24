import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import {postForm, getAllRequests} from "../controllers/adminController.js"
const router = express.Router();

router.post("/requests-dev", authMiddleware, requireUser, postForm);
router.get("/getAllRequests", authMiddleware, requireUser, getAllRequests);
export default router;