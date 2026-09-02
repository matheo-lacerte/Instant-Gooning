import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import WebSocket from "ws";

dotenv.config();

if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = WebSocket;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const createSupabaseClient = (url, key) => {
  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    realtime: {
      transport: WebSocket,
    },
  });
};

// Client public (utilisé pour les requêtes côté serveur classiques)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Client admin (facultatif) pour opérations sensibles (deleteUser, etc.)
// ATTENTION: N'exposez JAMAIS la clé service_role au frontend.
export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;
