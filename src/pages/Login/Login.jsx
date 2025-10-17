import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../app/Context/AuthContext";
import { Link } from "react-router-dom";
import "./login.css";

export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const authSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      email: email.trim(),
      password: password.trim(),
    };

    try {
      const response = await fetch("http://localhost:5174/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let msg = "Données invalides";
        const errorData = await response.json();
        if (errorData?.error) {
          msg = errorData.error;
          setError(msg);
        }
      }

      const responseData = await response.json();

      auth.login(responseData.token, responseData.user);
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      if (!error.message) setError("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const changementImage = () => {
    const image = document.querySelector(".image");
    const password = document.getElementById("password");

    if (image.src.includes("ouvert.svg")) {
      image.src = "fermer.svg";
      password.type = "text";
    } else {
      image.src = "ouvert.svg";
      password.type = "password";
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" onSubmit={authSubmitHandler}>
        <h1>Connexion</h1>

        <div className="control-row">
          <div className="control no-margin">
            <label htmlFor="email">Courriel</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Entrez votre courriel"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="control no-margin">
            <label htmlFor="password">Mot de passe</label>
            <div className="password-container">
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Entrez votre mot de passe"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
              <button onClick={changementImage} className="eye-button" type="button">
                <img src="ouvert.svg" className="image"/>
              </button>
            </div>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <p className="form-actions">
          <button className="button" disabled={submitting} onClick={authSubmitHandler}>
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </p>

        <Link className="muted-link" to="/register">
          Aucun compte? Inscrivez-vous ici
        </Link>
      </div>
    </div>
  );
}