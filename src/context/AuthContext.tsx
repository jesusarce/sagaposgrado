import { useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "../types/auth/auth.types";
import type { LoginRequest } from "../types/auth/auth.types";
import { AuthContext } from "./auth-context";
import { login as loginService, logout as logoutService, me as meService } from "../services/auth.service";
import { getToken, setToken, removeToken } from "../utils/token.utils";

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = getToken();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(storedToken);
  const [isLoading, setIsLoading] = useState(!!storedToken);

  // Restore auth state and user profile from localStorage on mount
  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setIsLoading(true);
      meService()
        .then(setUser)
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, []);

  async function login(credentials: LoginRequest): Promise<void> {
    setIsLoading(true);
    try {
      const response = await loginService(credentials);
      setToken(response.access_token);
      setTokenState(response.access_token);
      // Fetch user profile after login
      try {
        const profile = await meService();
        setUser(profile);
      } catch {
        // me() endpoint may not exist yet — login still succeeds
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function logout(): Promise<void> {
    setIsLoading(true);
    try {
      await logoutService();
    } catch {
      // Ignore logout errors — clear state regardless
    } finally {
      removeToken();
      setTokenState(null);
      setUser(null);
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
