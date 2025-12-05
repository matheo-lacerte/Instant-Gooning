import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EditProfile() {
  const navigate = useNavigate();
  const [userParse, setUserParse] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  const [username, setUsername] = useState(userParse.username || "");
  const [first, setFirst] = useState(userParse.first_name || "");
  const [last, setLast] = useState(userParse.last_name || "");
  const [email, setEmail] = useState(userParse.email || "");
  const token = localStorage.getItem("token");

  const backProfile = () => {
    navigate("/profile");
  };

  const sauvegarde = async () => {
    try {
      const response = await fetch("/api/user/changeUserProfile", {
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
      });

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
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <>
      <h1>Modification du compte</h1>

      <div className="control">
        <label htmlFor="username">Nom d'utilisateur</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="control">
        <label htmlFor="firstName">Prénom</label>
        <input
          type="text"
          id="firstName"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
        />
      </div>

      <div className="control">
        <label htmlFor="lastName">Nom</label>
        <input
          type="text"
          id="lastName"
          value={last}
          onChange={(e) => setLast(e.target.value)}
        />
      </div>

      <div className="control">
        <label htmlFor="email">Adresse courriel</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="row-bottom">
        <button className="edit-button save" onClick={sauvegarde}>
          Sauvegarder
        </button>
        <button className="edit-button cancel" onClick={backProfile}>
          Annuler
        </button>
      </div>
    </>
  );
}
