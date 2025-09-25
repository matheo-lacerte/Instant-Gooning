import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../app/Context/AuthContext";
import "./login.css";

export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const authSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Échec de la connexion");
      }

      const data = await res.json();

      // Pass whatever your AuthContext expects (token/user/etc.)
      auth.login?.(data);

      navigate("/");
    } catch (e) {
      setError(e.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
    <form className="login-card" onSubmit={authSubmitHandler}>
      <h1>Connexion</h1>

      <div className="control-row">
        <div className="control no-margin">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Entrez votre nom"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="control no-margin">
          <label htmlFor="password">Mot de passe</label>
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
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <p className="form-actions">
        <button className="button" disabled={submitting}>
          {submitting ? "Connexion..." : "Se connecter"}
        </button>
      </p>

      <Link className="muted-link" to="/register">Vous ne possedez pas de compte? Inscrivez-vous ici</Link>
    </form>
    </div>
  );
}
