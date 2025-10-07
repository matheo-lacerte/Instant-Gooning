import express from "express";
import validator from "validator";
import bcrypt from "bcrypt"; // Pour conserver un hash local si la colonne password est NOT NULL
import validatePassword from "../utils/validatePassword.js";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;

  if (!username || !email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Format d'email invalide." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        "Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
    });
  }

  try {
    // On accepte maintenant les doublons de username -> aucune vérification d'unicité

    // SignUp Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      if (authError.code === 'email_address_invalid') {
        return res.status(400).json({ error: 'Adresse email invalide' });
      }
      if (authError.message?.includes('already registered')) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }
      return res.status(400).json({ error: authError.message });
    }

    if (!authData.user) {
      return res.status(500).json({ error: "Création utilisateur échouée" });
    }

    // Hash local du mot de passe si la colonne password existe / est requise
    let hashed = null;
    try {
      hashed = await bcrypt.hash(password, 10);
    } catch (e) {
      console.warn("Hash password failed (continuing without local password)", e);
    }

    // Insère le profil utilisateur dans la table `users`
    const { error: profileError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          username,
          first_name,
          last_name,
          role: "user",
          email, // conserver l'email pour usages internes
          ...(hashed ? { password: hashed } : {})
        }
      ]);

    if (profileError) {
      console.error('Profile insert error:', profileError);
      // Optionnel: rollback user via admin
      if (supabaseAdmin) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      }
      return res.status(500).json({ error: 'Échec création profil' });
    }

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
        first_name,
        last_name,
        role: 'user'
      }
    });
  } catch (err) {
    console.error('ERROR register:', err);
    res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }

  try {
    // Utilise l'authentification native de Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ error: "Email ou mot de passe invalide" });
    }

    if (!authData.user || !authData.session) {
      return res.status(400).json({ error: "Échec de l'authentification" });
    }

    // Optionnel: récupère les données du profil utilisateur
    const { data: profile } = await supabase
      .from("users")
      .select("id, username, first_name, last_name, role, email")
      .eq("id", authData.user.id)
      .single();

    res.json({ 
      message: "Connexion réussie", 
      token: authData.session.access_token,
      user: {
        id: authData.user.id, // UUID de Supabase
        email: authData.user.email,
        ...profile
      }
    });
  } catch (err) {
    console.error("ERROR login:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});

// LOGOUT (coté backend uniquement: frontend doit supprimer le token du stockage)
router.post("/logout", (_req, res) => {
  res.json({ message: "Déconnecté avec succès" });
});

export default router;
