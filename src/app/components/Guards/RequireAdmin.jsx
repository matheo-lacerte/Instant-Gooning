import ErrorPage from "../../Error/ErrorPage";

export default function RequireAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || user.role !== "admin") return <ErrorPage />;

  return children;
}