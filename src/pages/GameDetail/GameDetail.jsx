import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./gameDetail.css";

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        if (!ignore) setGame(data);
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
    if (Array.isArray(game.genres)) return game.genres;
    if (game.genre) return [game.genre];
    return [];
  }, [game]);

  const platforms = useMemo(() => {
    if (!game) return [];
    if (Array.isArray(game.platform)) return game.platform;
    if (typeof game.platform === "string" && game.platform.trim()) return [game.platform];
    return [];
  }, [game]);

  const isDiscounted = useMemo(() => {
    if (!game) return false;
    return typeof game.discount === "number" && game.discount > 0 && Number(game.discounted_price) > 0;
  }, [game]);

  const formatPrice = (value) => {
    if (value == null) return "";
    const cents = Number(value);
    return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(cents / 100);
  };

  const trailerEmbedUrl = useMemo(() => {
    const url = game?.trailer_url;
    if (!url) return null;
    try {
      const u = new URL(url);
      const isYouTube = u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
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
  }, [game]);

  const rating10 = useMemo(() => {
    const r = game?.rating;
    const n = r == null ? 0 : Number(r);
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(10, n));
  }, [game]);

  if (loading) {
    return (
      <div className="game-detail-wrap">
        <Link className="back-link" to="/" aria-label="Retour à l'accueil">
          <span className="icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
              <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>Retour</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="game-detail-wrap">
      <Link className="back-link" to="/" aria-label="Retour à l'accueil">
        <span className="icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span>Retour</span>
      </Link>

      <section
        className="game-hero"
        style={{ backgroundImage: game.cover_url ? `linear-gradient(180deg, rgba(10,12,16,0.8), rgba(10,12,16,0.95)), url(${game.cover_url})` : undefined }}
        aria-label="En-tête du jeu"
      >
        <div className="detail-header">
          <div className="cover">
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.title} />
            ) : (
              <div className="thumb-fallback">{game.title?.[0] ?? "?"}</div>
            )}
          </div>
          <div className="meta">
            <h1 className="title">{game.title}</h1>
            <p className="desc">{game.description}</p>

            {genres.length > 0 && (
              <div className="chips" aria-label="Genres">
                {genres.map((g) => (
                  <span key={g} className="chip">{g}</span>
                ))}
              </div>
            )}

            <div className="price-row">
              {isDiscounted ? <span className="badge">-{game.discount}%</span> : null}
              {isDiscounted ? (
                <>
                  <span className="price price-original">{(game.price)} $</span>
                  <span className="price price-final">{(game.discounted_price)} $</span>
                </>
              ) : (
                <span className="price price-final">{(game.price)}$</span>
              )}
              <button className="buy-btn" aria-label="Acheter le jeu">Acheter</button>
            </div>

            <div className="meta-grid">
              <div><strong>Plateformes:</strong> {platforms.join(", ") || "—"}</div>
              <div><strong>Date de sortie:</strong> {game.release_date || "—"}</div>
              <div><strong>Développeur:</strong> {game.developer || "—"}</div>
              <div><strong>Éditeur:</strong> {game.publisher || "—"}</div>
              <div className="rating-cell">
                <strong>Note:</strong>
                <span className="rating-num">{rating10 > 0 ? `${rating10.toFixed(1)}/10` : "Aucune pour le moment"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {trailerEmbedUrl && (
        <section className="media-section">
          <h2 className="section-title"><span className="bar" />Bande‑annonce</h2>
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
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
