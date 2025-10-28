import { supabaseAdmin } from "../config/supabase.js";

async function ensureCartExists(userId) {
    if (!supabaseAdmin) {
        throw new Error("Supabase admin client non configuré. Définissez SUPABASE_SERVICE_ROLE_KEY.");
    }

    
    const { data: existingCart, error: findError } = await supabaseAdmin
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

    if (findError) throw findError;
    if (existingCart) return existingCart.id;

    
    const { data: newCart, error: insertError } = await supabaseAdmin
        .from("carts")
        .insert({ user_id: userId })
        .select("id")
        .single();

    if (insertError) throw insertError;
    return newCart.id;
}

export async function getCart(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const cart_id = await ensureCartExists(userId);
   const { data: items, error } = await supabaseAdmin
  .from("cart_items")
  .select(`
    id,
    quantity,
    unit_price_cents,
    currency,
    game:games!cart_items_game_id_fkey (
      id, title, cover_url, price, discounted_price
    )
  `)
  .eq("cart_id", cart_id);


    if (error) throw error;
    return res.json({ cart_id, items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function addItemToCart(req, res) {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: "Non authentifié" });

    const { game_id, quantity = 1 } = req.body;
    if (!game_id) return res.status(400).json({ error: "game_id est requis" });

    const q = Math.max(1, Number(quantity) || 1);

    const { data: game, error: gErr } = await supabaseAdmin
      .from("games")
      .select("*")
      .eq("id", game_id)
      .single();

    if (gErr || !game) {
      return res.status(404).json({ error: "Jeu non trouvé" }); 
    }

    const cart_id = await ensureCartExists(user_id);

    const unit_price_cents = Math.round(Number(game.discounted_price ?? game.price) * 100);
    const currency = (game.currency || process.env.DEFAULT_CURRENCY || "CAD").toUpperCase();

    const { data: existing } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart_id)
      .eq("game_id", game_id)
      .maybeSingle(); 

    if (existing) {
      const { error: upErr } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: existing.quantity + q, unit_price_cents, currency })
        .eq("id", existing.id);
      if (upErr) throw upErr;
    } else {
      const { error: insErr } = await supabaseAdmin
        .from("cart_items")
        .insert({ cart_id, game_id, quantity: q, unit_price_cents, currency });
      if (insErr) throw insErr;
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}


export async function removeCartItem(req, res) {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: "Non authentifié" });

    const { itemId } = req.params;

    const { data: item, error: itemErr } = await supabaseAdmin
      .from("cart_items")
      .select("id, cart_id")
      .eq("id", itemId)
      .maybeSingle();

    if (itemErr) throw itemErr;
    if (!item) return res.status(404).json({ error: "Item introuvable" });


    const { data: cart, error: cartErr } = await supabaseAdmin
      .from("carts")
      .select("user_id")
      .eq("id", item.cart_id)
      .single();

    if (cartErr) throw cartErr;
    if (!cart || cart.user_id !== user_id) {
      return res.status(403).json({ error: "Refusé" });
    }

    
    const { error: delErr } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (delErr) throw delErr;

    return res.status(204).send();
  } catch (err) {
    console.error("Error removing cart item:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function decrementCartItem(req, res) {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: "Non authentifié" });

    const { itemId } = req.params;

    const { data: item, error: getErr } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity, cart_id")
      .eq("id", itemId)
      .maybeSingle();

    if (getErr || !item) return res.status(404).json({ error: "Item introuvable" });

  
    const { data: cart } = await supabaseAdmin
      .from("carts")
      .select("user_id")
      .eq("id", item.cart_id)
      .single();

    if (!cart || cart.user_id !== user_id) return res.status(403).json({ error: "Refusé" });

    if (item.quantity > 1) {
  
      const { error: upErr } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: item.quantity - 1 })
        .eq("id", itemId);
      if (upErr) throw upErr;

      return res.status(200).json({ ok: true });
    }


    const { error: delErr } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", itemId);
    if (delErr) throw delErr;

    return res.status(204).send();
  } catch (err) {
    console.error("Error decrementing item:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}


