import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "./Dev.css";

export default function Dev() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isDev, setIsDev] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  let errorToken = false;

  useEffect(() => {
    const is_a_developer = async () => {
      try {
        const response = await fetch("http://localhost:5174/api/dev/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const reponseData = await response.json();

        if (response.ok) {
          setIsDev(reponseData.is_a_developer);
        } else {
          if (!errorToken) {
            alert(reponseData.error);
            errorToken = true;
          }
        }
      } catch (err) {
        if (!errorToken) {
          setIsDev(false);
          alert("Une erreur est survenue. Veuillez réessayer plus tard.");
          errorToken = true;
        }
        throw err;
      }
    };
    is_a_developer();
  }, []);

  const joinDevelopper = async () => {
    try {
      const response = await fetch("http://localhost:5174/api/dev/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      if (response.ok) {
        alert(responseData.message);
        navigate("/");
      } else {
        alert(responseData.error);
      }
    } catch (err) {
      alert("Une erreur est survenue. Veuillez réessayer plus tard.");
      throw err;
    }
  };

  const leaveDevelopper = async () => {
    try {
      const response = await fetch("http://localhost:5174/api/dev/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        alert(responseData.message);
        navigate("/");
      } else {
        alert(responseData.error);
      }
    } catch (err) {
      alert("Une erreur est survenue. Veuillez réessayer plus tard.");
      throw err;
    }
  };

  const formSubmitDev = async () => {};

  const backHome = () => {
    navigate("/");
  };

  return (
    <div className="dev">
      <div className="rangee">
        <div className="colonnes">
          <ul>
            <li>
              <h1>Profil</h1>
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
          {!isDev ? (
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
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={7}
                  />
                </div>
                <div className="btn-envoyer">
                  <button type="submit" className="button_dev">
                    Envoyer la demande
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h3>Vous ne voulez plus être développeur?</h3>
              <div className="btn-row">
                <button className="button_dev" onClick={leaveDevelopper}>
                  oui
                </button>
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
 
