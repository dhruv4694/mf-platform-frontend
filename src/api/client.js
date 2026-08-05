// Centralized API client.
// All HTTP calls go through apiFetch — this is the single place where
// the Authorization header, base URL, and error handling are managed.

const BASE = `${import.meta.env.VITE_API_URL || ""}/api/v1`;

/**
 * Makes an authenticated (or unauthenticated) fetch to the Spring Boot API.
 *
 * @param {string} path      - e.g. "/schemes", "/transactions/my?size=20"
 * @param {object} options   - fetch options (method, body, etc.)
 * @param {string|null} token - JWT access token (null for public endpoints)
 * @returns {Promise<any>}   - parsed JSON response
 * @throws {Error}           - with message from API error response
 */
export async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─── Typed API methods ────────────────────────────────────────────────────────
// Each module exposes functions that take a token and return typed data.
// Services use these — no component should call apiFetch directly.

export const AuthApi = {
  login:              (body) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  signupInvestor:     (body) => apiFetch("/auth/signup/investor", { method: "POST", body: JSON.stringify(body) }),
  signupDistributor:  (body) => apiFetch("/auth/signup/distributor", { method: "POST", body: JSON.stringify(body) }),
};

export const SchemeApi = {
  list:   (token, page = 0) => apiFetch(`/schemes?size=50&page=${page}`, {}, token),
  getById:(token, id)       => apiFetch(`/schemes/${id}`, {}, token),
  create: (token, body)     => apiFetch("/schemes", { method: "POST", body: JSON.stringify(body) }, token),
  update: (token, id, body) => apiFetch(`/schemes/${id}`, { method: "PUT", body: JSON.stringify(body) }, token),
};

export const NavApi = {
  getHistory:    (token, schemeId, from, to) => {
    const params = from && to ? `?from=${from}&to=${to}` : "";
    return apiFetch(`/nav/schemes/${schemeId}${params}`, {}, token);
  },
  importSingle:  (token, body) => apiFetch("/nav/import", { method: "POST", body: JSON.stringify(body) }, token),
  simulateBulk:  (token, body) => apiFetch("/nav/simulate-bulk", { method: "POST", body: JSON.stringify(body) }, token),
};

export const FolioApi = {
  list:   (token) => apiFetch("/folios?size=50", {}, token),
  create: (token, body) => apiFetch("/folios", { method: "POST", body: JSON.stringify(body) }, token),
};

export const TransactionApi = {
  listMy:   (token, page = 0) => apiFetch(`/transactions/my?size=20&page=${page}`, {}, token),
  purchase: (token, body)     => apiFetch("/transactions/purchase", { method: "POST", body: JSON.stringify(body) }, token),
  redeem:   (token, body)     => apiFetch("/transactions/redemption", { method: "POST", body: JSON.stringify(body) }, token),
};

export const SipApi = {
  listMy:   (token, page = 0) => apiFetch(`/sip-mandates/my?size=20&page=${page}`, {}, token),
  register: (token, body)     => apiFetch("/sip-mandates", { method: "POST", body: JSON.stringify(body) }, token),
  pause:    (token, id)       => apiFetch(`/sip-mandates/${id}/pause`, { method: "PUT" }, token),
  resume:   (token, id)       => apiFetch(`/sip-mandates/${id}/resume`, { method: "PUT" }, token),
  cancel:   (token, id)       => apiFetch(`/sip-mandates/${id}`, { method: "DELETE" }, token),
};

export const PortfolioApi = {
  getMyPortfolio:      (token)          => apiFetch("/portfolio/me", {}, token),
  getInvestorPortfolio:(token, id)      => apiFetch(`/portfolio/investors/${id}`, {}, token),
  getDistributorBook:  (token, distId)  => {
    const q = distId ? `?distributorId=${distId}` : "";
    return apiFetch(`/portfolio/distributor/book${q}`, {}, token);
  },
  getFolioPortfolio:   (token, folioId) => apiFetch(`/portfolio/folio/${folioId}`, {}, token),
};

export const InvestorApi = {
  list:     (token, page = 0) => apiFetch(`/investors?size=50&page=${page}`, {}, token),
  getMe:    (token)           => apiFetch("/investors/me", {}, token),
};

export const DistributorApi = {
  list:     (token, page = 0) => apiFetch(`/distributors?size=50&page=${page}`, {}, token),
  getMe:    (token)           => apiFetch("/distributors/me", {}, token),
  activate: (token, id)       => apiFetch(`/distributors/${id}/activate`, { method: "PUT" }, token),
  suspend:  (token, id)       => apiFetch(`/distributors/${id}/suspend`, { method: "PUT" }, token),
};

export const AdminApi = {
  getBusinessDate:     (token)       => apiFetch("/admin/business-date", {}, token),
  advanceBusinessDate: (token, date) => apiFetch("/admin/business-date", { method: "PUT", body: JSON.stringify({ date }) }, token),
  runEod:              (token, businessDate) => apiFetch("/admin/eod/run", { method: "POST", body: JSON.stringify({ businessDate }) }, token),
  runSipBatch:         (token)       => apiFetch("/admin/sip/run-batch", { method: "POST" }, token),
};
