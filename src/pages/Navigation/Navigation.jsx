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
      <Link to="/" className="title"> Game Commerce Platform </Link>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
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
          <>
            <Link to="/cart">
              <button id="droite"><i className="fa fa-shopping-cart" aria-hidden="true"></i> Panier</button>
            </Link>
            <Link to="/profile">
              <button id="droite"><i className="fa fa-user" aria-hidden="true"></i> Profil</button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navigation;
