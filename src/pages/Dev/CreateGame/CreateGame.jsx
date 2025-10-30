import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./CreateGame.css";
import { apiUrl } from "../../../app/services/api";

export default function CreateGame() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [developer, setDeveloper] = useState("");
  const [publisher, setPublisher] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [price, setPrice] = useState(0);
  const [rating, setRating] = useState("");
  const [cover_url, setCoverUrl] = useState("");
  const [trailer_url, setTrailerUrl] = useState("");
  const [discount, setDiscount] = useState(0);
  const token = localStorage.getItem("token");

  const onPriceChange = (e) => {
    let value = e.target.value;
    if (e.target.value === "") {
      value = 0;
    }
    setPrice(value);
  };

  const onDiscountChange = (e) => {
    const value = Math.max(0, Math.min(100, Number(e.target.value)));
    setDiscount(value);
  };

  const addGame = async (e) => {
    e.preventDefault();
    const newRating = rating === "" ? null : rating;
    const payload = {
      title,
      description,
      genre,
      platform,
      developer,
      publisher,
      releaseDate,
      price,
      newRating,
      cover_url,
      trailer_url,
      discount,
    };

    try {
      const response = await fetch(
        apiUrl("/api/games/createGame"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        alert("Jeu créé avec succès !");
        navigate("/dev");
      } else {
        const errorData = await response.json();
        alert("Erreur lors de la création du jeu : " + errorData.error);
      }
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  return (
    <div className="dev">
      <div className="rangee">
        <div className="colonnes">
          <ul>
            <li>
              <h1>
                <Link to="/profile">Profil</Link>
              </h1>
            </li>
            <li>
              <h1>
                <Link to="/dev">Développeur</Link>
              </h1>
            </li>
            <li>
              <h1>Panier</h1>
            </li>
          </ul>
        </div>

        <div className="colonnes">
          <div className="create-game-container">
            <h1 className="create-title">Créer un nouveau jeu</h1>
            <form className="form-dev" onSubmit={addGame}>
              <div className="control no-margin space">
                <label htmlFor="titre">Titre du jeu*</label>
                <input
                  id="titre"
                  type="text"
                  placeholder="Entrez le titre du jeu"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="control no-margin space">
                <label htmlFor="description">Description*</label>
                <input
                  id="description"
                  type="text"
                  placeholder="Entrez la description du jeu"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="row">
                <div className="control no-margin">
                  <label htmlFor="genre">Genre</label>
                  <input
                    id="genre"
                    type="text"
                    placeholder="Entrez le genre du jeu"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  />
                </div>

                <div className="control no-margin">
                  <label htmlFor="platform">Plateforme*</label>
                  <input
                    id="platform"
                    type="text"
                    placeholder="Entrez la plateforme du jeu"
                    required
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="control no-margin">
                  <label htmlFor="developer">Développeur*</label>
                  <input
                    id="developer"
                    type="text"
                    placeholder="Entrez le développeur"
                    value={developer}
                    required
                    onChange={(e) => setDeveloper(e.target.value)}
                  />
                </div>

                <div className="control no-margin">
                  <label htmlFor="publisher">Éditeur*</label>
                  <input
                    id="publisher"
                    type="text"
                    placeholder="Entrez l'éditeur"
                    value={publisher}
                    required
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="control no-margin">
                  <label htmlFor="releaseDate">Date de sortie</label>
                  <input
                    id="releaseDate"
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                  />
                </div>

                <div className="control no-margin">
                  <label htmlFor="price">Prix*</label>
                  <input
                    id="price"
                    type="number"
                    placeholder="Entrez le prix"
                    value={price}
                    min={0}
                    max={10000}
                    onChange={(e) => onPriceChange(e)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="control no-margin">
                  <label htmlFor="rating">Note</label>
                  <input
                    id="rating"
                    type="number"
                    placeholder="Entrez la note"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rating ?? ""}
                    onChange={(e) =>
                      setRating(
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                  />
                </div>

                <div className="control no-margin">
                  <label htmlFor="cover_url">URL de la couverture</label>
                  <input
                    id="cover_url"
                    type="text"
                    placeholder="Entrez l'URL de la couverture"
                    value={cover_url}
                    onChange={(e) => setCoverUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="control no-margin">
                  <label htmlFor="trailer_url">URL de la bande-annonce</label>
                  <input
                    id="trailer_url"
                    type="text"
                    placeholder="Entrez l'URL de la bande-annonce"
                    value={trailer_url}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                  />
                </div>

                <div className="control no-margin">
                  <label htmlFor="discount">Réduction (%)*</label>
                  <input
                    id="discount"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Entrez la réduction"
                    value={discount}
                    onChange={(e) => onDiscountChange(e)}
                  />
                </div>
              </div>

              <div className="btn-envoyer">
                <button type="submit" className="button_dev">
                  Créer le jeu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Link to="/logout" className="button_dev">
        Déconnexion
      </Link>
    </div>
  );
}
