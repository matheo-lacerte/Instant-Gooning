import Stripe from "stripe";
import { supabaseAdmin } from "../config/supabase.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

function effectiveAmount(game) {
  const eff = Number(game.discounted_price ?? 0) > 0 ? Number(game.discounted_price) : Number(game.price);
  return Math.round(eff * 100);
}

export async function syncStripeForGame(game) {
  const currency = (game.currency || process.env.DEFAULT_CURRENCY || "CAD").toLowerCase();
  const amount = effectiveAmount(game);

  // Product (inclut rename si title a changé)
  let productId = game.stripe_product_id;
  if (!productId) {
    const p = await stripe.products.create({
      name: game.title,
      active: true,
      metadata: { game_id: String(game.id) }
    });
    productId = p.id;
  } else {
    await stripe.products.update(productId, { name: game.title, active: true });
  }

  // Price (désactive l’ancien si montant/devise change)
  let priceId = game.stripe_price_id;
  let needNew = true;
  if (priceId) {
    const pr = await stripe.prices.retrieve(priceId);
    if (pr.active && pr.unit_amount === amount && pr.currency === currency) needNew = false;
    else await stripe.prices.update(priceId, { active: false });
  }
  if (needNew) {
    const np = await stripe.prices.create({ product: productId, unit_amount: amount, currency });
    priceId = np.id;
  }

  await supabaseAdmin.from("games")
    .update({ stripe_product_id: productId, stripe_price_id: priceId })
    .eq("id", game.id);

  return priceId;
}

export async function archiveStripeForGame(game) {

  if (game.stripe_price_id) {
    try { await stripe.prices.update(game.stripe_price_id, { active: false }); } catch {}
  }
  if (game.stripe_product_id) {
    try { await stripe.products.update(game.stripe_product_id, { active: false }); } catch {}
  }
}
