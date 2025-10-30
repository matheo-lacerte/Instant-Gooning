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

// CORS: allow specific origins and credentials for cookies/Authorization headers
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://instant-gooning-v1.vercel.app",
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl/postman) which may not send Origin
    if (!origin) return callback(null, true);
    const isAllowed =
      allowedOrigins.includes(origin) || /\.vercel\.app$/i.test(origin);
    if (isAllowed) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"],
};

app.use(cors(corsOptions));
// Handle preflight
app.options("*", cors(corsOptions));

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

const port = process.env.PORT || 5174;
app.listen(port, () => console.log(`API server on http://localhost:${port}`));
