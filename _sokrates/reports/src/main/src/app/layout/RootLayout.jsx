import { Outlet } from "react-router-dom";
import Navigation from "../../pages/Navigation/Navigation.jsx";

export default function RootLayout() {
  return (
    <>
    <Navigation />
      <main>
        <Outlet />
      </main>
    </>
  );
}
