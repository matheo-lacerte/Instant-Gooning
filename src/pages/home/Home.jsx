import { mockGames } from "../../app/data/mockGames";
import GameCard from "../../app/components/GameCard";
import "./home.css";

export default function Home() {
  return (
    <div className="home-wrap">
      <h1 className="home-title">Jeux populaires</h1>
      <div className="games-grid ig-grid">
        {mockGames.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </div>
  );
}
