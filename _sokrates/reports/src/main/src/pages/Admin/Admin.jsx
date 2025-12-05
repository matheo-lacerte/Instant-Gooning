import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

export default function Admin() {
  const [activeId, setActiveId] = useState("pendingRequests");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const sections = useMemo(
    () => [
      {
        id: "pendingRequests",
        label: "En examination",
        desc: "Requêtes en attente d'examination.",
      },
      {
        id: "acceptedRequests",
        label: "Toutes les requêtes acceptées",
        desc: "Historique complet des requêtes traitées.",
      },
      {
        id: "refusedRequests",
        label: "Toutes les requêtes refusées",
        desc: "Historique complet des requêtes traitées.",
      },
      {
        id: "allRequests",
        label: "Toutes les requêtes",
        desc: "Historique complet des requêtes traitées.",
      },
    ],
    []
  );

  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  // Charger les requêtes selon la section
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          "/api/admin/getAllRequests",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Erreur serveur");
        let filtered = Array.isArray(data) ? data : [];

        if (activeId === "pendingRequests") {
          filtered = filtered.filter(
            (r) => r.requestState === "En examination"
          );
        } else if (activeId === "acceptedRequests") {
          filtered = filtered.filter((r) => r.requestState === "Accepté");
        } else if (activeId === "refusedRequests") {
          filtered = filtered.filter((r) => r.requestState === "Refusé");
        }

        const usersRes = await fetch(
          "/api/admin/getAllUsers",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const users = await usersRes.json();
        if (!usersRes.ok)
          throw new Error(users?.error || "Erreur récupération utilisateurs");

        const enrichedRequests = filtered.map((req) => {
          const user = users.users.find((u) => u.id === req.created_by);
          console.log(user);
          return { ...req, user };
        });

        setRequests(enrichedRequests);
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [activeId]);

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/acceptRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: id }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Erreur lors de l'acceptation");
      alert("Demande acceptée !");
      setRequests((r) => r.filter((req) => req.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDecline = async (id) => {
    const reason = prompt("Entrez la raison du refus :");
    if (!reason) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "/api/admin/declineRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ requestId: id, reason }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur lors du refus");
      alert("Demande refusée !");
      setRequests((r) => r.filter((req) => req.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="hub">
      <aside className="hub__sidebar">
        <div className="hub__brand">
          <span className="hub__brand-title">Hub</span>
          <span className="hub__brand-sub">Admin</span>
        </div>

        <nav className="hub__nav">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`hub__nav-item ${
                activeId === s.id ? "is-active" : ""
              }`}
              onClick={() => setActiveId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="hub__grow" />

        <button
          type="button"
          className="hub__back"
          onClick={() => navigate("/")}
        >
          ← Retour au site
        </button>
      </aside>

      <main className="hub__content">
        <header className="hub__header">
          <h1>Hub Administrateur</h1>
        </header>

        <section className="hub__card">
          <h2 className="hub__card-title">{active.label}</h2>
          <p className="hub__muted">{active.desc}</p>

          {loading && <p>Chargement...</p>}
          {error && <p className="hub__error">{error}</p>}

          {!loading &&
            !error &&
            (requests.length > 0 ? (
              <ul className="hub__list">
                {requests.map((r) => (
                  <li
                    key={r.id}
                    className={`hub__req hub__req-card " ${
                      r.requestState === "En examination"
                        ? "is-pending"
                        : r.requestState === "Accepté"
                        ? "is-accepted"
                        : "is-declined"
                    }`}
                  >
                    <div className="hub__req-header">
                      <strong>{r.title}</strong> — <em>{r.requestState}</em>
                      <h3>Fait par {r.user?.username || "Inconnu"}</h3>
                    </div>
                    <p>{r.description}</p>
                    <p className="hub__muted">Raison: {r.reason != "" && r.reason != null ? r.reason : "Inconnu"}</p>
                    {r.requestState === "En examination" &&
                      activeId == "pendingRequests" && (
                        <div className="hub__actions">
                          <button
                            className="hub__btn accept"
                            onClick={() => handleAccept(r.id)}
                          >
                            Accepter
                          </button>
                          <button
                            className="hub__btn decline"
                            onClick={() => handleDecline(r.id)}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune requête trouvée.</p>
            ))}
        </section>
      </main>
    </div>
  );
}
