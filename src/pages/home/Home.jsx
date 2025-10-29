import GameCard from "../../app/components/GameCard";
import SearchBar from "../../app/components/SearchBar";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../app/Context/AuthContext";
import "./home.css";

export default function Home() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [listeJeux, setListeJeux] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let data = null;

          const response = await fetch("http://localhost:5174/api/games/getAllGames", { method: "GET" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          data = await response.json();

        if (!cancelled) setListeJeux(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) alert("Une erreur est survenue. Veuillez réessayer plus tard.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="wrap">
      <div className="search-section">
        <SearchBar
          value={auth.search}
          onChange={auth.setSearch}
          onSubmit={(qArg) => {
            const q = (qArg ?? auth.search ?? "").trim();
            if (!q) return;
            navigate(`/search?search=${encodeURIComponent(q)}`);
          }}
          placeholder="Rechercher un jeu..."
        />
      </div>
      <h1 className="home-title">Jeux populaires</h1>
      <div className="games-grid ig-grid">
        {listeJeux.map((j) => (
          <GameCard key={j.id} game={j} />
        ))}
      </div>
    </div>
  );
}
