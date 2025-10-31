import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../GameDetail/gameDetail.css";


export default function GameDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState("");
  const token = localStorage.getItem("token");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState({
    title: "",
    description: "",
    genre: "",
    platform: "",
    developer: "",
    publisher: "",
    price: "",
    rating: "",
    cover_url: "",
    trailer_url: "",
    discount: "",
  });

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5174/api/games/GetGameById/${id}`,
          { method: "GET" }
        );
        if (!response.ok) throw new Error("Réponse invalide du serveur");
        const data = await response.json();
        if (!ignore) {
          setGame(data);
          setEdited({
            title: data?.title ?? "",
            description: data?.description ?? "",
            genre: data?.genre ?? (Array.isArray(data?.genres) ? data.genres.join(", ") : ""),
            platform: Array.isArray(data?.platform) ? data.platform.join(", ") : (data?.platform ?? ""),
            developer: data?.developer ?? "",
            publisher: data?.publisher ?? "",
            price: data?.price ?? "",
            rating: data?.rating ?? "",
            cover_url: data?.cover_url ?? "",
            trailer_url: data?.trailer_url ?? "",
            discount: data?.discount ?? "",
          });
        }
      } catch (err) {
        if (!ignore) setError(err?.message || "Erreur inattendue");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const genres = useMemo(() => {
    if (!game) return [];
    if (editMode) return (edited.genre || "").split(",").map(s => s.trim()).filter(Boolean);
    if (Array.isArray(game.genres)) return game.genres;
    if (game.genre) return [game.genre];
    return [];
  }, [game, editMode, edited.genre]);

  const platforms = useMemo(() => {
    if (!game) return [];
    if (editMode) return (edited.platform || "").split(",").map(s => s.trim()).filter(Boolean);
    if (Array.isArray(game.platform)) return game.platform;
    if (typeof game.platform === "string" && game.platform.trim())
      return [game.platform];
    return [];
  }, [game, editMode, edited.platform]);

  const isDiscounted = useMemo(() => {
    if (!game) return false;
    if (editMode) {
      const d = Number(edited.discount);
      const p = Number(edited.price);
      return !Number.isNaN(d) && d > 0 && !Number.isNaN(p) && p > 0;
    }
    return (
      typeof game.discount === "number" &&
      game.discount > 0 &&
      Number(game.discounted_price) > 0
    );
  }, [game, editMode, edited.discount, edited.price]);

  const formatPrice = (value) => {
    if (value == null) return "";
    const cents = Number(value);
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(cents / 100);
  };

  const previewFinalPrice = useMemo(() => {
    const p = Number(editMode ? edited.price : game?.price);
    const d = Number(editMode ? edited.discount : game?.discount);
    if (Number.isNaN(p)) return 0;
    const disc = Number.isNaN(d) ? 0 : d;
    const final = p - p * (disc / 100);
    return Math.max(0, Number(final.toFixed(2)));
  }, [editMode, edited.price, edited.discount, game?.price, game?.discount]);

  const onField = (key) => (e) => setEdited((prev) => ({ ...prev, [key]: e.target.value }));

  const saveChanges = async () => {
    if (!game) return;
    try {
      setSaving(true);
      setActionMsg("");
      const payload = {};
      const fields = ["title","description","genre","platform","developer","publisher","price","rating","cover_url","trailer_url","discount"];
      for (const k of fields) {
        const oldVal = game[k] ?? "";
        const newVal = edited[k];
        if (String(newVal) !== String(oldVal)) payload[k] = newVal;
      }
      if (Object.keys(payload).length === 0) {
        setEditMode(false);
        setActionMsg("Aucun changement à enregistrer.");
        return;
      }
      const res = await fetch(`http://localhost:5174/api/games/update/${game.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Échec de la mise à jour");
      setGame(data);
      setEdited((prev) => ({ ...prev, ...payload }));
      setEditMode(false);
      setActionMsg("Modifications enregistrées.");
    } catch (e) {
      setActionMsg(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const trailerEmbedUrl = useMemo(() => {
    const url = (editMode ? edited.trailer_url : game?.trailer_url);
    if (!url) return null;
    try {
      const u = new URL(url);
      const isYouTube =
        u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
      if (isYouTube) {
        let idParam = "";
        if (u.hostname.includes("youtu.be")) {
          idParam = u.pathname.replace("/", "");
        } else if (u.searchParams.has("v")) {
          idParam = u.searchParams.get("v") || "";
        }
        if (idParam) {
          return `https://www.youtube.com/embed/${idParam}?rel=0&modestbranding=1&color=white`;
        }
      }

      return url;
    } catch {
      return url;
    }
  }, [game, editMode, edited.trailer_url]);

  const toggleEdit = () => { setEditMode((v) => !v); setActionMsg(""); };

  const deleteGame = async () => {
    if (token) {
      const response = await fetch(
        "http://localhost:5174/api/games/delete/"+game.id,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        console.error("Erreur lors de la suppression du jeu.");
        return;
      }
      setGame((g) => g ? { ...g, is_active: false } : g);
      setActionMsg("Le jeu a été supprimé.");
    } else {
      navigate("/login");
    }
  };

  const restoreGame = async () => {
    if (token) {
      const response = await fetch(
        "http://localhost:5174/api/games/restore/"+game.id,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        console.error("Erreur lors de la restauration du jeu.");
        return;
      }
      setGame((g) => g ? { ...g, is_active: true } : g);
      setActionMsg("Le jeu a été restauré et est de nouveau actif.");
    } else {
      navigate("/login");
    }
  };

  const rating10 = useMemo(() => {
    const r = game?.rating;
    const n = r == null ? 0 : Number(r);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(10, n));
  }, [game]);

  // Save recently viewed ids in localStorage for Home page
  useEffect(() => {
    if (!game?.id) return;
    try {
      const raw = localStorage.getItem("ig_recent");
      const arr = raw ? JSON.parse(raw) : [];
      const idNum = game.id;
      const next = [idNum, ...arr.filter((x) => x !== idNum)].slice(0, 10);
      localStorage.setItem("ig_recent", JSON.stringify(next));
    } catch {}
  }, [game?.id]);

  if (loading) {
    return (
      <div className="game-detail-wrap">
        <Link className="back-link" to="/" aria-label="Retour à l'accueil">
          <span className="icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path
                d="M15 18l-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Retour</span>
        </Link>
        <div className="skeleton-hero">
          <div className="skeleton-cover" />
          <div className="skeleton-meta">
            <div className="s1" />
            <div className="s2" />
            <div className="s3" />
          </div>
        </div>
      </div>
    );
  }

  if (!game || error) {
    return (
      <div className="game-detail-wrap">
        <p>{error ? `Erreur: ${error}` : "Jeu introuvable."}</p>
        <Link className="back-link" to="/" aria-label="Retour à l'accueil">
          <span className="icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path
                d="M15 18l-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Retour</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="game-detail-wrap">
  <Link className="back-link" to="/dev?section=my-games" aria-label="Retour">
        <span className="icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>Retour</span>
      </Link>

      <section
        className="game-hero"
        style={{
          backgroundImage: game.cover_url
            ? `linear-gradient(180deg, rgba(10,12,16,0.8), rgba(10,12,16,0.95)), url(${game.cover_url})`
            : undefined,
        }}
        aria-label="En-tête du jeu"
      >
        <div className="detail-header">
          <div className="gd-cover">
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.title} />
            ) : (
              <div className="thumb-fallback">{game.title?.[0] ?? "?"}</div>
            )}
          </div>
          <div className="meta">
            {editMode ? (
              <input className="title" style={{ width: "100%" }} value={edited.title} onChange={onField("title")} />
            ) : (
              <h1 className="title">{game.title}</h1>
            )}
            {editMode ? (
              <textarea className="desc" rows={3} style={{ width: "100%" }} value={edited.description} onChange={onField("description")} />
            ) : (
              <p className="desc">{game.description}</p>
            )}

            {genres.length > 0 && !editMode && (
              <div className="chips" aria-label="Genres">
                {genres.map((g) => (
                  <span key={g} className="chip">
                    {g}
                  </span>
                ))}
              </div>
            )}
            {editMode && (
              <div style={{ marginBottom: 8 }}>
                <input style={{ width: "100%" }} placeholder="Genres (séparés par des virgules)" value={edited.genre} onChange={onField("genre")} />
              </div>
            )}

            <div className="price-row">
              {isDiscounted ? (
                <span className="badge">-{game.discount}%</span>
              ) : null}
              {editMode ? (
                <>
                  <input type="number" step="0.01" style={{ width: 110 }} value={edited.price} onChange={onField("price")} aria-label="Prix" />
                  <input type="number" min="0" max="100" step="1" style={{ width: 90 }} value={edited.discount} onChange={onField("discount")} aria-label="Rabais %" />
                  <span className="price price-final">{previewFinalPrice} $</span>
                </>
              ) : isDiscounted ? (
                <>
                  <span className="price price-original">{game.price} $</span>
                  <span className="price price-final">{game.discounted_price} $</span>
                </>
              ) : (
                <span className="price price-final">{game.price}$</span>
              )}
              {game.is_active ? (
                <button
                  className="buy-btn"
                  aria-label="Supprimer le jeu"
                  onClick={deleteGame}
                >
                  Supprimer le jeu
                </button>
              ) : (
                <button
                  className="buy-btn"
                  aria-label="Restaurer le jeu"
                  onClick={restoreGame}
                >
                  Restaurer le jeu
                </button>
              )}
              {editMode ? (
                <>
                  <button className="buy-btn" onClick={saveChanges} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
                  <button className="buy-btn" onClick={toggleEdit} disabled={saving}>Annuler</button>
                </>
              ) : (
                <button className="buy-btn" aria-label="Modifier le jeu" onClick={toggleEdit}>Modifier le jeu</button>
              )}
            </div>

            {actionMsg && (
              <p style={{ color: "#42d392", marginTop: 8 }}>{actionMsg}</p>
            )}

            <div className="meta-grid">
              <div>
                <strong>Plateformes:</strong> {platforms.join(", ") || "—"}
              </div>
              {editMode && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <input style={{ width: "100%" }} placeholder="Plateformes (séparées par des virgules)" value={edited.platform} onChange={onField("platform")} />
                </div>
              )}
              <div>
                <strong>Date de sortie:</strong> {game.release_date || "—"}
              </div>
              <div>
                <strong>Développeur:</strong> {editMode ? (
                  <input value={edited.developer} onChange={onField("developer")} />
                ) : (game.developer || "—")}
              </div>
              <div>
                <strong>Éditeur:</strong> {editMode ? (
                  <input value={edited.publisher} onChange={onField("publisher")} />
                ) : (game.publisher || "—")}
              </div>
              <div className="rating-cell">
                <strong>Note:</strong>
                {editMode ? (
                  <input type="number" min="0" max="10" step="0.1" style={{ width: 90 }} value={edited.rating} onChange={onField("rating")} />
                ) : (
                  <span className="rating-num">{rating10 > 0 ? `${rating10.toFixed(1)}/10` : "Aucune pour le moment"}</span>
                )}
              </div>
            </div>

            {editMode && (
              <div className="media-edit" style={{ marginTop: 12 }}>
                <h3 className="section-title" style={{ marginTop: 0 }}>
                  <span className="bar" /> Médias
                </h3>
                <div className="media-field">
                  <label>Image de couverture (URL)</label>
                  <input
                    placeholder="https://exemple.com/cover.jpg"
                    value={edited.cover_url}
                    onChange={onField("cover_url")}
                    style={{ width: "100%" }}
                  />
                  <div className="cover-preview">
                    { (edited.cover_url || game.cover_url) ? (
                      <img src={edited.cover_url || game.cover_url} alt="Aperçu couverture" />
                    ) : (
                      <div className="thumb-fallback" style={{ minHeight: 80 }}>Aucune image</div>
                    )}
                  </div>
                </div>

                <div className="media-field">
                  <label>URL de bande‑annonce (YouTube/MP4)</label>
                  <input
                    placeholder="https://youtu.be/… ou https://site/video.mp4"
                    value={edited.trailer_url}
                    onChange={onField("trailer_url")}
                    style={{ width: "100%" }}
                  />
                  <small className="hint">YouTube: colle l’URL de la vidéo (le preview s’affiche si reconnu)</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {trailerEmbedUrl && (
        <section className="media-section">
          <h2 className="section-title">
            <span className="bar" />
            Bande‑annonce
          </h2>
          <div className="video-card">
            {trailerEmbedUrl.includes("/embed/") ? (
              <iframe
                className="video-frame"
                src={trailerEmbedUrl}
                title={`Bande-annonce: ${game.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video className="video-frame" src={trailerEmbedUrl} controls />
            )}
          </div>
        </section>
      )}

      <section className="specs">
        {game.tags?.length ? (
          <div className="tags" aria-label="Tags">
            {game.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
