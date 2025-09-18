import express from 'express'
import pool from "../config/db.js"
import authMiddleware from '../middleware/auth.js'
import requireUser from '../middleware/requireUser.js'
const router = express.Router()

router.post("/join", authMiddleware, requireUser, async (req, res) => {
    try {
        await pool.query("UPDATE users SET is_a_developer = true WHERE id = $1", [req.user.id]);
        return res.json({ message: "Vous êtes maintenant un développeur !" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.post("/leave", authMiddleware, requireUser, async (req, res) => {
    try {
        await pool.query("UPDATE users SET is_a_developer = false WHERE id = $1", [req.user.id]);
        return res.json({ message: "Vous n'êtes plus un développeur." });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router