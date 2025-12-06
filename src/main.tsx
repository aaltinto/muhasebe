import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import MainPage from "./pages/MainPage";
import Settings from "./pages/Settings";
import Accounts from "./pages/Accounts/Accounts";
import AccountsSum from "./pages/Accounts/AccountsSum";
import Stocks from "./pages/Stocks";
import Reports from "./pages/Reports";
import AccountDetail from "./pages/Accounts/AccountDetail";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<MainPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/accounts" element={<AccountsSum />} />
          <Route path="/accounts/customers" element={<Accounts />} />
          <Route path="/accounts/suppliers" element={<Accounts />} />
          <Route path="/accounts/:type/:id" element={<AccountDetail />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
