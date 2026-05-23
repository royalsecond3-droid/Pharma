import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api/client";
import type { UserProfile } from "@/types";

const AUTH_STORAGE_KEY = "medicare_patient_session";
const FIN_STORAGE_KEY = "medicare_patient_fin";

interface AuthContextValue {
  isAuthenticated: boolean;
  faydaFin: string | null;
  user: UserProfile | null;
  loginWithFayda: (fin: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function readStoredFin(): string | null {
  try {
    return localStorage.getItem(FIN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredSession);
  const [faydaFin, setFaydaFin] = useState<string | null>(readStoredFin);
  const [user, setUser] = useState<UserProfile | null>(null);

  const refreshUser = useCallback(async () => {
    const fin = readStoredFin();
    if (!fin) return;
    const { user: profile } = await api.getProfile(fin);
    setUser(profile);
  }, []);

  useEffect(() => {
    if (isAuthenticated && faydaFin) {
      refreshUser().catch(() => {
        /* session may be stale */
      });
    }
  }, [isAuthenticated, faydaFin, refreshUser]);

  const loginWithFayda = useCallback(async (fin: string) => {
    const { user: profile } = await api.createSession(fin);
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem(FIN_STORAGE_KEY, fin);
    setFaydaFin(fin);
    setUser(profile);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(FIN_STORAGE_KEY);
    setFaydaFin(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      faydaFin,
      user,
      loginWithFayda,
      logout,
      refreshUser,
    }),
    [isAuthenticated, faydaFin, user, loginWithFayda, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
