import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api/truckngoClient";
import { RESIDENT_ID_KEY, SESSION_KEY } from "@/data/truckngoStore";
import type { ResidentProfile } from "@/types/truckngo";

type RegisterInput = {
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  zone: string;
  neighborhood: string;
  address: string;
};

interface AuthContextValue {
  isAuthenticated: boolean;
  residentId: string | null;
  user: ResidentProfile | null;
  login: (residentId: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function readStoredId(): string | null {
  try {
    return localStorage.getItem(RESIDENT_ID_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredSession);
  const [residentId, setResidentId] = useState<string | null>(readStoredId);
  const [user, setUser] = useState<ResidentProfile | null>(null);

  const refreshUser = useCallback(async () => {
    const id = readStoredId();
    if (!id) return;
    const { user: profile } = await api.getProfile(id);
    setUser(profile);
  }, []);

  useEffect(() => {
    if (isAuthenticated && residentId) {
      refreshUser().catch(() => {});
    }
  }, [isAuthenticated, residentId, refreshUser]);

  const login = useCallback(async (id: string) => {
    const { user: profile } = await api.createSession(id);
    localStorage.setItem(SESSION_KEY, "true");
    localStorage.setItem(RESIDENT_ID_KEY, id);
    setResidentId(id);
    setUser(profile);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user: profile } = await api.registerResident(input);
    localStorage.setItem(SESSION_KEY, "true");
    localStorage.setItem(RESIDENT_ID_KEY, profile.residentId);
    setResidentId(profile.residentId);
    setUser(profile);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(RESIDENT_ID_KEY);
    setResidentId(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      residentId,
      user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isAuthenticated, residentId, user, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
