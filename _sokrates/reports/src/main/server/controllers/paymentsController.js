import Stripe from "stripe";
import { supabaseAdmin } from "../config/supabase.js";
import { syncStripeForGame } from "../utils/stripePricing.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export async function checkoutCart(req, res) {
  try {
    const user_id = req.user?.id;
    const email = req.user?.email;
    if (!user_id || !email) return res.status(401).json({ error: "Non authentifié" });

    const { data: items } = await supabaseAdmin
      .from("cart_items")
      .select("quantity, game_id, games(*)")
      .eq("cart_id", req.body.cart_id);

    if (!items?.length) return res.status(400).json({ error: "Panier vide" });

    const line_items = [];

    for (const it of items) {
      const game = it.games;
      let priceId = game?.stripe_price_id;

      // Ensure we have an ACTIVE price; auto-sync if missing/inactive
      try {
        if (!priceId) {
          priceId = await syncStripeForGame(game);
        } else {
          const pr = await stripe.prices.retrieve(priceId);
          if (!pr.active) {
            priceId = await syncStripeForGame(game);
          }
        }
      } catch (syncErr) {
        console.error("[checkoutCart] price sync failed for game", game?.id, syncErr);
        return res.status(500).json({ error: `Échec de préparation du prix Stripe pour le jeu ${game?.id}` });
      }

      line_items.push({ price: priceId, quantity: it.quantity });
    }

 
    let origin = req.get("origin");
    if (!origin) {
      const ref = req.get("referer");
      if (ref) {
        try { origin = new URL(ref).origin; } catch {}
      }
    }

    if (origin && /localhost:5174$/i.test(origin)) {
      origin = "http://localhost:5173";
    }
    
    if ((!origin || /localhost/i.test(origin)) && process.env.SITE_URL && !/localhost/i.test(process.env.SITE_URL)) {
      origin = process.env.SITE_URL;
    }
    if (!origin) origin = "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items,
      allow_promotion_codes: true,

      automatic_tax: { enabled: true },

      customer_creation: "always",
      billing_address_collection: "required",

      success_url: `${origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: { user_id, cart_id: req.body.cart_id }
    });

    res.json({ url: session.url });
  } catch (e) {
    console.error("[checkoutCart] ERROR:", e);
    res.status(500).json({ error: e.message, stack: e.stack });
  }

}

export async function getCheckoutSessionDetails(req, res) {
  try {
    const session_id = req.query.session_id;
    if (!session_id) return res.status(400).json({ error: "session_id requis" });
    const { id: userId } = req.user || {};
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const sess = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    });

    // security: ensure session belongs to this user
    if (String(sess.metadata?.user_id || "") !== String(userId)) {
      return res.status(403).json({ error: "Accès refusé à cette session" });
    }

    const items = (sess.line_items?.data || []).map((li) => ({
      title: li.price?.product?.name || "",
      game_id: parseInt(li.price?.product?.metadata?.game_id || "0"),
      quantity: li.quantity || 1,
      unit_amount: li.price?.unit_amount || 0,
      currency: (li.price?.currency || "cad").toUpperCase(),
    }));

    return res.json({
      id: sess.id,
      payment_status: sess.payment_status,
      amount_total: sess.amount_total,
      currency: (sess.currency || "cad").toUpperCase(),
      items,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export async function clearCartFromSession(req, res) {
  try {
    const session_id = req.query.session_id || req.body?.session_id;
    if (!session_id) return res.status(400).json({ error: "session_id requis" });

    const { id: userId } = req.user || {};
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const sess = await stripe.checkout.sessions.retrieve(session_id);

    if (String(sess.metadata?.user_id || "") !== String(userId)) {
      return res.status(403).json({ error: "Accès refusé à cette session" });
    }

    const cart_id = sess.metadata?.cart_id;
    if (!cart_id) return res.status(400).json({ error: "cart_id manquant dans la session" });

    const { error } = await supabaseAdmin.from("cart_items").delete().eq("cart_id", cart_id);
    if (error) return res.status(500).json({ error: error.message });

    return res.json({ cleared: true, cart_id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export async function getKeysBySession(req, res) {
  try {
    const user_id = req.user.id;
    const session_id = req.query.session_id;
    if (!session_id) return res.status(400).json({ error: "session_id requis" });

    // retrouver l'order via le webhook metadata
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const cart_id = session.metadata?.cart_id; // optionnel, juste info

    // récupère la commande correspondante par session_id
    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("stripe_checkout_session_id", session_id)
      .eq("user_id", user_id)
      .single();
    if (oErr || !order) return res.status(404).json({ error: "Commande introuvable" });

    const { data: keys, error: kErr } = await supabaseAdmin
      .from("game_keys")
      .select("game_id, key_code, status")
      .eq("order_id", order.id);
    if (kErr) throw kErr;

    // optionnel: joindre titres
    const gameIds = [...new Set(keys.map(k => k.game_id))];
    let titles = {};
    if (gameIds.length) {
      const { data: games } = await supabaseAdmin
        .from("games")
        .select("id, title")
        .in("id", gameIds);
      titles = Object.fromEntries((games || []).map(g => [g.id, g.title]));
    }

    const items = keys.map(k => ({
      title: titles[k.game_id] || `Jeu ${k.game_id}`,
      key: k.key_code,
      status: k.status
    }));

    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

