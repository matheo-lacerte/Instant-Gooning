import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import "./gameDetail.css";

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] =
  useState(async () => {
    try {
      const response = await fetch(
        `http://localhost:5174/api/games/GetGameById/${id}`,
        {
          method: "GET",
        }
      );

      const reponseData = await response.json();
      setGame(reponseData);
    } catch (err) {
      alert("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  });
  if (!game) {
    return (
      <div className="game-detail-wrap">
        <p>Jeu introuvable.</p>
        <Link className="back-link" to="/">
          ← Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="game-detail-wrap">
      <Link className="back-link" to="/">
        ← Retour
      </Link>

      <div className="detail-header">
        <div className="cover">
          {game.cover_url ? (
            <img src={game.cover_url} alt={game.title} />
          ) : (
            <div className="thumb-fallback">{game.title?.[0] ?? "?"}</div>
          )}
        </div>
        <div className="meta">
          <h1>{game.title}</h1>
          <p className="desc">{game.description}</p>
          <div className="chips">
            {game.genres?.map((g) => (
              <span key={g} className="chip">
                {g}
              </span>
            ))}
          </div>
          <div className="price-row">
            {typeof game.discount === "number" && game.discount > 0 ? (
              <span className="badge">-{game.discount}%</span>
            ) : null}
            <span className="price">{game.price} $</span>
            {game.discounted_price != 0 && <span className="price">{game.discounted_price} $</span>}
            <button className="buy-btn">Acheter</button>
          </div>
        </div>
      </div>

      <div className="specs">
        <div>
          <strong>Plateformes:</strong> {game.platform}
        </div>
        <div>
          <strong>Date de sortie:</strong> {game.release_date}
        </div>
        <div>
          <strong>Développeur:</strong> {game.developer}
        </div>
        <div>
          <strong>Note:</strong> {game.rating != null ? game.rating : "Aucun pour le moment"}
        </div>
        {game.tags?.length ? (
          <div className="tags">
            {game.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
