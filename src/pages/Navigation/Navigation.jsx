import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../app/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./navigation.css";

const Navigation = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const recherche = () => {
    if (!auth.search || auth.search.trim() === "") return;
    navigate(`/search?search=${encodeURIComponent(auth.search.trim())}`);
  };

  return (
    <header className="main-header">
      <Link to="/" className="title"> Instant Gooning </Link>
      <div className="search-bar">
        <input type="text" placeholder="Rechercher un jeu..." value={auth.search} onChange={(e) => auth.setSearch(e.target.value)} />
        <button onClick={recherche}>
          <img src="/loupe.png" className="image" />
        </button>
      </div>
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
          <Link to="/dev">
            <button id="droite">Profil</button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navigation;
