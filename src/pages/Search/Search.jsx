import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import GameCard from "../../app/components/GameCard";

import "./Search.css";

export default function Search() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [listeJeux, setListeJeux] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(
          "http://localhost:5174/api/games/GetAllGames",
          {
            method: "GET",
          }
        );

        const reponseData = await response.json();
        const filteredData = reponseData.filter((game) =>
          game.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setListeJeux(filteredData);
      } catch (err) {
        alert("Une erreur est survenue. Veuillez réessayer plus tard.");
        throw err;
      }
    };

    fetchGames();
  }, [searchTerm]);

  return (
    <div className="wrap">
      <h1 className="search-result">Résultats de recherche pour "{searchTerm}"</h1>
      {listeJeux.length === 0 && searchTerm && (
        <p>Aucun jeu trouvé pour "{searchTerm}".</p>
      )}
        <div className="games-grid ig-grid">
          {listeJeux.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
    </div>
  );
}
