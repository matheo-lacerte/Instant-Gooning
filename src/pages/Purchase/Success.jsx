import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./success.css";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [showKeys, setShowKeys] = useState(false);
  const [keys, setKeys] = useState([]);
  const [items, setItems] = useState([]); // {title, quantity}
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (sessionId) {
      try { localStorage.setItem("last_checkout_session_id", sessionId); } catch (e) { console.warn("localStorage set failed", e); }
    }
  }, [sessionId]);

  const prng = useMemo(() => {
    // Seeded PRNG from sessionId for reproducible fake keys per session
    const seed = (sessionId || "").split("").reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 2166136261);
    let s = seed || 123456789;
    return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };
  }, [sessionId]);

  const generateKey = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusing chars
    const block = (len) => Array.from({ length: len }, () => alphabet[Math.floor(prng() * alphabet.length)]).join("");
    return `${block(5)}-${block(5)}-${block(5)}-${block(5)}-${block(5)}`;
  };

  const revealKeys = () => {
    // Map one key per purchased item title (quantity times)
    const out = [];
    if (items.length) {
      for (const it of items) {
        const count = Math.max(1, Number(it.quantity) || 1);
        for (let i = 0; i < count; i++) out.push({ title: it.title, key: generateKey() });
      }
    } else {
      // Fallback: try localStorage
      let titles = [];
      try { const raw = localStorage.getItem("last_cart_titles"); const arr = raw ? JSON.parse(raw) : []; if (Array.isArray(arr)) titles = arr; } catch (e) { console.warn("localStorage read failed", e); }
      if (!titles.length) titles = ["Votre jeu"]; // minimal fallback
      for (const t of titles) out.push({ title: t, key: generateKey() });
    }
    setKeys(out);
    setShowKeys(true);
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch (e) { console.error("clipboard copy failed", e); }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        setErr(null);
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/payments/session/details?session_id=${encodeURIComponent(sessionId)}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const mapped = Array.isArray(data.items) ? data.items.map(it => ({ title: it.title, quantity: it.quantity })) : [];
        setItems(mapped);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className="purchase-wrap">
      <div className="purchase-card">
        <div className="icon ok" aria-hidden>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" stroke="#16a34a" strokeWidth="2" />
            <path d="M7 12.5l3.2 3.2L17.5 8.4" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1>Merci, paiement confirmé</h1>
        {sessionId ? (
          <p className="sub">Session Stripe: <code>{sessionId}</code></p>
        ) : (
          <p className="sub">Votre paiement a été confirmé.</p>
        )}
        {loading && <p className="sub">Chargement des articles…</p>}
        {err && <p className="sub" style={{ color: '#f87171' }}>Erreur: {err}</p>}
        {!showKeys ? (
          <div className="actions">
            <button className="btn primary" onClick={revealKeys}>Afficher mes clés</button>
            <Link className="btn" to="/">Accueil</Link>
          </div>
        ) : (
          <div className="keys-wrap">
            <h2>Vos clés</h2>
            <ul className="keys-list">
              {keys.map((obj, i) => (
                <li key={i} className="key-row">
                  <span className="key-label">{obj.title}:</span>
                  <span className="key-code">{obj.key}</span>
                  <button className="btn copy" onClick={() => copy(obj.key)} aria-label="Copier la clé">Copier</button>
                </li>
              ))}
            </ul>
            <div className="actions">
              <Link className="btn primary" to="/profile">Voir mes achats</Link>
              <Link className="btn" to="/">Accueil</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
