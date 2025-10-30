// src/pages/Success.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./success.css";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  const [showKeys, setShowKeys] = useState(false);
  const [keys, setKeys] = useState([]);            // [{title, key, status?}]
  const [items, setItems] = useState([]);          // [{title, quantity}]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Mémoriser la session localement (utile pour debug)
  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem("last_checkout_session_id", sessionId);
    } catch {}
  }, [sessionId]);

  // Bouton: aller chercher les clés côté backend
  const revealKeys = async () => {
    if (!sessionId) return;
    setShowKeys(true);
    setLoading(true);
    setErr(null);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(
        `http://localhost:5174/api/payments/session/keys?session_id=${encodeURIComponent(sessionId)}`,
        {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Erreur");
      setKeys(Array.isArray(j.items) ? j.items : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Copier une clé
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("clipboard copy failed", e);
    }
  };

  // Charger un petit résumé d’items (facultatif) + clear-cart best-effort
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        setErr(null);
        const token = localStorage.getItem("token");

        // Résumé des articles achetés (endpoint facultatif)
        const res = await fetch(
          `http://localhost:5174/api/payments/session/details?session_id=${encodeURIComponent(sessionId)}`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const mapped = Array.isArray(data.items)
          ? data.items.map((it) => ({ title: it.title, quantity: it.quantity }))
          : [];
        setItems(mapped);

        // Best-effort: au cas où, demander un clear cart (le webhook le fait déjà normalement)
        try {
          await fetch(
            `http://localhost:5174/api/payments/session/clear-cart?session_id=${encodeURIComponent(sessionId)}`,
            {
              method: "POST",
              credentials: "include",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            }
          );
        } catch {}
      } catch (e) {
        if (!cancelled) setErr(e.message || "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
          <p className="sub">
            Session Stripe: <code>{sessionId}</code>
          </p>
        ) : (
          <p className="sub">Votre paiement a été confirmé.</p>
        )}

        {loading && <p className="sub">Chargement…</p>}
        {err && (
          <p className="sub" style={{ color: "#f87171" }}>
            Erreur: {err}
          </p>
        )}

        {/* Petit résumé facultatif */}
        {!!items.length && !showKeys && (
          <ul className="sub">
            {items.map((it, i) => (
              <li key={i}>
                {it.title} × {it.quantity}
              </li>
            ))}
          </ul>
        )}

        {!showKeys ? (
          <div className="actions">
            <button className="btn primary" onClick={revealKeys}>
              Afficher mes clés
            </button>
            <Link className="btn" to="/">
              Accueil
            </Link>
          </div>
        ) : (
          <div className="keys-wrap">
            <h2>Vos clés</h2>
            <ul className="keys-list">
              {keys.map((obj, i) => (
                <li key={i} className="key-row">
                  <span className="key-label">{obj.title}:</span>
                  <span className="key-code">{obj.key}</span>
                  <button className="btn copy" onClick={() => copy(obj.key)} aria-label="Copier la clé">
                    Copier
                  </button>
                </li>
              ))}
            </ul>
            <div className="actions">
              <Link className="btn primary" to="/profile">
                Voir mes achats
              </Link>
              <Link className="btn" to="/">
                Accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
