import { supabase, supabaseAdmin } from "../config/supabase.js";

export async function getAllRequests(req, res) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    const client = req.supabase;
    const { data, error } = await client
      .from('request')
      .select('*')
      .order('created_at', { ascending: false }); 

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}