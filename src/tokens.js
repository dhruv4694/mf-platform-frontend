// Design tokens — single source of truth.
// Every color, radius, and shadow derives from here.
// Import this in any component that needs styling.

export const T = {
  // Core palette
  navy:     "#0F172A",
  navyMid:  "#1E293B",
  slate:    "#64748B",
  slateL:   "#94A3B8",
  bg:       "#F8FAFC",
  white:    "#FFFFFF",

  // Semantic
  emerald:  "#10B981",
  emeraldL: "#D1FAE5",
  rose:     "#F43F5E",
  roseL:    "#FFE4E6",
  gold:     "#F59E0B",
  goldL:    "#FEF3C7",
  indigo:   "#6366F1",
  indigoL:  "#E0E7FF",

  // Structural
  border:   "#E2E8F0",
  text:     "#0F172A",
  textSub:  "#64748B",

  // Radii
  radiusCard: 12,
  radiusBtn:  8,
  radiusInput: 8,
  radiusBadge: 99,
  radiusSidebar: 0, // sharp — structural chrome
};

// Global CSS injected once at root
export const GLOBAL_STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: ${T.bg};
    color: ${T.text};
    -webkit-font-smoothing: antialiased;
  }
  button { font-family: inherit; cursor: pointer; border: none; }
  input, select, textarea { font-family: inherit; }
  a { text-decoration: none; color: inherit; }
  table { border-collapse: collapse; width: 100%; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
`;

// Semantic status → badge colour mapping
export function statusColor(s) {
  const map = {
    ACTIVE:                "green",
    ALLOTTED:              "green",
    REALIZED:              "green",
    PENDING:               "gold",
    PAYMENT_REALIZED:      "gold",
    NAV_APPLIED:           "gold",
    ALLOTMENT_IN_PROGRESS: "gold",
    PENDING_VERIFICATION:  "gold",
    FAILED:                "red",
    REJECTED:              "red",
    SUSPENDED:             "red",
    REVERSED:              "red",
    CANCELLED:             "slate",
    COMPLETED:             "slate",
    PAUSED:                "slate",
  };
  return map[s] || "slate";
}
