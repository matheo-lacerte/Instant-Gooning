import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [userParse, setUserParse] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  const [username, setUsername] = useState(userParse.username || "");
  const [first, setFirst] = useState(userParse.first_name || "");
  const [last, setLast] = useState(userParse.last_name || "");
  const [email, setEmail] = useState(userParse.email || "");

  const editProfile = () => {
    navigate("/profile/editProfile");
  };

  const editPassword = () => {
    navigate("/profile/editPassword");
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
              <h1>
                <Link to="/cart">Panier</Link>
              </h1>
            </li>
          </ul>
        </div>
        <div className="colonnes userData">
          <h1>Informations du compte</h1>

          <div className="control no-margin">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              readOnly
            />
          </div>

          <div className="control no-margin">
            <label htmlFor="firstName">Prénom</label>
            <input
              type="text"
              id="firstName"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              readOnly
            />
          </div>

          <div className="control no-margin">
            <label htmlFor="lastName">Nom</label>
            <input
              type="text"
              id="lastName"
              value={last}
              onChange={(e) => setLast(e.target.value)}
              readOnly
            />
          </div>

          <div className="control no-margin">
            <label htmlFor="email">Adresse courriel</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly
            />
          </div>

          <div className="row-bottom">
            <button className="edit-button" onClick={editProfile}>
              Modifier les informations du compte
            </button>
            <button className="edit-button" onClick={editPassword}>
              Modifier le mot de passe
            </button>
          </div>
        </div>
      </div>

      <Link to="/logout" className="button_dev">
        Déconnexion
      </Link>
    </div>
  );
}
