import axios from "axios";
import { API_BASE } from "./endpoints";

export const TOKEN_STORAGE_KEY = "taxlator_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function extractToken(upstreamJson: any): string | null {
  if (!upstreamJson || typeof upstreamJson !== "object") return null;

  const token =
    upstreamJson.token ||
    upstreamJson.accessToken ||
    upstreamJson.jwt ||
    upstreamJson?.data?.token ||
    upstreamJson?.data?.accessToken ||
    upstreamJson?.data?.jwt;

  return typeof token === "string" ? token : null;
}

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
