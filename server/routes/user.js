import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { getAllRequests} from "../controllers/userController.js";
const router = express.Router();

router.get("/getAllRequests", authMiddleware, requireUser, getAllRequests);

export default router;