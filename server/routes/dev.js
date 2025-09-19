import express from "express";
import supabase from "../config/supabase.js";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";

const router = express.Router();

router.post("/join", authMiddleware, requireUser, async (req, res) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({ is_a_developer: true })
      .eq("id", req.user.id);

    if (error) throw error;

    return res.json({ message: "Vous êtes maintenant un développeur !" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/leave", authMiddleware, requireUser, async (req, res) => {
  try {
    const { error } = await supabase
      .from("users")
      .update({ is_a_developer: false })
      .eq("id", req.user.id);

    if (error) throw error;

    return res.json({ message: "Vous n'êtes plus un développeur." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
