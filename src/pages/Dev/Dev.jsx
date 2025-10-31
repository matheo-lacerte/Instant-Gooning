import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dev.css";

// Hub Développeur page with sidebar navigation and main preview card
export default function Dev() {
    const stateClass = {
        "Accepté": "is-accepted",
        "En examination": "is-pending",
        "Refusé": "is-declined",
    };
    const navigate = useNavigate();

    // Récupère le rôle utilisateur depuis le localStorage (si fourni par l'appli)
    const isDev = useMemo(() => {
        try {
            if (typeof window === "undefined") return false;
            const u = JSON.parse(localStorage.getItem("user") || "null");
            return u?.role === "dev";
        } catch {
            return false;
        }
    }, []);
    const quickActions = useMemo(() => {
        // visibleFor: 'all' | 'dev' | 'non-dev'
        const actions = [
            { id: "view-requests", label: "Voir mes requêtes", desc: "Consultez l’historique et l’état de vos demandes.", visibleFor: "all" },
            { id: "request-dev", label: "Envoyer une requête", desc: "Soumettre une demande pour devenir développeur.", visibleFor: "non-dev" },
            { id: "my-games", label: "Mes jeux", desc: "Gérer vos jeux publiés et brouillons.", visibleFor: "dev" },
            { id: "add-game", label: "Ajouter un jeu", desc: "Créer et publier un nouveau jeu.", visibleFor: "dev" },
            { id: "dev-settings", label: "Paramètres développeur", desc: "Configurer votre profil développeur et vos préférences.", visibleFor: "all" },
        ];
        // Filtrer selon le rôle
        return actions.filter((a) =>
            a.visibleFor === "all" || (a.visibleFor === "dev" && isDev) || (a.visibleFor === "non-dev" && !isDev)
        );
    }, [isDev]);

    const sections = useMemo(() => {
        const base = [
            {
                id: "home",
                label: "Accueil",
                description:
                    "Bienvenue dans votre espace développeur. Consultez un aperçu rapide de vos jeux, ajoutez-en de nouveaux ou gérez vos paramètres.",
            },
            // Visible uniquement pour NON-dev: permettre d'envoyer une demande pour devenir développeur
            ...(!isDev
                ? [
                    {
                        id: "request-dev",
                        label: "Envoyer une requête",
                        description:
                            "Soumettez une demande pour devenir développeur. Une fois envoyée, un administrateur l'examinera.",
                    },
                ]
                : []),
            // Accessible à tous: voir l'historique de mes requêtes envoyées
            {
                id: "view-requests",
                label: "Voir mes requêtes",
                description:
                    "Consultez l'historique de vos demandes pour devenir développeur et leur statut.",
            },

            ...(isDev
                ? [
                    {
                        id: "my-games",
                        label: "Mes jeux",
                        description:
                            "Retrouvez la liste de vos jeux publiés et brouillons. Visualisez les statistiques et gérez les mises à jour.",
                    },
                    {
                        id: "add-game",
                        label: "Ajouter un jeu",
                        description:
                            "Démarrez la publication d’un nouveau titre: informations, images, prix et paramètres de distribution.",
                    },
                ]
                : []),
            {
                id: "dev-settings",
                label: "Paramètres développeur",
                description:
                    "Configurez votre profil développeur, les clés API, les webhooks et les préférences du compte.",
            },
        ];
        return base;
    }, [isDev]);

    const [activeId, setActiveId] = useState("home");
    const active = useMemo(
        () => sections.find((s) => s.id === activeId) ?? sections[0],
        [activeId, sections]
    );

    // Etats pour la demande dev (uniquement non-dev)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPendingRequest, setIsPendingRequest] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Liste des requêtes
    const [reqsLoading, setReqsLoading] = useState(false);
    const [reqsError, setReqsError] = useState("");
    const [requests, setRequests] = useState([]);

    // Vérifier si une demande est en attente quand on ouvre la section
    useEffect(() => {
        const checkPending = async () => {
            if (activeId !== "request-dev" || isDev) return;
            try {
                setLoading(true);
                setErrorMsg("");
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5174/api/admin/isPendingRequest", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Une erreur est survenue");
                setIsPendingRequest(Boolean(data?.hasPendingRequest));
                if (data?.message && data?.hasPendingRequest) setSuccessMsg(data.message);
            } catch (e) {
                setErrorMsg(String(e.message || e));
            } finally {
                setLoading(false);
            }
        };
        checkPending();
    }, [activeId, isDev]);

    // Charger l'historique des requêtes
    useEffect(() => {
        const fetchRequests = async () => {
            if (activeId !== "view-requests") return;
            try {
                setReqsLoading(true);
                setReqsError("");
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5174/api/user/getAllRequests", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Impossible de récupérer vos requêtes");
                setRequests(Array.isArray(data) ? data : []);
            } catch (e) {
                setReqsError(String(e.message || e));
            } finally {
                setReqsLoading(false);
            }
        };
        fetchRequests();
    }, [activeId]);

    const submitRequest = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setErrorMsg("");
            setSuccessMsg("");
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5174/api/admin/request-dev", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description, checkExisting: false }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Échec de l'envoi de la demande");
            setSuccessMsg(data?.message || "Votre demande a été envoyée. Vous recevrez une réponse sous peu.");
            setIsPendingRequest(true);
            setTitle("");
            setDescription("");
        } catch (e) {
            setErrorMsg(String(e.message || e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dev-hub" data-testid="dev-hub">
            <aside className="dev-hub__sidebar" aria-label="Navigation développeur">
                <div className="dev-hub__brand">
                    <span className="dev-hub__brand-title">Hub</span>
                    <span className="dev-hub__brand-sub">Développeur</span>
                </div>

                <nav className="dev-hub__nav">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            className={`dev-hub__nav-item ${activeId === s.id ? "is-active" : ""
                                }`}
                            onClick={() => setActiveId(s.id)}
                            aria-current={activeId === s.id ? "page" : undefined}
                        >
                            {s.label}
                        </button>
                    ))}
                </nav>

                <div className="dev-hub__grow" />

                <button
                    type="button"
                    className="dev-hub__back"
                    onClick={() => navigate("/")}
                    aria-label="Retour au site principal"
                >
                    ← Retour au site principal
                </button>
            </aside>

            <main className="dev-hub__content">
                <header className="dev-hub__header">
                    <h1>Hub Développeur</h1>
                </header>

                <section className="dev-hub__card" aria-live="polite">
                    <div className="dev-hub__card-header">
                        <h2 className="dev-hub__card-title">{active.label}</h2>
                    </div>
                    <div className="dev-hub__card-body">
                        {active.id === "home" ? (
                            <div className="dev-hub__grid">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.id}
                                        type="button"
                                        className="dev-hub__tile"
                                        onClick={() => setActiveId(action.id)} // ou navigate('/une-route') si tu veux router
                                        aria-label={`Ouvrir ${action.label}`}
                                    >
                                        <div className="dev-hub__tile-title">{action.label}</div>
                                        <div className="dev-hub__tile-desc">{action.desc ?? action.description}</div>
                                    </button>
                                ))}
                            </div>
                        ) : active.id === "request-dev" ? (
                            <div>
                                {loading && <p className="dev-hub__muted">Chargement…</p>}
                                {errorMsg && <p className="dev-hub__error">{errorMsg}</p>}
                                {successMsg && <p className="dev-hub__success">{successMsg}</p>}

                                {isPendingRequest ? (
                                    <div>
                                        <p className="dev-hub__card-text">
                                            Vous avez déjà une demande en attente. Merci de patienter pendant son examination.
                                        </p>
                                        <button
                                            type="button"
                                            className="dev-hub__btn"
                                            onClick={() => setActiveId("view-requests")}
                                        >
                                            Voir mes requêtes
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={submitRequest} className="dev-hub__form">
                                        <label className="dev-hub__label" htmlFor="req-title">Titre</label>
                                        <input
                                            id="req-title"
                                            className="dev-hub__input"
                                            type="text"
                                            placeholder="Ex: Demande développeur"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />

                                        <label className="dev-hub__label" htmlFor="req-desc">Description</label>
                                        <textarea
                                            id="req-desc"
                                            className="dev-hub__textarea"
                                            rows={5}
                                            placeholder="Expliquez brièvement votre motivation."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                        />

                                        <button type="submit" className="dev-hub__btn" disabled={loading}>
                                            Envoyer la requête
                                        </button>
                                    </form>
                                )}
                            </div>
                        ) : active.id === "view-requests" ? (
                            <div>
                                {reqsLoading && <p className="dev-hub__muted">Chargement…</p>}
                                {reqsError && <p className="dev-hub__error">{reqsError}</p>}
                                {!reqsLoading && !reqsError && (
                                    requests.length > 0 ? (

                                        <ul className="dev-hub__list">
                                            {requests.map((r) => (
                                                <li
                                                    key={r.id}
                                                    className={`dev-hub__req-card ${stateClass[r.requestState] ?? ""}`}
                                                >
                                                    <div className="dev-hub__req-title">{r.title}</div>
                                                    <div className="dev-hub__req-state">État: <strong>{r.requestState}</strong></div>
                                                    {r.reason && (
                                                        <div className="dev-hub__req-reason">Raison: {r.reason}</div>
                                                    )}
                                                    {r.description && (
                                                        <div className="dev-hub__req-desc">{r.description}</div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="dev-hub__card-text">Aucune requête envoyée.</p>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="dev-hub__card-text">{active.description}</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

