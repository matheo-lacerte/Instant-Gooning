import { supabase, supabaseAdmin } from "../config/supabase.js";
import { getDevGames as getDevGamesFromController } from "./gamesController.js";
import { archiveStripeForGame } from "../utils/stripePricing.js";

export async function leaveDev(req, res) {
  try {
    if (req.user.role === "admin") {
      return res
        .status(400)
        .json({ error: "Un administrateur ne peut pas quitter via cette route." });
    }
    const client = supabaseAdmin || supabase;
    const { error } = await client
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

// Désactiver tous les jeux du développeur courant
export async function disableAllMyGames(req, res) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non authentifié" });
  try {
    const client = supabaseAdmin || supabase;
    // Récupérer les jeux pour archivage Stripe
    const { data: games, error: listErr } = await client
      .from("games")
      .select("id, stripe_product_id, stripe_price_id")
      .eq("created_by", userId)
      .eq("is_active", true);
    if (listErr) throw listErr;

    // Mettre tous les jeux à inactif
    const { error: upErr } = await client
      .from("games")
      .update({ is_active: false })
      .eq("created_by", userId)
      .eq("is_active", true);
    if (upErr) throw upErr;

    // Nettoyer les paniers
    if (games && games.length) {
      const ids = games.map((g) => g.id);
      await client.from("cart_items").delete().in("game_id", ids);
    }

    // Archiver sur Stripe (best-effort)
    try {
      await Promise.all((games || []).map(g => archiveStripeForGame(g)));
    } catch (e) {
      console.error("[disableAllMyGames] archive stripe error", e);
    }

    return res.json({ ok: true, disabledCount: games?.length || 0 });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Transférer un jeu à un autre compte (dev/admin seulement)
export async function transferGameOwnership(req, res) {
  const { game_id, to_user_email, to_user_id } = req.body || {};
  const id = Number(game_id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "game_id invalide" });
  try {
    const client = supabaseAdmin || supabase;

    // Charger le jeu et vérifier l'autorisation
    const { data: game, error: gErr } = await client
      .from("games")
      .select("id, created_by")
      .eq("id", id)
      .single();
    if (gErr) return res.status(gErr.code === "PGRST116" ? 404 : 500).json({ error: gErr.message });
    if (req.user.role !== "admin" && game.created_by !== req.user.id) {
      return res.status(403).json({ error: "Autorisation refusée" });
    }

    // Résoudre le compte cible
    let targetUserId = to_user_id;
    if (!targetUserId) {
      if (!to_user_email) return res.status(400).json({ error: "to_user_email requis si to_user_id absent" });
      const { data: u, error: uErr } = await client
        .from("users")
        .select("id, role")
        .ilike("email", to_user_email)
        .single();
      if (uErr) return res.status(uErr.code === "PGRST116" ? 404 : 500).json({ error: uErr.message });
      targetUserId = u.id;
      if (u.role !== "dev" && u.role !== "admin") {
        return res.status(400).json({ error: "Le compte cible n'est pas développeur" });
      }
    } else {
      const { data: u, error: uErr } = await client
        .from("users")
        .select("id, role")
        .eq("id", targetUserId)
        .single();
      if (uErr) return res.status(uErr.code === "PGRST116" ? 404 : 500).json({ error: uErr.message });
      if (u.role !== "dev" && u.role !== "admin") {
        return res.status(400).json({ error: "Le compte cible n'est pas développeur" });
      }
    }

    if (targetUserId === game.created_by) {
      return res.status(400).json({ error: "Le jeu appartient déjà à ce compte" });
    }

    const { error: tErr } = await client
      .from("games")
      .update({ created_by: targetUserId })
      .eq("id", id);
    if (tErr) return res.status(500).json({ error: tErr.message });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
