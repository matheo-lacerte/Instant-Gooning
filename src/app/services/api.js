// Centralized API base and URL helper for dev/prod
// In dev (Vite), leave VITE_API_URL empty to use the proxy (e.g. '/api').
// In prod (Vercel), set VITE_API_URL to your backend origin, e.g. 'https://api.example.com'.

export const API_BASE = (import.meta?.env?.VITE_API_URL || "").replace(/\/$/, "");

export function apiUrl(path = "") {
  if (!path) return API_BASE || "/api";
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const hasLeadingSlash = path.startsWith("/");
  const base = API_BASE || ""; // if empty, will resolve to same-origin
  return `${base}${hasLeadingSlash ? "" : "/"}${path}`;
}
