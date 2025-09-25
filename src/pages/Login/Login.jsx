import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../app/Context/AuthContext";

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
    <form onSubmit={authSubmitHandler}>
      <h1>Connexion</h1>

      <div className="control-row">
        <div className="control no-margin">
          <label htmlFor="email">Courriel</label>
          <input
            id="email"
            type="text"
            name="email"
            placeholder="Entrez votre courriel"
            required
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
          />
        </div>
      </div>

      <p className="form-actions">
        <button className="button">Se connecter</button>
      </p>

      <Link to="/register">Vous ne possedez pas de compte? Inscrivez-vous ici</Link>
    </form>
  );
}
