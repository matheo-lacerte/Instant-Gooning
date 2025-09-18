import express from 'express';
import cors from 'cors';
import pool from "./config/db.js";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- BRANCHE LES ROUTES AVANT LE LISTEN ---
app.use("/api/auth", authRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get("/api/test-db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: err.message });
  }
});

// START
const port = process.env.PORT || 5174;
app.listen(port, () => console.log(`API server on http://localhost:${port}`));
