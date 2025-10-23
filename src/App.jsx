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
import Search from "./pages/Search/Search.jsx";

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
      { path: "/search", element: <Search /> },
    ],
  },
]);

const App = () => {
  const [search, setSearch] = useState("");
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

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user || null));
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  const loggedInChildren = [
    { path: "/login", element: <Navigate to="/" replace /> },
    { path: "", element: <Home /> },
    { path: "/game/:id", element: <GameDetail /> },
    { path: "/dev", element: <Dev /> },
    { path: "/logout", element: <Logout /> },
    { path: "/search", element: <Search /> },
  ];

  if (user?.role === "admin") {
    loggedInChildren.push({
      path: "/admin",
      element: (
        <RequireAdmin>
          <Admin />
        </RequireAdmin>
      ),
    });
  }

  const routerLoginLocal = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <ErrorPage />,
      children: loggedInChildren,
    },
  ]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, search, setSearch }}>
      <RouterProvider router={isLoggedIn ? routerLoginLocal : router} />
    </AuthContext.Provider>
  );
};

export default App;
