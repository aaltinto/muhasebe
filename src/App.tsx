import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "./pages/Navbar";
import SearchBar from "./components/Searchbar";
import { useEffect, useState } from "react";
import { LoadingState } from "./components/LoadingState";

function App() {
  const [appReady, setAppReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkBackend = () => {
      if ((window as any).__TAURI_BACKEND_READY__) {
        console.log('Backend ready detected');
        setAppReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkBackend()) return;

    // Poll every 100ms if not ready yet
    const interval = setInterval(() => {
      if (checkBackend()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  if (!appReady) {
    return (
      <div>
        <LoadingState/>
      </div>
    )
  }


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
