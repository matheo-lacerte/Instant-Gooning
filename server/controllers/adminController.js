import { supabase, supabaseAdmin } from "../config/supabase.js";

export async function postForm(req, res) {
    try {
        if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
        if (req.user?.role === "admin" || req.user?.role === "dev") {
            return res.status(403).json({ error: "Vous ne pouvez pas faire de demande" });
        }
        const body = req.body ?? {};
        const titleRaw = body?.title;
        const descriptionRaw = body?.description;

        const title = typeof titleRaw === 'string' ? titleRaw.trim() : '';
        const description = typeof descriptionRaw === 'string' ? descriptionRaw.trim() : '';

        if (!title) return res.status(400).json({ error: 'Titre requis' });
        if (!description) return res.status(400).json({ error: 'Description requise' });

        const client = req.supabase;
        const payload = { title, description };

        const {data, error } = await client
        .from('request')
        .insert([payload])
        .select('*')
        .single();

        if (error) return res.status(500).json({error: error.message});
        return res.status(201).json(data);

    } catch (err){
        return res.status(500).json({ error: err.message });
    }
    
}

export async function getAllRequests(req, res) {
    try {
        if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
        if (req.user?.role !== "admin") {
            return res.status(403).json({ error: "Accès refusé" });
        }
        const { data, error } = await supabase
            .from("request")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

