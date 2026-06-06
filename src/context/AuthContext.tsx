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

const AUTH_STORAGE_KEY = "tanecare_patient_session";
const FIN_STORAGE_KEY = "tanecare_patient_fin";
const TOURIST_ACCOUNTS_KEY = "tanecare_tourist_accounts";
const PROFILE_OVERRIDE_PREFIX = "tanecare_mock_profile_";

type TouristAccount = {
  fullName: string;
  phone: string;
  country: string;
  password: string;
  faydaFin: string;
};

type TouristSignInInput = {
  fullName: string;
  phone: string;
  country: string;
  password: string;
};

interface AuthContextValue {
  isAuthenticated: boolean;
  faydaFin: string | null;
  user: UserProfile | null;
  loginWithFayda: (fin: string) => Promise<void>;
  loginWithTourist: (input: TouristSignInInput) => Promise<void>;
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

function readTouristAccounts(): TouristAccount[] {
  try {
    const raw = localStorage.getItem(TOURIST_ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as TouristAccount[]) : [];
  } catch {
    return [];
  }
}

function writeTouristAccounts(accounts: TouristAccount[]) {
  localStorage.setItem(TOURIST_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function hashToFin(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 1_000_000_000_000;
  }
  return String(hash).padStart(12, "0");
}

function writeTouristProfileOverride(account: TouristAccount) {
  localStorage.setItem(
    `${PROFILE_OVERRIDE_PREFIX}${account.faydaFin}`,
    JSON.stringify({
      fullName: account.fullName,
      phone: account.phone,
      email: null,
      conditionNotes: `Tourist account from ${account.country}`,
    }),
  );
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

  const loginWithTourist = useCallback(async (input: TouristSignInInput) => {
    const phone = normalizePhone(input.phone);
    if (!phone) {
      throw new Error("Enter a valid phone number.");
    }
    if (!input.password.trim()) {
      throw new Error("Enter a password.");
    }
    if (!input.country.trim()) {
      throw new Error("Enter the country you are coming from.");
    }

    const accounts = readTouristAccounts();
    const existing = accounts.find((account) => normalizePhone(account.phone) === phone);

    if (existing) {
      if (existing.password !== input.password) {
        throw new Error("Incorrect password for this tourist account.");
      }
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      localStorage.setItem(FIN_STORAGE_KEY, existing.faydaFin);
      setFaydaFin(existing.faydaFin);
      const { user: profile } = await api.getProfile(existing.faydaFin);
      setUser(profile);
      setIsAuthenticated(true);
      return;
    }

    const account: TouristAccount = {
      fullName: input.fullName.trim() || "Tourist Patient",
      phone: input.phone.trim(),
      country: input.country.trim(),
      password: input.password,
      faydaFin: hashToFin(`${phone}:${input.country.trim().toLowerCase()}`),
    };

    writeTouristAccounts([...accounts, account]);
    writeTouristProfileOverride(account);

    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem(FIN_STORAGE_KEY, account.faydaFin);
    setFaydaFin(account.faydaFin);
    const { user: profile } = await api.getProfile(account.faydaFin);
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
      loginWithTourist,
      logout,
      refreshUser,
    }),
    [isAuthenticated, faydaFin, user, loginWithFayda, loginWithTourist, logout, refreshUser],
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
