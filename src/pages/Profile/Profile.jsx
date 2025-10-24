import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthContext } from "../../app/Context/AuthContext";

import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const userParse = JSON.parse(user);

  const [editAccount, setEditAccount] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const [username, setUsername] = useState(userParse.username);
  const [first, setFirst] = useState(userParse.first_name);
  const [last, setLast] = useState(userParse.last_name);
  const [email, setEmail] = useState(userParse.email);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  useEffect(() => {
    navigate("/profile");
  }, []);

  const editAccountAction = () => {
    setEditAccount(true);
    navigate("/profile?editProfile");
  };

  const editPasswordAction = () => {
    setEditPassword(true);
    navigate("/profile?editPassword");
  };

  const annulation = () => {
    setUsername(userParse.username);
    setFirst(userParse.first_name);
    setLast(userParse.last_name);
    setEmail(userParse.email);
    setNewPassword("");
    setPassword("");
    setEditAccount(false);
    setEditPassword(false);
    setShowPassword1(false);
    setShowPassword2(false);
    navigate("/profile");
  };

  const setshowPassword1 = () => {
    setShowPassword1(!showPassword1);
  };

  const setshowPassword2 = () => {
    setShowPassword2(!showPassword2);
  };

  const sauvegarde = async () => {};

  const sauvegardeMDP = async () => {};

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
              <h1>Panier</h1>
            </li>
          </ul>
        </div>
        <div className="colonnes userData">
          {!editPassword && userParse.role != "admin" ? (
            <>
              {!editAccount ? (
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
                  readOnly={!editAccount ? true : false}
                />
              </div>

              <div className="control no-margin">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  readOnly={!editAccount ? true : false}
                />
              </div>

              <div className="control no-margin">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  readOnly={!editAccount ? true : false}
                />
              </div>

              <div className="control no-margin">
                <label htmlFor="email">Adresse courriel</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!editAccount ? true : false}
                />
              </div>

              {!editAccount ? (
                <div className="row-bottom">
                  <button className="edit-button" onClick={editAccountAction}>
                    Modifier les informations du compte
                  </button>
                  <button className="edit-button" onClick={editPasswordAction}>
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
          ) : (
            <>
              <h1>Modification du mot de passe</h1>
              <div className="control no-margin">
                <label htmlFor="password">Ancien mot de passe</label>
                <div className="password-container">
                  <input
                    id="password"
                    type={showPassword1 ? "text" : "password"}
                    name="password"
                    placeholder="Entrez votre mot de passe"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    onClick={setshowPassword1}
                    className="eye-button"
                    type="button"
                  >
                    <img
                      src={showPassword1 ? "fermer.svg" : "ouvert.svg"}
                      className="image"
                    />
                  </button>
                </div>
              </div>

              <div className="control no-margin">
                <label htmlFor="password">Nouveau mot de passe</label>
                <div className="password-container">
                  <input
                    id="password"
                    type={showPassword2 ? "text" : "password"}
                    name="password"
                    placeholder="Entrez votre mot de passe"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    onClick={setshowPassword2}
                    className="eye-button"
                    type="button"
                  >
                    <img
                      src={showPassword2 ? "fermer.svg" : "ouvert.svg"}
                      className="image"
                    />
                  </button>
                </div>
              </div>
              <div className="row-bottom">
                <button className="edit-button save" onClick={sauvegardeMDP}>
                  Sauvegarder
                </button>
                <button className="edit-button cancel" onClick={annulation}>
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Link to="/logout" className="button_dev">
        Déconnexion
      </Link>
    </div>
  );
}
