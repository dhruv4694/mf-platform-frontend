import { createContext, useContext, useState, useCallback } from "react";
import { apiFetch, AuthApi } from "../api/client.js";
import { parseJwt } from "../utils/format.js";

/**
 * AuthContext provides:
 *   token  — the current JWT access token (null if logged out)
 *   user   — { username, role, investorId, distributorId } parsed from the JWT
 *   login  — (username, password) → logs in, stores token, sets user
 *   logout — clears token and user
 *   api    — (path, options) → apiFetch with the current token pre-injected
 *
 * Token and user are persisted in localStorage so they survive page refresh.
 * On reload, the token is read back and the user object is re-parsed from it
 * (not from localStorage directly — the JWT is the source of truth).
 */
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("mf_token"));
  const [user, setUser]   = useState(() => {
    const t = localStorage.getItem("mf_token");
    if (!t) return null;
    return buildUser(t);
  });

  const login = async (username, password) => {
    const data = await AuthApi.login({ username, password });
    const u = buildUser(data.accessToken, username);
    localStorage.setItem("mf_token", data.accessToken);
    setToken(data.accessToken);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("mf_token");
    setToken(null);
    setUser(null);
  };

  // api() is a convenience wrapper that always injects the current token.
  // Components call api("/schemes") instead of apiFetch("/schemes", {}, token).
  const api = useCallback(
    (path, options) => apiFetch(path, options, token),
    [token]
  );

  return (
    <AuthCtx.Provider value={{ token, user, login, logout, api }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUser(token, usernameHint = null) {
  const claims = parseJwt(token);
  return {
    username:       usernameHint || claims.sub,
    role:           claims.role,
    investorId:     claims.investorId   || null,
    distributorId:  claims.distributorId || null,
    userId:         claims.userId        || null,
  };
}
