import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../Profile/Profile.css";

export default function Purchases() {
  const [token] = useState(localStorage.getItem("token"));
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return setError("Utilisateur non connecté");
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/user/keys", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setPurchases(Array.isArray(data) ? data : []);
        else setError(data.error || "Erreur lors de la récupération des achats");
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="dev">
      <div className="rangee">
        <div className="colonnes">
          <ul>
            <li>
              <h1>
                <Link to="/profile">Profil</Link>
              </h1>
            </li>
            <li>
              <h1>
                <Link to="/profile/purchases">Mes achats</Link>
              </h1>
            </li>
            <li>
              <h1>
                <Link to="/dev">Développeur</Link>
              </h1>
            </li>
            <li>
              <h1>
                <Link to="/cart">Panier</Link>
              </h1>
            </li>
          </ul>
        </div>

        <div className="colonnes userData">
          <h1>Mes achats</h1>

          {loading ? (
            <div>Chargement des achats…</div>
          ) : error ? (
            <div style={{ color: "#ffb4b4" }}>Erreur: {error}</div>
          ) : purchases.length === 0 ? (
            <div>Aucun achat trouvé.</div>
          ) : (
            <div className="purchases-list">
              {purchases.map((p, idx) => (
                <div key={`purchase-${idx}`} className="purchase-item" style={{ border: '1px solid var(--border, #1f2937)', padding: 12, borderRadius: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div style={{ color: 'var(--muted, #9ca3af)', fontSize: 12 }}>{new Date(p.created_at).toLocaleString?.() || p.created_at}</div>
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div><strong>Clé:</strong> <code style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 4 }}>{p.key}</code></div>
                    <div><strong>Statut:</strong> {p.status}</div>
                    {p.order_id && <div><strong>Commande:</strong> {p.order_id}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <Link to="/profile">← Retour au profil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
