// Formatting utilities used across the app.

/**
 * Formats a number as Indian Rupees with 2 decimal places.
 * e.g. 50000 → "₹50,000.00"
 */
export function fmt(n) {
  if (n == null) return "—";
  return "₹" + Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats units to 4 decimal places (AMFI standard).
 * e.g. 103.6765432 → "103.6765"
 */
export function fmtUnits(n) {
  if (n == null) return "—";
  return Number(n).toFixed(4);
}

/**
 * Formats a date string to Indian locale.
 * e.g. "2026-07-14T09:00:00Z" → "14/07/2026"
 */
export function fmtDate(s) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN");
}

/**
 * Formats a datetime with time.
 * e.g. "14/07/2026, 09:00"
 */
export function fmtDateTime(s) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Parses a JWT payload without verifying signature.
 * Used client-side to extract role/investorId/distributorId from the access token.
 */
export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return {};
  }
}

/**
 * Returns today's date in YYYY-MM-DD format (for date input defaults).
 */
export function today() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Returns a date N days ago in YYYY-MM-DD format.
 */
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}
