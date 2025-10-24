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
        const { data: existing, error: existingError } = await client
            .from('request')
            .select('id')
            .eq('created_by', req.user.id)
            .eq('requestState', 'En examination')
            .limit(1);

        if (existingError) return res.status(500).json({ error: existingError.message });
        if (existing && existing.length > 0) {
            return res.status(409).json({ code: 'ALREADY_EXISTS', message: 'Vous avez déjà une demande en attente' });
        }
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
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Service role non configuré' });
    }

    const { data, error } = await supabaseAdmin
      .from('request')
      .select('*')
      .order('created_at', { ascending: true }); 

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function acceptRequest(req, res){
    try {
        if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
        if (req.user?.role !== "admin") {
            return res.status(403).json({ error: "Accès refusé" });
        }
        const userId = req.body?.userId;
        if (!userId) return res.status(400).json({ error: 'ID utilisateur requis' });
        const client = supabaseAdmin || supabase;
        const { error: userError } = await client
            .from("users")
            .update({ role: "dev" })
            .eq("id", userId);

        const { error: requestError } = await client
            .from("request")
            .update({ requestState: "Accepté" })
            .eq("created_by", userId);
        if (requestError) return res.status(500).json({ error: requestError.message });
        if (userError) return res.status(500).json({ error: userError.message });
        return res.json({ message: "Rôle développeur ajouté avec succès" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

