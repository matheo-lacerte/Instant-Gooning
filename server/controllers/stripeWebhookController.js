import Stripe from "stripe";
import { supabaseAdmin } from "../config/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export async function stripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items.data.price.product"],
    });

    const lines = full.line_items.data;
    const user_id = full.metadata.user_id;
    const cart_id = full.metadata.cart_id;

    let total_cents = 0;
    const orderItems = [];

    for (const li of lines) {
      const gameId = parseInt(li.price.product.metadata.game_id);
      const qty = li.quantity;
      const unit = li.price.unit_amount;
      total_cents += qty * unit;

      orderItems.push({
        game_id: gameId,
        quantity: qty,
        unit_price_cents: unit,
        currency: li.price.currency.toUpperCase()
      });
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id,
        total_cents,
        currency: "CAD",
        status: "paid"
      })
      .select("id")
      .single();

    await supabaseAdmin.from("order_items").insert(
      orderItems.map(oi => ({ ...oi, order_id: order.id }))
    );

    for (const oi of orderItems) {
      await supabaseAdmin.from("entitlements").upsert({
        user_id,
        game_id: oi.game_id
      });
    }

    await supabaseAdmin.from("cart_items").delete().eq("cart_id", cart_id);
  }

  res.json({ received: true });
}