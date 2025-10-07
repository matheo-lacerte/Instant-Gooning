import { supabase } from "../config/supabase.js";

export async function getAllGames(req, res) {
    try {
        const { data, error} = await supabase
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
        const { data, error} = await supabase
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