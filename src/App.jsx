import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import RootLayout from './app/layout/RootLayout';
import Home from './pages/Home/Home.jsx';
import Login from './pages/Login/Login.jsx';
import Dev from './pages/Dev/Dev.jsx';
import Register from './pages/Register/Register.jsx';
import AuthContext from "./app/Context/AuthContext";
import ErrorPage from "./app/Error/ErrorPage";
import { useState } from "react";
import GameDetail from "./pages/GameDetail/GameDetail.jsx";

const routerLogin = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/login", element: <Navigate to="/" replace /> },
      { path: "", element: <Home /> },
      { path: "/game/:id", element: <GameDetail /> },
      { path: "/dev", element: <Dev />},
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
      { path: "/game/:id", element: <GameDetail /> }
    ],
  },
]);

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout}}>
      <RouterProvider router={isLoggedIn ? routerLogin : router} />
    </AuthContext.Provider>
  );
};

export default App;
