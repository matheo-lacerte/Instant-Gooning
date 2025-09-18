import express from 'express'
import cors from 'cors'
import pool from "./config/db.js";

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const port = process.env.PORT || 5174
app.listen(port, () => console.log(`API server on http://localhost:${port}`))


app.get("/api/test-db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
