import { supabase, supabaseAdmin } from "../config/supabase.js";

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
            .select("title, price, cover_url, discount, discounted_price");
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
        const discounted_price = numericPrice - (numericPrice * (numericDiscount / 100));
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

        const { data: updatedGame, error: updateError } = await client
            .from('games')
            .update(updatePayload)
            .eq('id', id)
            .select('*')
            .single();



        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        return res.json(updatedGame);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteGame(req, res) {
    const { id } = req.params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) return res.status(400).json({ error: 'id invalide' });
    const client = (req.user?.role === 'admin' && supabaseAdmin) ? supabaseAdmin : (req.supabase || supabase);
    try {
        const { data: game, error } = await client
            .from("games")
            .select("id, created_by")
            .eq("id", numericId)
            .single()
        if (error) {
            if (error.code === "PGRST116") {
                res.status(404).json({ error: "jeu introuvable" });
                return;
            }
            res.status(500).json({ error: error.message });
            return;
        }
        if (req.user.role !== 'admin' && game.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Autorisation refusée' });
        }

        const { error: deleteError } = await client
            .from('games')
            .delete()
            .eq('id', numericId)
            .limit(1);
        
        if(deleteError){
            return res.status(500).json({ error: deleteError.message });
        }

        return res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}