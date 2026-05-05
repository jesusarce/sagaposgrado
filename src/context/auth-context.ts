import { createContext } from "react";
import type { AuthUser } from "../types/auth/auth.types";
import type { LoginRequest } from "../types/auth/auth.types";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
