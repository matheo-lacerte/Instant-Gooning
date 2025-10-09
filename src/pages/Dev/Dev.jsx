import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import "./Dev.css";

export default function Dev() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isDev, setIsDev] = useState(false);
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

  const backHome = () => {
    navigate("/");
  }

  return (
    <div className="dev">
      <div className="rangee">
        <div className="colonnes">
          <ul>
            <li>
              <h2>Profil</h2>
            </li>
            <li>
              <h2>
                <Link to="/dev">Développeur</Link>
              </h2>
            </li>
          </ul>
        </div>
        <div className="colonnes">
          {!isDev ? (
            <>
              <h3>Souhaitez-vous devenir développeur?</h3>
              <div className="btn-row">
                <button className="button_dev" onClick={joinDevelopper}>oui</button>
                <button className="button_dev" onClick={backHome}>non</button>
              </div>
            </>
          ) : (
            <>
              <h3>Vous ne voulez plus être développeur?</h3>
              <div className="btn-row">
                <button className="button_dev" onClick={leaveDevelopper}>oui</button>
                <button className="button_dev" onClick={backHome}>non</button>
              </div>
            </>
          )}
        </div>
      </div>
        <Link to="/logout" className="button_dev">Déconnexion</Link>
    </div>
  );
}
