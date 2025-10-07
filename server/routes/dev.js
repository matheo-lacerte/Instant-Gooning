import express from "express";
import { supabase } from "../config/supabase.js";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";

const router = express.Router();

router.post("/join", authMiddleware, requireUser, async (req, res) => {
  try {
    if (req.user.role === 'dev') {
      return res.json({ message: 'Déjà développeur.' });
    }
    const { error } = await supabase
      .from("users")
      .update({ role: "dev" })
      .eq("id", req.user.id);
    if (error) throw error;
    return res.json({ message: "Votre rôle est maintenant: développeur." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/leave", authMiddleware, requireUser, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(400).json({ error: "Un administrateur ne peut pas quitter via cette route." });
    }
    const { error } = await supabase
      .from("users")
      .update({ role: "user" })
      .eq("id", req.user.id);
    if (error) throw error;
    return res.json({ message: "Votre rôle est maintenant: utilisateur." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("", authMiddleware, requireUser, async (req, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", req.user.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ role: user.role, is_developer: user.role === 'dev' });
});

export default router;
