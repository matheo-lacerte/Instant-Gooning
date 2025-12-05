import { supabase, supabaseAdmin } from "../config/supabase.js";
import validatePassword from "../utils/validatePassword.js";
import validator from "validator";

export async function getAllRequests(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Non authentifié" });
    const client = req.supabase;
    const { data, error } = await client
      .from("request")
      .select("*")
      .order("created_at", { ascending: false })
      .eq("created_by", req.user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function changePassword(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Non authentifié" });
    const { oldPassword, newPassword } = req.body;
    const { error } = await req.supabase.auth.signInWithPassword({
      email: req.user.email,
      password: oldPassword,
    });
    if (error) {
      return res.status(400).json({ error: "Ancien mot de passe incorrect." });
    }
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Ancien et nouveau mot de passe requis." });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        error: "Le nouveau mot de passe doit être différent de l'ancien.",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error:
          "Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
      });
    }
    const client = req.supabase;
    const { error: authError } = await client.auth.updateUser({
      password: newPassword,
    });
    if (authError) {
      return res.status(500).json({ error: authError.message });
    }

    const { data: newSession, error: tokenError } =
      await req.supabase.auth.signInWithPassword({
        email: req.user.email,
        password: newPassword,
      });

    if (tokenError)
      return res
        .status(500)
        .json({ error: "Mot de passe changé, mais erreur de session." });

    return res.json({
      message: "Mot de passe mis à jour avec succès.",
      token: newSession.session.access_token,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function changeUserProfile(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: "Non authentifié" });
    const { first_name, last_name, username, email } = req.body;
    if (!first_name || !last_name || !username || !email) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Format d'email invalide." });
    }

    const client = req.supabase;
    const { error } = await client
      .from("users")
      .update({ first_name, last_name, username, email })
      .eq("id", req.user.id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ message: "Profil mis à jour avec succès." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getMyKeys(req, res) {
  try {
    const user_id = req.user.id;
    const { data, error } = await supabaseAdmin
      .from("game_keys")
      .select("key_code, status, created_at, game_id, order_id")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const ids = [...new Set(data.map(d => d.game_id))];
    let titles = {};
    if (ids.length) {
      const { data: games } = await supabaseAdmin
        .from("games")
        .select("id, title")
        .in("id", ids);
      titles = Object.fromEntries((games || []).map(g => [g.id, g.title]));
    }
    return res.json(
      data.map(d => ({
        title: titles[d.game_id] || `Jeu ${d.game_id}`,
        key: d.key_code,
        status: d.status,
        order_id: d.order_id,
        created_at: d.created_at
      }))
    );
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

