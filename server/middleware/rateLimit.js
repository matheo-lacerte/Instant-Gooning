import rateLimit from "express-rate-limit";

// Helper to create a limiter with consistent JSON 429 responses
function createLimiter({ windowMs, max, message, keyGenerator }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || ((req) => req.ip),
    handler: (req, res) => {
      return res.status(429).json({
        error: "Too many requests",
        message: message || "Rate limit exceeded. Try again later.",
      });
    },
  });
}

// Global API limiter (applied to all /api routes)
export const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // per IP
  message: "Trop de requêtes. Réessayez plus tard.",
});

// Auth-specific limiters
export const loginLimiter = createLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Trop de tentatives de connexion. Réessayez plus tard.",
});

export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Trop de créations de compte depuis cette IP. Réessayez plus tard.",
});

// User-sensitive actions
export const passwordChangeLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Trop de changements de mot de passe. Réessayez plus tard.",
  keyGenerator: (req) => req.user?.id || req.ip,
});

// Developer request form (user requests dev role)
export const devFormLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2,
  message: "Trop de soumissions de formulaire. Réessayez plus tard.",
  keyGenerator: (req) => req.user?.id || req.ip,
});

// Admin endpoints (list/accept/decline)
export const adminActionLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // generous but prevents abuse
  message: "Trop d'actions administrateur. Réessayez plus tard.",
  keyGenerator: (req) => req.user?.id || req.ip,
});

// Generic write limiter for create/update/delete on resources
export const writeLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Trop d'opérations d'écriture. Réessayez plus tard.",
  keyGenerator: (req) => req.user?.id || req.ip,
});
