import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Dev.css";

// Hub Développeur page with sidebar navigation and main preview card
export default function Dev() {
    const [gamesLoading, setGamesLoading] = useState(false);
    const [gamesError, setGamesError] = useState("");
    const [devGames, setDevGames] = useState([]);
    const stateClass = {
        "Accepté": "is-accepted",
        "En examination": "is-pending",
        "Refusé": "is-declined",
    };
    const navigate = useNavigate();
    const location = useLocation();

    // Rôle développeur (initialisé depuis localStorage, puis rafraîchi côté serveur)
    const [isDev, setIsDev] = useState(() => {
        try {
            if (typeof window === "undefined") return false;
            const u = JSON.parse(localStorage.getItem("user") || "null");
            return u?.role === "dev" || u?.role === "admin";
        } catch {
            return false;
        }
    });

    // Rafraîchir le rôle courant depuis l'API (utile après acceptation sans reconnexion)
    useEffect(() => {
        const refreshRole = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await fetch("http://localhost:5174/api/dev", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) return;
                if (data?.role) {
                    const flag = data.role === "dev" || data.role === "admin";
                    setIsDev(flag);
                    try {
                        const u = JSON.parse(localStorage.getItem("user") || "null") || {};
                        if (u.role !== data.role) {
                            u.role = data.role;
                            localStorage.setItem("user", JSON.stringify(u));
                        }
                    } catch {}
                }
            } catch {}
        };
        refreshRole();
        // on ne dépend pas de isDev ici volontairement (rafraîchissement ponctuel)
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // If a query parameter ?section=... is present, open that section on load
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("section");
        if (!q) return;
        const exists = sections.some((s) => s.id === q);
        if (exists) setActiveId(q);
    }, [location.search, sections]);

    // Etats pour la demande dev (uniquement non-dev)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPendingRequest, setIsPendingRequest] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Formulaire d'ajout de jeu (dev seulement)
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");
    const [addSuccess, setAddSuccess] = useState("");
    const [addForm, setAddForm] = useState({
        title: "",
        description: "",
        genre: "",
        platform: "",
        developer: "",
        publisher: "",
        release_date: "",
        price: "",
        rating: "",
        cover_url: "",
        trailer_url: "",
        discount: "0",
    });
    const onAddChange = (k) => (e) => setAddForm((p) => ({ ...p, [k]: e.target.value }));
    const submitAddGame = async (e) => {
        e.preventDefault();
        setAddError("");
        setAddSuccess("");
        try {
            setAddLoading(true);
            const token = localStorage.getItem("token");
            const payload = {
                ...addForm,
                price: addForm.price === "" ? undefined : Number(addForm.price),
                rating: addForm.rating === "" ? undefined : Number(addForm.rating),
                discount: addForm.discount === "" ? 0 : Number(addForm.discount),
            };
            if (!payload.title || payload.price == null) {
                throw new Error("Titre et prix sont requis");
            }
            const res = await fetch("http://localhost:5174/api/games/createGame", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Impossible de créer le jeu");
            setAddSuccess("Jeu créé avec succès.");
            // Reset form and aller à Mes jeux
            setAddForm({
                title: "", description: "", genre: "", platform: "", developer: "", publisher: "",
                release_date: "", price: "", rating: "", cover_url: "", trailer_url: "", discount: "0",
            });
            setActiveId("my-games");
        } catch (err) {
            setAddError(String(err.message || err));
        } finally {
            setAddLoading(false);
        }
    };

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

    useEffect(() => {
        const fetchDevGames = async () => {
            if (!(activeId === "my-games" || activeId === "dev-settings") || !isDev) return;
            try {
                setGamesLoading(true);
                setGamesError("");
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5174/api/dev/games", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Impossible de récupérer vos jeux");
                setDevGames(Array.isArray(data) ? data : []);
            } catch (e) {
                setGamesError(String(e.message || e));
            } finally {
                setGamesLoading(false);
            }
        };
        fetchDevGames();
    }, [activeId, isDev]);


    const [settingsMsg, setSettingsMsg] = useState("");
    const [settingsErr, setSettingsErr] = useState("");
    const [transfer, setTransfer] = useState({ gameId: "", email: "" });
    const onTransferChange = (k) => (e) => setTransfer((p) => ({ ...p, [k]: e.target.value }));
    const doTransfer = async (e) => {
        e.preventDefault();
        setSettingsMsg("");
        setSettingsErr("");
        try {
            if (!transfer.gameId || !transfer.email) throw new Error("Sélectionnez un jeu et entrez l'email cible");
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5174/api/dev/transfer-game", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ game_id: Number(transfer.gameId), to_user_email: transfer.email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Transfert impossible");
            setSettingsMsg("Transfert effectué.");
            setTransfer({ gameId: "", email: "" });
            // rafraîchir la liste des jeux (le jeu disparaîtra si transféré à un autre compte)
            setActiveId("my-games");
        } catch (err) {
            setSettingsErr(String(err.message || err));
        }
    };

    const disableAll = async () => {
        setSettingsMsg("");
        setSettingsErr("");
        const confirm1 = window.confirm("Voulez-vous vraiment désactiver tous vos jeux ?");
        if (!confirm1) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5174/api/dev/disable-all", {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Opération impossible");
            setSettingsMsg(`Jeux désactivés (${data.disabledCount || 0}).`);
        } catch (err) {
            setSettingsErr(String(err.message || err));
        }
    };

    const leaveProgram = async () => {
        setSettingsMsg("");
        setSettingsErr("");
        const confirm1 = window.confirm("Quitter le programme développeur ? Votre rôle redeviendra 'user'.");
        if (!confirm1) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:5174/api/dev/leave", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Opération impossible");
            setSettingsMsg(data?.message || "Vous avez quitté le programme développeur.");
            // Mettre à jour l'état local et le localStorage
            setIsDev(false);
            try {
                const u = JSON.parse(localStorage.getItem("user") || "null") || {};
                if (u.role !== "user") {
                    u.role = "user";
                    localStorage.setItem("user", JSON.stringify(u));
                }
            } catch {}
        } catch (err) {
            setSettingsErr(String(err.message || err));
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
                                        onClick={() => setActiveId(action.id)} 
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
                        ) : active.id === "my-games" ? (
                            <div>
                                {gamesLoading && <p className="dev-hub__muted">Chargement…</p>}
                                {gamesError && <p className="dev-hub__error">{gamesError}</p>}
                                {!gamesLoading && !gamesError && (
                                    devGames.length > 0 ? (
                                        <div className="dev-hub__grid">
                                            {devGames.map((game) => {
                                                const title = game.title || "Jeu sans titre";
                                                const price = game.discountedPrice || game.price || 0;
                                                const imgUrl = game.cover_url || game.image || null;
                                                return (
                                                    <button
                                                        key={game.id}
                                                        type="button"
                                                        className={`dev-hub__tile dev-hub__tile--row ${!game.is_active ? "dev-hub__tile--inactive" : ""}`}
                                                        onClick={() => navigate(`/dev/game/${game.id}`)}
                                                        aria-label={`Gérer le jeu ${title}`}
                                                    >
                                                        {imgUrl ? (
                                                            <img className="dev-hub__thumb" src={imgUrl} alt={title} />
                                                        ) : (
                                                            <div className="dev-hub__thumb dev-hub__thumb--placeholder">{title.charAt(0)}</div>
                                                        )}
                                                        <div className="dev-hub__meta">
                                                            <div className="dev-hub__meta-top">
                                                                <div className="dev-hub__game-title" title={title}>{title}</div>
                                                                <div className="dev-hub__game-price">Prix: {price} $</div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="dev-hub__card-text">{active.description}</p>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : active.id === "add-game" ? (
                            <div>
                                <form onSubmit={submitAddGame} className="dev-hub__form">
                                    {addError && <p className="dev-hub__error">{addError}</p>}
                                    {addSuccess && <p className="dev-hub__success">{addSuccess}</p>}

                                    <label className="dev-hub__label" htmlFor="add-title">Titre *</label>
                                    <input id="add-title" className="dev-hub__input" value={addForm.title} onChange={onAddChange("title")} required />

                                    <label className="dev-hub__label" htmlFor="add-desc">Description *</label>
                                    <textarea id="add-desc" className="dev-hub__textarea" rows={4} value={addForm.description} onChange={onAddChange("description")} required />

                                    <label className="dev-hub__label" htmlFor="add-genre">Genre(s)</label>
                                    <input id="add-genre" className="dev-hub__input" placeholder="Ex: Action, Aventure" value={addForm.genre} onChange={onAddChange("genre")} />

                                    <label className="dev-hub__label" htmlFor="add-platform">Plateforme(s)</label>
                                    <input id="add-platform" className="dev-hub__input" placeholder="Ex: PC, PS5" value={addForm.platform} onChange={onAddChange("platform")} />

                                    <label className="dev-hub__label" htmlFor="add-developer">Développeur</label>
                                    <input id="add-developer" className="dev-hub__input" value={addForm.developer} onChange={onAddChange("developer")} />

                                    <label className="dev-hub__label" htmlFor="add-publisher">Éditeur</label>
                                    <input id="add-publisher" className="dev-hub__input" value={addForm.publisher} onChange={onAddChange("publisher")} />

                                    <label className="dev-hub__label" htmlFor="add-release">Date de sortie</label>
                                    <input id="add-release" className="dev-hub__input" type="date" value={addForm.release_date} onChange={onAddChange("release_date")} />

                                    <label className="dev-hub__label" htmlFor="add-price">Prix (en $) *</label>
                                    <input id="add-price" className="dev-hub__input" type="number" step="0.01" value={addForm.price} onChange={onAddChange("price")} required />

                                    <label className="dev-hub__label" htmlFor="add-discount">Rabais (%)</label>
                                    <input id="add-discount" className="dev-hub__input" type="number" min="0" max="100" step="1" value={addForm.discount} onChange={onAddChange("discount")} />

                                    <label className="dev-hub__label" htmlFor="add-rating">Note (/10)</label>
                                    <input id="add-rating" className="dev-hub__input" type="number" min="0" max="10" step="0.1" value={addForm.rating} onChange={onAddChange("rating")} />

                                    <label className="dev-hub__label" htmlFor="add-cover">Image (URL)</label>
                                    <input id="add-cover" className="dev-hub__input" placeholder="https://.../cover.jpg" value={addForm.cover_url} onChange={onAddChange("cover_url")} />

                                    <label className="dev-hub__label" htmlFor="add-trailer">Bande‑annonce (URL)</label>
                                    <input id="add-trailer" className="dev-hub__input" placeholder="https://youtu.be/... ou https://.../video.mp4" value={addForm.trailer_url} onChange={onAddChange("trailer_url")} />

                                    <button type="submit" className="dev-hub__btn" disabled={addLoading}>
                                        {addLoading ? "Création…" : "Créer le jeu"}
                                    </button>
                                </form>
                            </div>
                        ) : active.id === "dev-settings" ? (
                            <div>
                                <p className="dev-hub__card-text">{active.description}</p>

                                {settingsErr && <p className="dev-hub__error">{settingsErr}</p>}
                                {settingsMsg && <p className="dev-hub__success">{settingsMsg}</p>}

                                {isDev && (
                                    <div className="dev-hub__stack">
                                        <h3>Transférer un jeu à un autre compte</h3>
                                        <form onSubmit={doTransfer} className="dev-hub__form">
                                            <label className="dev-hub__label">Jeu</label>
                                            <select className="dev-hub__input" value={transfer.gameId} onChange={onTransferChange("gameId")}>
                                                <option value="">— Sélectionnez —</option>
                                                {devGames.map((g) => (
                                                    <option key={g.id} value={g.id}>{g.title} (#{g.id})</option>
                                                ))}
                                            </select>
                                            <label className="dev-hub__label">Email du compte cible</label>
                                            <input className="dev-hub__input" type="email" placeholder="dev@exemple.com" value={transfer.email} onChange={onTransferChange("email")} />
                                            <button className="dev-hub__btn" type="submit">Transférer</button>
                                        </form>

                                        <hr />

                                        <h3>Désactiver tous mes jeux</h3>
                                        <p className="dev-hub__muted">Cette action rendra vos jeux indisponibles à l’achat. Vous pourrez les restaurer individuellement plus tard.</p>
                                        <button className="dev-hub__btn" onClick={disableAll}>Désactiver tous les jeux</button>

                                        <hr />

                                        <h3>Quitter le programme développeur</h3>
                                        <p className="dev-hub__muted">Vous perdrez l’accès aux outils développeur. Vous pourrez refaire une demande plus tard.</p>
                                        <button className="dev-hub__btn" onClick={leaveProgram}>Quitter le programme</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p className="dev-hub__card-text">{active.description}</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

