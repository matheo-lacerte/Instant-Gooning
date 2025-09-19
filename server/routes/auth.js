import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import validatePassword from "../utils/validatePassword.js";
import supabase from "../config/supabase.js";

const router = express.Router();

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
    // Vérifie si déjà existant
    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: "Email ou username déjà utilisé" });
    }
    if (checkError && checkError.code !== "PGRST116") throw checkError;

    const hash = await bcrypt.hash(password, 10);

    const { error: insertError } = await supabase.from("users").insert([
      {
        username,
        email,
        password: hash,
        first_name,
        last_name,
        is_a_developer: false,
      },
    ]);

    if (insertError) throw insertError;

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    console.error("🔥 ERROR register:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    if (!user) return res.status(400).json({ error: "Utilisateur introuvable" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Mot de passe invalide" });

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "JWT secret non configuré sur le serveur." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Connexion réussie", token });
  } catch (err) {
    console.error("🔥 ERROR login:", err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Déconnecté avec succès" });
});

export default router;
