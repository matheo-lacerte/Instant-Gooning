import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../app/Context/AuthContext";
import "./navigation.css";

const Navigation = () => {
  const auth = useContext(AuthContext);

  return (
    <header className="main-header">
      <Link to="/" className="title">Instant Gooning</Link>
      <div className="nav-buttons">
        {!auth.isLoggedIn ? (
          <>
            <Link to="/login">
              <button>Connexion</button>
            </Link>
            <Link to="/register">
              <button>Inscription</button>
            </Link>
          </>
        ) : (
          <Link to="/">
            <button id="droite" onClick={auth.logout}>
              Se déconnecter
            </button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navigation;
