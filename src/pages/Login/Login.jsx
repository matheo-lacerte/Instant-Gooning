
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../app/Context/AuthContext";
import { Link } from "react-router-dom";


export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();


  const authSubmitHandler = async (event)  => {
    event.preventDefault();

    const fd = new FormData(event.target);
    const data = Object.fromEntries(fd.entries());
    const email = data.email.trim();
    const password = data.password.trim();

    try{
      const response = await fetch("http://localhost:5174/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        throw new Error("Données invalides");
      }
      const responseData = await response.json();
      auth.login(responseData.token);
      alert(responseData.message);
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
    }
  };
  
  return (
    <div className="login-page">
    <form className="login-card" onSubmit={authSubmitHandler}>
      <h1>Connexion</h1>

      <div className="control-row">
        <div className="control no-margin">
          <label htmlFor="username">Courriel</label>
          <input
            id="email"
            type="text"
            name="email"
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

      <Link to="/register">Aucun compte? Inscrivez-vous ici</Link>

    </form>
    </div>
  );
}
