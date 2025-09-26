import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../app/Context/AuthContext.jsx";
import { useContext } from "react";

const Logout = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const deconnexion = async () => {
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
  };

  return (
    <>
      <h1>Voulez-vous déconnecter?</h1>
      <button onClick={deconnexion}>Oui</button>
      <button>
        <Link to="/dev">Non</Link>
      </button>
    </>
  );
};

export default Logout;
