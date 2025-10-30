import { supabase, supabaseAdmin } from "../config/supabase.js";
import { syncStripeForGame } from "../utils/stripePricing.js";
import { archiveStripeForGame } from "../utils/stripePricing.js";
const ALLOWED_UPDATE_FIELDS = Object.freeze([
    'title',
    'description',
    'genre',
    'platform',
    'developer',
    'publisher',
    'price',
    'rating',
    'cover_url',
    'trailer_url',
    'discount'
]);
export async function getAllGames(req, res) {
    try {
        const { data, error } = await supabase
            .from("games")
            .select("id, title, price, cover_url, discount, discounted_price, is_active");
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getGameById(req, res) {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from("games")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function createGame(req, res) {
    const client = (req.user?.role === 'admin' && supabaseAdmin) ? supabaseAdmin : (req.supabase || supabase);
    const {
        title,
        description,
        genre,
        platform,
        developer,
        publisher,
        release_date,
        price,
        rating,
        cover_url,
        trailer_url,
        discount = 0
    } = req.body;
    if (req.user.role !== "admin" && req.user.role !== "dev") {
        res.status(403).json({ error: "Autorisation refusée" })
        return;
    }
    if (!title || price == null) {
        return res.status(400).json({ error: 'Titre et prix requis' });
    }
    const numericPrice = Number(price);
    const numericDiscount = Number(discount) || 0;
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ error: 'Prix invalide' });
    }
    if (numericDiscount < 0 || numericDiscount > 100) {
        return res.status(400).json({ error: 'Discount invalide (0-100)' });
    }

    try {
        const discounted_price = Number(
            (numericPrice - (numericPrice * (numericDiscount / 100))).toFixed(2)
        );
        const { data, error } = await supabase
            .from('games')
            .insert([
                {
                    title,
                    description,
                    genre,
                    platform,
                    developer,
                    publisher,
                    release_date,
                    price: numericPrice,
                    rating,
                    cover_url,
                    trailer_url,
                    discount: numericDiscount,
                    discounted_price,
                    created_by: req.user.id
                }
            ])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateGame(req, res) {
    const { id } = req.params;
    const client = (req.user?.role === 'admin' && supabaseAdmin) ? supabaseAdmin : (req.supabase || supabase);
    try {
        const { data: game, error } = await client
            .from('games')
            .select('id, created_by, price, discount')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                res.status(404).json({ error: "jeu introuvable" });
                return;
            }
            res.status(500).json({ error: error.message });
            return;
        }
        if (req.user.role !== "admin" && game.created_by !== req.user.id) {
            res.status(403).json({ error: "Autorisation refusée" })
            return;
        }
        const body = req.body;
        const updatePayload = {};

        for (const [key, value] of Object.entries(body)) {
            if (!ALLOWED_UPDATE_FIELDS.includes(key)) continue;
            if (value === undefined) continue;
            if (typeof value === 'string') {
                const trimmed = value.trim();
                updatePayload[key] = trimmed;
            } else {
                updatePayload[key] = value;
            }
        }
        if (Object.keys(updatePayload).length === 0) {
            res.status(400).json({ error: "Aucune modification n'a été appliquée" });
            return;
        }
        if ('price' in updatePayload) {
            const p = Number(updatePayload.price);
            if (Number.isNaN(p) || p < 0) {
                return res.status(400).json({ error: 'Prix invalide (doit être un nombre >= 0)' });
            }
            updatePayload.price = p;
        }

        if ('discount' in updatePayload) {
            const d = Number(updatePayload.discount);
            if (Number.isNaN(d) || d < 0 || d > 100) {
                return res.status(400).json({ error: 'Rabais invalide (doit être un nombre >= 0 ou un nombre <= 100)' });
            }
            updatePayload.discount = d;
        }

        if ('rating' in updatePayload) {
            const r = Number(updatePayload.rating);
            if (Number.isNaN(r) || r < 0 || r > 10) {
                return res.status(400).json({ error: 'Rating invalide (doit être un nombre >= 0 ou un nombre <= 10)' });
            }
            updatePayload.rating = r;
        }

        if ('price' in updatePayload || 'discount' in updatePayload) {
            const effectivePrice = ('price' in updatePayload) ? updatePayload.price : game.price;
            const effectiveDiscount = ('discount' in updatePayload) ? updatePayload.discount : game.discount;

            const discounted = effectivePrice - (effectivePrice * (effectiveDiscount / 100));
            updatePayload.discounted_price = Number(discounted.toFixed(2));
        }

      
        const { data: before, error: beforeError } = await client
            .from("games")
            .select("id, title, price, discount, discounted_price, stripe_product_id, stripe_price_id")
            .eq("id", id)
            .single();
        if (beforeError) {
            return res.status(500).json({ error: beforeError.message });
        }

     
        const { data: updatedGame, error: updateError } = await client
            .from('games')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();
        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

 
        try {
            const titleChanged = 'title' in updatePayload && updatePayload.title !== before.title;
            const priceChanged = 'price' in updatePayload || 'discount' in updatePayload;
            if (titleChanged || priceChanged) {
                await syncStripeForGame(updatedGame);
            }
        } catch (e) {
            console.error("[syncStripeForGame] error:", e);
        
        }

        return res.json(updatedGame);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteGame(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "id invalide" });


  const { data: game, error: gErr } = await supabaseAdmin
    .from("games")
    .select("id, created_by, stripe_product_id, stripe_price_id")
    .eq("id", id)
    .single();
  if (gErr) return res.status(gErr.code === "PGRST116" ? 404 : 500).json({ error: gErr.message });
  if (req.user.role !== "admin" && game.created_by !== req.user.id)
    return res.status(403).json({ error: "Autorisation refusée" });


  const { error: upErr } = await supabaseAdmin
    .from("games").update({ is_active: false }).eq("id", id);
  if (upErr) return res.status(500).json({ error: upErr.message });


  await supabaseAdmin.from("cart_items").delete().eq("game_id", id);


  try { await archiveStripeForGame(game); } catch (e) { console.error(e); }

  return res.json({ ok: true });
}

export async function getDevGames(req, res) {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ error: "Non authentifié" });
    try {
        const { data, error } = await supabase
            .from("games")
            .select("*")
            .eq("created_by", user_id);
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}    