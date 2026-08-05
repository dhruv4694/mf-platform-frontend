import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Sidebar } from "./components/layout/Sidebar.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { SchemesPage } from "./pages/SchemesPage.jsx";
import { FoliosPage } from "./pages/FoliosPage.jsx";
import { TransactionsPage } from "./pages/TransactionsPage.jsx";
import { SipPage, PortfolioPage, ClientsPage, NavPage, InvestorsPage, DistributorsPage } from "./pages/OtherPages.jsx";
import { AdminPage } from "./pages/AdminPage.jsx";
import { GLOBAL_STYLE } from "./tokens.js";

// ─── Page registry ────────────────────────────────────────────────────────────
const PAGES = {
  dashboard:    <DashboardPage />,
  portfolio:    <PortfolioPage />,
  schemes:      <SchemesPage />,
  folios:       <FoliosPage />,
  transactions: <TransactionsPage />,
  sip:          <SipPage />,
  clients:      <ClientsPage />,
  nav:          <NavPage />,
  investors:    <InvestorsPage />,
  distributors: <DistributorsPage />,
  admin:        <AdminPage />,
};

// ─── App shell ────────────────────────────────────────────────────────────────
function AppShell() {
  const [page, setPage] = useState("dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{
        marginLeft: 240, flex: 1,
        padding: "36px 48px",
        maxWidth: 1140,
        animation: "fadeIn .2s ease",
      }}>
        {PAGES[page] || <div>Page not found.</div>}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function App() {
  const { user } = useAuth();
  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      {user ? <AppShell /> : <LoginPage />}
    </>
  );
}

export function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
