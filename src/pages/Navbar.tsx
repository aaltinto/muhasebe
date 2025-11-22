import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link 
              to="/" 
              className={location.pathname === "/" ? "active" : ""}
            >
              Ana Sayfa
            </Link>
          </li>
          <li className="dropdown">
            <Link 
              to="/accounts" 
              className={location.pathname.startsWith("/accounts") ? "active" : ""}
            >
              Cari Hesaplar
            </Link>
            <ul className="dropdown-menu">
              <li>
                <Link 
                  to="/accounts/customers" 
                  className={location.pathname === "/accounts/customers" ? "active" : ""}
                >
                  Müşteriler
                </Link>
              </li>
              <li>
                <Link 
                  to="/accounts/suppliers" 
                  className={location.pathname === "/accounts/suppliers" ? "active" : ""}
                >
                  Tedarikçiler
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link 
              to="/stocks" 
              className={location.pathname === "/stocks" ? "active" : ""}
            >
              Stok Takibi
            </Link>
          </li>
          <li>
            <Link 
              to="/reports" 
              className={location.pathname === "/reports" ? "active" : ""}
            >
              Raporlar
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              className={location.pathname === "/settings" ? "active" : ""}
            >
              Ayarlar
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}