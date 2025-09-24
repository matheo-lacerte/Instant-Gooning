import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const registerSubmitHandler = async (event) => {
    event.preventDefault();

    const fd = new FormData(event.target);
    const data = Object.fromEntries(fd.entries());
    const username = data.username.trim();
    const password = data.password.trim();
    const email = data.email.trim();
    const first_name = data.first_name.trim();
    const last_name = data.last_name.trim();

    try {
      const response = await fetch("http://localhost:5174/api/auth/register", {
        method: "POST",
        headers: {  "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, first_name, last_name }),
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

  return (
    <form onSubmit={registerSubmitHandler}>
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
