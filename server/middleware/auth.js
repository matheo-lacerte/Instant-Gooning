import { supabase } from "../config/supabase.js";
import { createClient } from "@supabase/supabase-js";

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token manquant" });
    }

    try {
        // Vérifie le token avec Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({ error: "Token invalide" });
        }

        // Crée un client "scopé" avec le token pour que les requêtes suivantes
        // soient évaluées sous le rôle authenticated (RLS) et non en anon.
        // On ne l'écrase pas sur l'instance globale pour éviter les effets de bord.
        req.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: { Authorization: `Bearer ${token}` }
                }
            }
        );

        // Optionnel: récupère les données du profil utilisateur
        const { data: profile } = await req.supabase
            .from("users")
            .select("id, username, first_name, last_name, role, email")
            .eq("id", user.id)
            .maybeSingle();

        // Ajoute les informations utilisateur à la requête
        req.user = {
            id: user.id,
            email: user.email,
            username: profile?.username,
            first_name: profile?.first_name,
            last_name: profile?.last_name,
            role: profile?.role
        };

        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(500).json({ error: "Erreur d'authentification" });
    }
}


