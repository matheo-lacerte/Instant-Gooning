import { Navigate } from "react-router-dom";

export default function RequireDev({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Si l'utilisateur n'est pas 'dev', on le redirige proprement vers l'accueil
  if (!user || user.role !== "dev") {
    return (
      <Navigate
        to="/"
        replace
        state={{ reason: "not-dev", from: window?.location?.pathname || "/dev" }}
      />
    );
  }

  return children;
}
