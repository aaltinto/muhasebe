import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "./pages/Navbar";
import SearchBar from "./components/Searchbar";

function App() {
  const location = useLocation();
  const getPages = (path: string) => {
    const parts = path.split('/');
    switch (parts[1]) {
      case (""):
        return ("Ana Sayfa");
      case ("accounts"):
        return ("Cari Hesaplar");
      case ("stocks"):
        return ("Stok Takibi");
      case ("reports"):
        return ("Raporlar");
      case ("settings"):
        return ("Ayarlar");
    };
  };
  return (
    <div className="app-container">
      <Navbar />

      <div className="main-content">
        <header className="header">
          <h1>{getPages(location.pathname)}</h1>
          <SearchBar placeholder="Ara..." api="api/search" limit={5} />
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
