import { Routes, Route } from 'react-router-dom';
import RootLayout from './app/layout/RootLayout';
import Home from './pages/Home/Home.jsx';




export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
}
