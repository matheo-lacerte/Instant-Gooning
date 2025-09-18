import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;

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
