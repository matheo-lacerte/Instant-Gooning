import { Link } from "react-router-dom";
import "./gameCard.css";

export default function GameCard({ game }) {
	if (!game) return null;

	return (
		<Link to={`/game/${game.id}`} className="game-card ig-card">
			<div className="ig-cover">
				{game.cover_url ? (
					<img src={game.cover_url} alt="" loading="lazy" />
				) : (
					<div className="thumb-fallback">{game.title?.[0] ?? "?"}</div>
				)}

				{typeof game.discount === "number" && game.discount > 0 ? (
					<div className="ig-badge">-{game.discount}%</div>
				) : null}

				<div className="ig-overlay">
					<div className="ig-title">{game.title}</div>
					<div className="ig-price">{game.discounted_price || game.price}$</div>
				</div>
			</div>
		</Link>
	);
}

