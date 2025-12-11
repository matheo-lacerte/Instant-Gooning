import React from "react";
import { Link } from "react-router-dom";
export default function NavProfile() {
  return (
    <div className="colonnes">
      <ul>
        <li>
          <h1>
            <Link to="/profile">Profil</Link>
          </h1>
        </li>
        <li>
          <h1>
            <Link to="/profile/purchases">Mes achats</Link>
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
  );
}
