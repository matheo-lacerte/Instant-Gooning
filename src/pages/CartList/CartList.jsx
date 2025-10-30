import { Link, } from "react-router-dom";
import { useEffect, useState } from "react";
import "./CartList.css";

export default function CreateGame() {
  const token = localStorage.getItem("token");
  const [cartItems, setCartItems] = useState([]);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reponse = await fetch("http://localhost:5174/api/payments/cart", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const checkData = await reponse.json();
        if (reponse.ok) {
          setCartItems(checkData.items);
          const total = checkData.items.reduce(
            (acc, item) => acc + (item.game.discounted_price || 0),
            0
          );
          setPrice(Number(total.toFixed(2)));
        } else {
          console.error(reponse.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const deleteFromCart = async (gameId) => {
    try {
      const response = await fetch(
        `http://localhost:5174/api/payments/cart/items/${gameId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const updatedCart = cartItems.filter((item) => item.id !== gameId);
        setCartItems(updatedCart);
        const total = updatedCart.reduce(
          (acc, item) => acc + (item.game.discounted_price || 0),
          0
        );
        setPrice(Number(total.toFixed(2)));
      } else {
        console.error(response.error || "Erreur lors du fetch du panier");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  return (
    <div className="dev">
      <div className="rangee">
        <div className="colonnes">
          <ul>
            <li>
              <h1>
                <Link to="/profile">Profil</Link>
              </h1>
            </li>
            <li>
              <h1>
                <Link to="/dev">Développeur</Link>
              </h1>
            </li>
            <li>
              <h1>
                <Link to="/cartList">Panier</Link>
              </h1>
            </li>
          </ul>
        </div>

        <div className="colonnes">
          <h2>Liste des jeux dans le panier :</h2>
          {cartItems.length === 0 ? (
            <p>Votre panier est vide.</p>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.id}>
                  <h1>
                    {item.game.title} - {item.game.discounted_price} $
                  </h1>
                  <button
                    className="cart-button"
                    onClick={() => deleteFromCart(item.id)}
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
          <h2>Prix: {price}$</h2>
          <button className="cart-button">Payer</button>
        </div>
      </div>

      <Link to="/logout" className="button_dev">
        Déconnexion
      </Link>
    </div>
  );
}
