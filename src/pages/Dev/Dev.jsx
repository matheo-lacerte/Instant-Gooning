import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "./Dev.css";

export default function Dev() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const userParsed = JSON.parse(user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const formSubmitDev = async () => {
    try {
      const response = await fetch(
        "http://localhost:5174/api/admin/request-dev",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        throw new Error("Données invalides");
      }
    } catch (error) {
      console.error("");
    }
  };

  const backHome = () => {
    navigate("/");
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
          {userParsed.role != "dev" ? (
            <div className="margin-colonne">
              <h1 className="top">
                Formulaire de demande pour être développeur
              </h1>
              <form onSubmit={formSubmitDev} className="form-dev">
                <div className="control no-margin space">
                  <label htmlFor="titre">Titre</label>
                  <input
                    id="titre"
                    type="text"
                    name="titre"
                    placeholder="Entrez le titre de la demande"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="control no-margin space">
                  <label htmlFor="contenu">Contenu</label>
                  <textarea
                    id="contenu"
                    type="text"
                    name="contenu"
                    placeholder="Entrez le contenu de votre demande"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={7}
                  />
                </div>
                <div className="btn-envoyer">
                  <button
                    type="submit"
                    className="button_dev"
                  >
                    Envoyer la demande
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h3>Vous ne voulez plus être développeur?</h3>
              <div className="btn-row">
                <button className="button_dev">oui</button>
                <button className="button_dev" onClick={backHome}>
                  non
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Link to="/logout" className="button_dev">
        Déconnexion
      </Link>
    </div>
  );
}
