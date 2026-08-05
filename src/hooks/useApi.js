import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * useApi — data fetching hook with loading, error, and refresh support.
 *
 * Usage:
 *   const { data, loading, error, refresh } = useApi("/schemes?size=50");
 *
 * The fn argument is a function that takes the api() helper and returns a Promise.
 * This allows passing API module methods:
 *   const { data } = useApi(api => SchemeApi.list(token, 0)); // ← advanced
 *
 * Simple path-based usage (most common):
 *   const { data, loading } = useApi("/folios?size=50");
 *
 * @param {string|null} path - API path to fetch (null = don't fetch yet)
 * @param {any[]} deps       - extra deps that trigger a refetch
 */
export function useApi(path, deps = []) {
  const { api } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError]     = useState(null);

  const fetch = useCallback(() => {
    if (!path) return;
    setLoading(true);
    setError(null);
    api(path)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [path, ...deps]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

/**
 * useMutation — for POST/PUT/DELETE operations.
 * Returns { mutate, loading, error, reset }.
 *
 * Usage:
 *   const { mutate, loading, error } = useMutation();
 *   const handleSubmit = async () => {
 *     try {
 *       const result = await mutate(api => api("/schemes", { method: "POST", body }));
 *       onSuccess(result);
 *     } catch (e) { /* error is already set *\/ }
 *   };
 */
export function useMutation() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const reset = () => setError(null);

  const mutate = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(api);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return { mutate, loading, error, reset };
}
