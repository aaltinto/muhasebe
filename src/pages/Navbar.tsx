import { Link, useLocation } from "react-router-dom";
import dashboard from "../assets/dashboard.svg";
import settings from "../assets/settings.svg";
import accounts from "../assets/account.svg";
import stocks from "../assets/stocks.svg";
import sales from "../assets/sales.svg";
import reports from "../assets/reports.svg";

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
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              <div className="sidebar-items">
                <img src={dashboard} alt="dashboard" />
                <p>Ana Sayfa</p>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              <div className="sidebar-items">
                <img src={sales} alt="sales" />
                <p>Satış</p>
              </div>
            </Link>
          </li>
          <li className="dropdown">
            <Link
              to="/accounts"
              className={
                location.pathname.startsWith("/accounts") ? "active" : ""
              }
            >
              <div className="sidebar-items">
                <img src={accounts} alt="accounts" />
                <p>Cari Hesaplar</p>
              </div>
            </Link>
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/accounts/customers"
                  className={
                    location.pathname === "/accounts/customers" ? "active" : ""
                  }
                >
                  <p>Müşteriler</p>
                </Link>
              </li>
              <li>
                <Link
                  to="/accounts/suppliers"
                  className={
                    location.pathname === "/accounts/suppliers" ? "active" : ""
                  }
                >
                  <p>Tedarikçiler</p>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              to="/stocks"
              className={location.pathname === "/stocks" ? "active" : ""}
            >
              <div className="sidebar-items">
                <img src={stocks} alt="reports" />
                <p>Stok Takibi</p>
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              className={`${location.pathname === "/reports" ? "active" : ""}`}
            >
              <div className="sidebar-items">
                <img src={reports} alt="reports" />
                <p>Raporlar</p>
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={location.pathname === "/settings" ? "active" : ""}
            >
              <div className="sidebar-items">
                <img src={settings} alt="settings" />
                <p>Ayarlar</p>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
