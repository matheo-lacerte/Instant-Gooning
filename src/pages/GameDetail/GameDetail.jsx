import { useParams, Link } from "react-router-dom";
import { getGameById } from "../../app/data/mockGames";
import "./gameDetail.css";

export default function GameDetail() {
  const { id } = useParams();
  const game = getGameById(id);

  if (!game) {
    return (
      <div className="game-detail-wrap">
        <p>Jeu introuvable.</p>
        <Link className="back-link" to="/">← Retour</Link>
      </div>
    );
  }

  return (
    <div className="game-detail-wrap">
      <Link className="back-link" to="/">← Retour</Link>

      <div className="detail-header">
        <div className="cover">
          {game.cover ? (
            <img src={game.cover} alt={game.title} />
          ) : (
            <div className="thumb-fallback">{game.title?.[0] ?? "?"}</div>
          )}
        </div>
        <div className="meta">
          <h1>{game.title}</h1>
          <p className="desc">{game.description}</p>
          <div className="chips">
            {game.genres?.map((g) => (
              <span key={g} className="chip">{g}</span>
            ))}
          </div>
          <div className="price-row">
            {typeof game.discount === "number" && game.discount > 0 ? (
              <span className="badge">-{game.discount}%</span>
            ) : null}
            <span className="price">{game.price} $</span>
            <button className="buy-btn">Acheter</button>
          </div>
        </div>
      </div>

      <div className="specs">
        <div><strong>Plateformes:</strong> {game.platforms?.join(", ")}</div>
        <div><strong>Date de sortie:</strong> {game.releaseDate}</div>
        <div><strong>Développeur:</strong> {game.developer}</div>
        <div><strong>Note:</strong> {game.rating}</div>
        {game.tags?.length ? (
          <div className="tags">
            {game.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
