import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const authSubmitHandler = () => {
    navigate("/login");
  };

  return (
    <form onSubmit={authSubmitHandler}>
      <h1>Inscription</h1>

      <div className="control-row">
        <div className="control no-margin">
          <label htmlFor="username">Courriel</label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Entrez votre courriel"
            required
          />
        </div>

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

      <div className="form-actions">
        <button className="button">S'inscrire</button>
      </div>
      <Link to="/login">Déjà inscrit? Connectez-vous ici</Link>
    </form>
  );
}
