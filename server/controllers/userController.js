import { supabase, supabaseAdmin } from "../config/supabase.js";
import validatePassword from "../utils/validatePassword.js";
export async function getAllRequests(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    const client = req.supabase;
    const { data, error } = await client
      .from('request')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function changePassword(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    const { oldPassword, newPassword } = req.body;
    const { error } = await req.supabase.auth.signInWithPassword({
      email: req.user.email,
      password: oldPassword
    });
    if (error) {
      return res.status(400).json({ error: 'Ancien mot de passe incorrect.' });
    }
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis.' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit être différent de l\'ancien.' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error:
          "Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      });
    }
    const client = req.supabase;
    const { data: authData, error: authError } = await client.auth.updateUser({
      password: newPassword
    });
    if (authError) {
      return res.status(500).json({ error: authError.message });
    }
    return res.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
