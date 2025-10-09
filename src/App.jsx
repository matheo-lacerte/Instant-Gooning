import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import RootLayout from "./app/layout/RootLayout";
import Home from "./pages/home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Logout from "./pages/Logout/Logout.jsx";
import Register from "./pages/Register/Register.jsx";
import Dev from "./pages/Dev/Dev.jsx";
import AuthContext from "./app/Context/AuthContext";
import ErrorPage from "./app/Error/ErrorPage";
import { useState } from "react";
import GameDetail from "./pages/GameDetail/GameDetail.jsx";
import { jwtDecode } from "jwt-decode";

const routerLogin = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/login", element: <Navigate to="/" replace /> },
      { path: "", element: <Home /> },
      { path: "/game/:id", element: <GameDetail /> },
      { path: "/dev", element: <Dev /> },
      { path: "/logout", element: <Logout /> },
    ],
  },
]);

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
        return false;
      }
    } catch {
      return false;
    }
    return true;
  });

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      <RouterProvider router={isLoggedIn ? routerLogin : router} />
    </AuthContext.Provider>
  );
};

export default App;
