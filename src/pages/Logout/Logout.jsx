import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../app/Context/AuthContext.jsx";
import { useContext } from "react";

import "./Logout.css";

const Logout = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const reponse = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!reponse.ok) {
        throw new Error("Erreur lors de la déconnexion");
      }

      const reponseData = await reponse.json();
      console.log(reponseData.message);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
    auth.logout();
    navigate("/");
  };

  return (
    <div className="logout-page">
      <h1>Voulez-vous déconnecter?</h1>
      <div>
        <button className="button_logout green" onClick={handleSubmit}>
          Oui
        </button>
        <button className="button_logout red">
          <Link to="/profile">Non</Link>
        </button>
      </div>
    </div>
  );
};

export default Logout;
