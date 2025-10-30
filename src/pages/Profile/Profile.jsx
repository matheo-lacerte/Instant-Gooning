import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isEditProfile = queryParams.has("editProfile");
  const isEditPassword = queryParams.has("editPassword");
  const [editAccount, setEditAccount] = useState(isEditProfile);
  const [editPassword, setEditPassword] = useState(isEditPassword);

  const [userParse, setUserParse] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  const [username, setUsername] = useState(userParse.username || "");
  const [first, setFirst] = useState(userParse.first_name || "");
  const [last, setLast] = useState(userParse.last_name || "");
  const [email, setEmail] = useState(userParse.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
 
  useEffect(() => {
    if (editAccount) {
      editAccountAction();
    } else if (editPassword) {
      editPasswordAction();
    } else {
      navigate("/profile");
    }
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
    setOldPassword("");
    setEditAccount(false);
    setEditPassword(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    navigate("/profile");
  };

  const setshowPassword1 = () => {
    setShowOldPassword(!showOldPassword);
  };

  const setshowPassword2 = () => {
    setShowNewPassword(!showNewPassword);
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
        setEditAccount(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  const sauvegardeMDP = async () => {
    try {
      const response = await fetch(
        "http://localhost:5174/api/user/changePassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        alert(data.message);
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
                    type={showOldPassword ? "text" : "password"}
                    name="password"
                    placeholder="Entrez votre mot de passe"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <button
                    onClick={setshowPassword1}
                    className="eye-button"
                    type="button"
                  >
                    <img
                      src={showOldPassword ? "fermer.svg" : "ouvert.svg"}
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
                    type={showNewPassword ? "text" : "password"}
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
                      src={showNewPassword ? "fermer.svg" : "ouvert.svg"}
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
