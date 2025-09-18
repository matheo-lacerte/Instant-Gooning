import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import validator from "validator";
import validatePassword from "../utils/validatePassword.js";
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
    const checkUser = await pool.query("SELECT * FROM users WHERE email=$1 OR username=$2", [email, username]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Email ou username déjà utilisé" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name, is_a_developer)
       VALUES ($1, $2, $3, $4, $5, false)`,
      [username, email, hash, first_name, last_name]
    );

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe sont requis" });
  }
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Utilisateur introuvable" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Mot de passe invalide" });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret is not configured on the server." });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Connexion réussie", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Déconnecté avec succès" });
});


export default router;
