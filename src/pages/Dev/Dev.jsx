import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dev() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isDev, setIsDev] = useState(null);

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
                setIsDev(false);
                alert(reponseData.error);
            }

        } catch (err) {
            setIsDev(false);
            alert("Une erreur est survenue. Veuillez réessayer plus tard.");
            throw err;
        }
    };
    is_a_developer();
  }, [token]);

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

  return (
    <>
      <div className="colonnes">
        <div className="rangee">
          <button>
            <Link to="/dev">Développeur</Link>
          </button>
        </div>
        <div className="rangee">
          {!isDev ? (
            <>
              <h3>Souhaitez-vous devenir développeur?</h3>
              <button onClick={joinDevelopper}>oui</button>
              <button>
                <Link to="/">non</Link>
              </button>
            </>
          ) : (
            <>
              <h3>Vous ne voulez plus être développeur?</h3>
              <button onClick={leaveDevelopper}>oui</button>
              <button>
                <Link to="/">non</Link>
              </button>
            </>
          )}
        </div>
      </div>
      <button><Link to="/logout">Déconnexion</Link></button>
    </>
  );
}
