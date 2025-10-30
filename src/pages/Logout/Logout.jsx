import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../app/Context/AuthContext.jsx";
import { useContext } from "react";

import "./Logout.css";

const Logout = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const deconnexion = async () => {
    try {
      const reponse = await fetch("http://localhost:5174/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!reponse.ok) {
        throw new Error("Erreur lors de la déconnexion");
      }

      const reponseData = await reponse.json();
      alert(reponseData.message);
      auth.logout();
      navigate("/");
    } catch (error) {
      auth.logout();
      navigate("/");
    }
  };

  return (
    <div className="logout-page">
      <h1>Voulez-vous déconnecter?</h1>
      <div className="logout-choices">
        <button className="button_logout green" onClick={deconnexion}>
          Oui
        </button>
        <button className="button_logout red">
          <Link to="/dev">Non</Link>
        </button>
      </div>
    </div>
  );
};

export default Logout;
