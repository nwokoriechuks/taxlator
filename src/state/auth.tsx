import React, { createContext, useContext, useMemo, useState } from "react";
import { api, clearToken, extractToken, getToken, setToken } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { AnyJson, SignInPayload, SignUpPayload } from "../api/types";

type AuthContextValue = {
  authenticated: boolean;
  signin: (payload: SignInPayload) => Promise<AnyJson>;
  signup: (payload: SignUpPayload) => Promise<AnyJson>;
  sendVerificationCode: (payload: { email: string }) => Promise<AnyJson>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean>(() => Boolean(getToken()));

  const value = useMemo<AuthContextValue>(
    () => ({
      authenticated,
      async signin(payload) {
        const { data } = await api.post(ENDPOINTS.signin, payload);

        const token = extractToken(data);
        if (!token) {
          throw new Error("Signin succeeded but token not found in response. Update extractToken().");
        }

        setToken(token);
        setAuthenticated(true);
        return data;
      },
      async signup(payload) {
        const { data } = await api.post(ENDPOINTS.signup, payload);
        return data;
      },
      async sendVerificationCode(payload) {
        const { data } = await api.post(ENDPOINTS.sendVerificationCode, payload);
        return data;
      },
      logout() {
        clearToken();
        setAuthenticated(false);
      }
    }),
    [authenticated]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
