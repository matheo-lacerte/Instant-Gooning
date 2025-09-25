import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../app/Context/AuthContext";

export default function Login() {
  const auth = useContext(AuthContext);

  const authSubmitHandler = () => {
    auth.login();
  };

  return (
    <form onSubmit={authSubmitHandler}>
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
