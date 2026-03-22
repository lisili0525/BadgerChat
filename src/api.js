export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export function authHeaders(token, jsonBody = false) {
  const h = {};
  if (jsonBody) {
    h["Content-Type"] = "application/json";
  }
  if (token) {
    h["Authorization"] = `Token ${token}`;
  }
  return h;
}
