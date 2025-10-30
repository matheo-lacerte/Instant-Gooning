import Stripe from "stripe";
import { supabaseAdmin } from "../config/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

async function syncStripeForGame(game) {
  const currency = (game.currency || "CAD").toLowerCase();
  const amount = Math.round((game.discounted_price || game.price) * 100);

  let productId = game.stripe_product_id;
  if (!productId) {
    const product = await stripe.products.create({
      name: game.title,
      active: true,
      metadata: { game_id: game.id.toString() }
    });
    productId = product.id;

  } else {
    await stripe.products.update(productId, { name: game.title });
  }
  let priceId = game.stripe_price_id;
  if (priceId) {
    const p = await stripe.prices.retrieve(priceId);
    if (
      p.unit_amount !== amount ||
      p.currency !== currency ||
      !p.active
    ) {
      await stripe.prices.update(priceId, { active: false });
      priceId = null;
    }
  }
  if (!priceId) {
    const np = await stripe.prices.create({
      product: productId,
      unit_amount: amount,
      currency
    });
    priceId = np.id;
  }
  await supabaseAdmin
    .from("games")
    .update({ stripe_product_id: productId, stripe_price_id: priceId })
    .eq("id", game.id);

  return priceId;
}

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
      const priceId = await syncStripeForGame(game);
      line_items.push({ price: priceId, quantity: it.quantity });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items,
      allow_promotion_codes: true,

      automatic_tax: { enabled: true },

      customer_creation: "always", 
      billing_address_collection: "required",

      success_url: `${process.env.SITE_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/cart`,
      metadata: { user_id, cart_id: req.body.cart_id }
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
