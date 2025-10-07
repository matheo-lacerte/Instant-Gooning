import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

// Client public (utilisé pour les requêtes côté serveur classiques)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Client admin (facultatif) pour opérations sensibles (deleteUser, etc.)
// ATTENTION: N'exposez JAMAIS la clé service_role au frontend.
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export default supabase;
