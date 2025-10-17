import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import RootLayout from "./app/layout/RootLayout";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Logout from "./pages/Logout/Logout.jsx";
import Register from "./pages/Register/Register.jsx";
import Dev from "./pages/Dev/Dev.jsx";
import AuthContext from "./app/Context/AuthContext";
import ErrorPage from "./app/Error/ErrorPage";
import { useState } from "react";
import GameDetail from "./pages/GameDetail/GameDetail.jsx";
import Admin from "./pages/Admin/Admin.jsx";
import RequireAdmin from "./app/components/Guards/RequireAdmin.jsx";
import { jwtDecode } from "jwt-decode";

// Router pour NON-connectés (inchangé)
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/game/:id", element: <GameDetail /> },
    ],
  },
]);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const { exp } = jwtDecode(token);
      if (!(exp * 1000 > Date.now())) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      }
    } catch {
      return false;
    }
    return true;
  });

  // On lit l'utilisateur (et son rôle) depuis le localStorage.
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  // IMPORTANT: login accepte (token, user) pour stocker le rôle
  const login = (token, userObj) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userObj || null));
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  // Routes disponibles quand on est connecté
  const loggedInChildren = [
    { path: "/login", element: <Navigate to="/" replace /> },
    { path: "", element: <Home /> },
    { path: "/game/:id", element: <GameDetail /> },
    { path: "/dev", element: <Dev /> },
    { path: "/logout", element: <Logout /> },
  ];

  // On n'ajoute /admin QUE si l'utilisateur est admin
  if (user?.role === "admin") {
    // RequireAdmin est optionnel ici (la route n’existe pas pour les non-admins),
    // mais on le garde en garde supplémentaire.
    loggedInChildren.push({
      path: "/admin",
      element: (
        <RequireAdmin>
          <Admin />
        </RequireAdmin>
      ),
    });
  }

  // Router pour connectés (construit dynamiquement selon le rôle)
  const routerLoginLocal = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: loggedInChildren,
    },
  ]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      <RouterProvider router={isLoggedIn ? routerLoginLocal : router} />
    </AuthContext.Provider>
  );
};

export default App;