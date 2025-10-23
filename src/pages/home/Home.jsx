import GameCard from "../../app/components/GameCard";
import { useState } from "react";
import "./home.css";

export default function Home() {
  const [listeJeux, setListeJeux] = useState ([]);
  useState (async () => {
    try {
      const response = await fetch(
        "http://localhost:5174/api/games/GetAllGames",
        {
          method: "GET",
        }
      );

      const reponseData = await response.json();
      setListeJeux(reponseData);
    } catch (err) {
      alert("Une erreur est survenue. Veuillez réessayer plus tard.");
      throw err;
    }
  });

  return (
    <div className="wrap">
      <h1 className="home-title">Jeux populaires</h1>
      <div className="games-grid ig-grid">
        {listeJeux.map((j) => (
          <GameCard key={j.id} game={j} />
        ))}
      </div>
    </div>
  );
}
