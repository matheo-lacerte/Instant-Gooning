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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [editProfile, setEditProfile] = useState(false)
 
  const editAccount = () => {
    setEditProfile(true)
    //navigate("/profile/editAccount");
  };

  const editPassword = () => {
    navigate("/profile/editPassword");
  };


  const annulation = () => {
    setUsername(userParse.username);
    setFirst(userParse.first_name);
    setLast(userParse.last_name);
    setEmail(userParse.email);
    setEditProfile(false);
    navigate("/profile");
  };

  const sauvegarde = async () => {
    try {
      const response = await fetch(
        "http://localhost:5174/api/user/changeUserProfile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: first,
            last_name: last,
            username,
            email,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const newUser = {
          ...userParse,
          username,
          first_name: first,
          last_name: last,
          email,
        };

        setUserParse(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));

        alert(data.message);
        navigate("/profile");
        setEditProfile(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert(error);
    }
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
              <h1><Link to="/cart">Panier</Link></h1>
            </li>
          </ul>
        </div>
        <div className="colonnes userData">
            <>
              {!editProfile ? (
                <h1>Informations du compte</h1>
              ) : (
                <h1>Modification du compte</h1>
              )}

              <div className="control no-margin">
                <label htmlFor="username">Nom d'utilisateur</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  readOnly={!editProfile ? true : false}
                />
              </div>

              <div className="control no-margin">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  readOnly={!editProfile ? true : false}
                />
              </div>

              <div className="control no-margin">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  readOnly={!editProfile ? true : false}
                />
              </div>

              <div className="control no-margin">
                <label htmlFor="email">Adresse courriel</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!editProfile ? true : false}
                />
              </div>

              {!editProfile ? (
                <div className="row-bottom">
                  <button className="edit-button" onClick={editAccount}>
                    Modifier les informations du compte
                  </button>
                  <button className="edit-button" onClick={editPassword}>
                    Modifier le mot de passe
                  </button>
                </div>
              ) : (
                <div className="row-bottom">
                  <button className="edit-button save" onClick={sauvegarde}>
                    Sauvegarder
                  </button>
                  <button className="edit-button cancel" onClick={annulation}>
                    Annuler
                  </button>
                </div>
              )}
            </>
        </div>
      </div>
      
      <Link to="/logout" className="button_dev">
        Déconnexion
      </Link>
    </div>
  );
}
