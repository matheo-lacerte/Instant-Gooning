// controllers/stripeWebhookController.js
import { supabaseAdmin } from "../config/supabase.js";
import { generateKeyCode } from "../utils/keygen.js";
import { getStripe } from "../utils/stripeClient.js";

export async function stripeWebhook(req, res) {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Répondre 200 aux autres events
  if (event.type !== "checkout.session.completed") {
    return res.json({ received: true });
  }

  try {
    const session = event.data.object;

    // Idempotence: si on a déjà traité cette session, on sort
    const { data: exists } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();
    if (exists) return res.json({ received: true });

    // Récupère la session complète
    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items.data.price.product", "payment_intent"],
    });

    const user_id = full.metadata?.user_id || null;
    const cart_id = full.metadata?.cart_id || null;
    const lines = full.line_items?.data || [];

    // Construire les items de commande
    let total_cents = 0;
    const orderItems = [];

    for (const li of lines) {
      const prod = li.price?.product;
      const gameIdStr = prod?.metadata?.game_id;
      const game_id = gameIdStr ? parseInt(gameIdStr, 10) : null;

      const qty = li.quantity || 1;
      const unit = li.price?.unit_amount || 0;
      const currency = (li.price?.currency || "cad").toUpperCase();

      if (game_id) {
        total_cents += qty * unit;
        orderItems.push({
          game_id,
          quantity: qty,
          unit_price_cents: unit,
          currency,
        });
      }
    }

    // Pas d’item exploitable, on s’arrête
    if (!user_id || orderItems.length === 0) {
      return res.json({ received: true });
    }

    const currency = orderItems[0].currency;
    const payment_intent_id =
      typeof full.payment_intent === "string" ? full.payment_intent : full.payment_intent?.id;

    // Crée la commande
    const { data: orderRow, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id,
        total_cents,
        currency,
        stripe_checkout_session_id: full.id,
        stripe_payment_intent_id: payment_intent_id || null,
        status: "paid",
      })
      .select("id")
      .single();
    if (oErr) throw oErr;

    // Lignes de commande
    if (orderItems.length) {
      const { error: oiErr } = await supabaseAdmin
        .from("order_items")
        .insert(orderItems.map(oi => ({ ...oi, order_id: orderRow.id })));
      if (oiErr) throw oiErr;
    }

    // Entitlements en bulk (upsert)
    const entitlements = orderItems.map(oi => ({ user_id, game_id: oi.game_id }));
    if (entitlements.length) {
      const { error: enErr } = await supabaseAdmin.from("entitlements").upsert(entitlements, {
        onConflict: "user_id,game_id",
      });
      if (enErr) throw enErr;
    }

    // Génération de clés par item et quantité
    for (const oi of orderItems) {
      for (let i = 0; i < (oi.quantity || 1); i++) {
        const key = generateKeyCode();
        const { error: kErr } = await supabaseAdmin.from("game_keys").insert({
          user_id,
          order_id: orderRow.id,
          game_id: oi.game_id,
          key_code: key,
          status: "issued",
        });
        if (kErr) throw kErr;
      }
    }

    // Vider le panier si on a l’info
    if (cart_id) {
      const { error: delErr } = await supabaseAdmin.from("cart_items").delete().eq("cart_id", cart_id);
      if (delErr) console.error("[webhook] delete cart_items error:", delErr);
    }

    return res.json({ received: true });
  } catch (e) {
  console.error("[checkoutCart] ERROR:", e);
  res.status(500).json({ error: e.message, stack: e.stack });
}
}
