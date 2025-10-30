import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "./register.css";
import { apiUrl } from "../../app/services/api";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerSubmitHandler = async (event) => {
    event.preventDefault();

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    };

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        throw new Error("Données invalides");
      }

      alert("Ne reste plus qu'à vous connecter!");
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
    }
  };

  const changement = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Inscription</h1>

        <div className="control-row">
          <div className="control no-margin">
            <label htmlFor="email">Courriel</label>
            <input
              id="email"
              type="text"
              name="email"
              placeholder="Entrez votre courriel"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="control no-margin">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Entrez votre nom d'utilisateur"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="control no-margin">
            <label htmlFor="username">Prénom</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              placeholder="Entrez votre prénom"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="control no-margin">
            <label htmlFor="username">Nom</label>
            <input
              id="last_name"
              type="text"
              name="last_name"
              placeholder="Entrez votre nom"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="control no-margin">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Entrez votre mot de passe"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={changement} className="eye-button" type="button">
                <img
                  src={showPassword ? "fermer.svg" : "ouvert.svg"}
                  className="image"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="button" onClick={registerSubmitHandler}>
            S'inscrire
          </button>
        </div>
        <Link className="muted-link" to="/login">
          Déjà inscrit? Connectez-vous ici
        </Link>
      </div>
    </div>
  );
}
