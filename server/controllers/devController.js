import { supabase } from "../config/supabase.js";
import { getDevGames as getDevGamesFromController } from "./gamesController.js";

export async function leaveDev(req, res) {
  try {
    if (req.user.role === "admin") {
      return res
        .status(400)
        .json({ error: "Un administrateur ne peut pas quitter via cette route." });
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
}

export async function getDevStatus(req, res) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", req.user.id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ role: user.role, is_developer: user.role === "dev" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getDevGames(req, res) {
  return getDevGamesFromController(req, res);
}
