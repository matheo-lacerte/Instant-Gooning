import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import NavProfile from "./NavProfile/NavProfile.jsx";
import EditProfile from "./EditProfile/EditProfile.jsx";
import EditPassword from "./EditPassword/EditPassword.jsx";
import Purchases from "./Purchases/Purchases.jsx";

import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const userParse = storedUser ? JSON.parse(storedUser) : {};

  const [username, setUsername] = useState(userParse.username || "");
  const [first, setFirst] = useState(userParse.first_name || "");
  const [last, setLast] = useState(userParse.last_name || "");
  const [email, setEmail] = useState(userParse.email || "");

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const edit = params.get("edit");

  let ModeComponent;
  if (edit === "profile") {
    ModeComponent = <EditProfile />;
  } else if (edit === "password") {
    ModeComponent = <EditPassword />;
  } else if (
    location.pathname.endsWith("/purchase") ||
    location.pathname.endsWith("/purchases")
  ) {
    ModeComponent = <Purchases />;
  } else {
    ModeComponent = <DefaultProfile />;
  }

  function DefaultProfile() {
    return (
      <>
        <h1>Informations du compte</h1>

        <div className="control">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            readOnly
          />
        </div>

        <div className="control">
          <label htmlFor="firstName">Prénom</label>
          <input
            type="text"
            id="firstName"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            readOnly
          />
        </div>

        <div className="control">
          <label htmlFor="lastName">Nom</label>
          <input
            type="text"
            id="lastName"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            readOnly
          />
        </div>

        <div className="control">
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
      </>
    );
  }

  const editProfile = () => {
    navigate("/profile?edit=profile");
  };

  const editPassword = () => {
    navigate("/profile?edit=password");
  };

  return (
    <div className="dev">
      <div className="rangee">
        <NavProfile />
        <div className="colonnes userData">
          {ModeComponent}
        </div>
      </div>

      <Link to="/logout" className="button_dev">
        Déconnexion
      </Link>
    </div>
  );
}
