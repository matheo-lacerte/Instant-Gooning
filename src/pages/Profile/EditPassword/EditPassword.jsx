import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
export default function EditPassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const setshowPassword1 = () => {
    setShowOldPassword(!showOldPassword);
  };

  const setshowPassword2 = () => {
    setShowNewPassword(!showNewPassword);
  };

  const backProfile = () => {
    navigate("/profile");
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
        navigate("/profile");
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
              <h1>
                <Link to="/cart">Panier</Link>
              </h1>
            </li>
          </ul>
        </div>
        <div className="colonnes userData">
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
                  src={showOldPassword ? "../fermer.svg" : "../ouvert.svg"}
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
                  src={showNewPassword ? "../fermer.svg" : "../ouvert.svg"}
                  className="image"
                />
              </button>
            </div>
          </div>
          <div className="row-bottom">
            <button className="edit-button save" onClick={sauvegardeMDP}>
              Sauvegarder
            </button>
            <button className="edit-button cancel" onClick={backProfile}>
              Annuler
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
