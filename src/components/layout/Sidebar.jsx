import { T } from "../../tokens.js";
import { Btn } from "../ui/index.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_ITEMS = {
  INVESTOR: [
    { id: "dashboard",    label: "Dashboard",    icon: "◈" },
    { id: "portfolio",    label: "Portfolio",    icon: "◉" },
    { id: "schemes",      label: "Schemes",      icon: "◎" },
    { id: "transactions", label: "Transactions", icon: "⇄" },
    { id: "sip",          label: "SIP Mandates", icon: "↺" },
    { id: "folios",       label: "My Folios",    icon: "▣" },
  ],
  DISTRIBUTOR: [
    { id: "dashboard",    label: "Dashboard",    icon: "◈" },
    { id: "clients",      label: "My Clients",   icon: "◉" },
    { id: "schemes",      label: "Schemes",      icon: "◎" },
    { id: "transactions", label: "Transactions", icon: "⇄" },
  ],
  ADMIN: [
    { id: "dashboard",    label: "Dashboard",    icon: "◈" },
    { id: "schemes",      label: "Schemes",      icon: "◎" },
    { id: "investors",    label: "Investors",    icon: "◉" },
    { id: "distributors", label: "Distributors", icon: "◎" },
    { id: "nav",          label: "Import NAV",   icon: "↑" },
    { id: "transactions", label: "Transactions", icon: "⇄" },
    { id: "admin",        label: "Admin",        icon: "⚙" },
  ],
};

export function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS[user?.role] || [];

  return (
    <div style={{
      width: 240, minHeight: "100vh",
      background: T.navy,
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${T.navyMid}` }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.white, letterSpacing: "-.01em" }}>
          MF Platform
        </div>
        <div style={{ fontSize: 12, color: T.slateL, marginTop: 3 }}>
          {user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase() || ""}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: "flex", alignItems: "center", gap: 12,
              width: "100%", padding: "10px 12px",
              borderRadius: 6, // content-level radius, not sidebar chrome
              background: active ? T.navyMid : "transparent",
              color: active ? T.white : T.slateL,
              fontSize: 14, fontWeight: active ? 600 : 400,
              border: "none", cursor: "pointer", textAlign: "left",
              transition: "background .15s, color .15s",
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.05)"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User / sign out */}
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.navyMid}` }}>
        <div style={{ fontSize: 12, color: T.slateL, marginBottom: 10, fontWeight: 500 }}>
          {user?.username}
        </div>
        <button onClick={logout} style={{
          width: "100%", padding: "7px 0", borderRadius: 6,
          background: "transparent", border: `1px solid rgba(255,255,255,.12)`,
          color: T.slateL, fontSize: 13, cursor: "pointer",
          transition: "background .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
