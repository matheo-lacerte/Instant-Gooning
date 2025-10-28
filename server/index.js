import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import devRoutes from "./routes/dev.js";
import { supabase } from "./config/supabase.js";
import gamesRoutes from "./routes/games.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import paymentsRoutes from "./routes/payments.js";
import stripeWebhookRoutes from "./routes/stripeWebhook.js";
import { globalApiLimiter } from "./middleware/rateLimit.js";

const app = express();
app.use(cors());

// IMPORTANT: pas de app.use(express.json()) ici
app.use((req, res, next) => {
  if (req.path === "/api/webhook/stripe") return next(); // body brut pour Stripe
  express.json()(req, res, next);                        // JSON pour le reste
});

// rate limit après le wrapper
app.use("/api", globalApiLimiter);

// routes API
app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payments", paymentsRoutes);

// webhook à la fin
app.use("/api", stripeWebhookRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

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
app.listen(port, () => console.log(`API server on http://localhost:${port}`));
