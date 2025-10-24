import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import devRoutes from "./routes/dev.js";
import { supabase } from "./config/supabase.js";
import gamesRoutes from "./routes/games.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Test DB
app.get("/api/test-db", async (_req, res) => {
  try {
  const { data, error } = await supabase.from("users").select("id, role").limit(1);
    if (error) throw error;
    res.json({ db: "OK", sampleUser: data });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 2000;
app.listen(port, () =>
  console.log(`API server on http://localhost:${port}`)
);
0