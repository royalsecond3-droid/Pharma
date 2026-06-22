import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api/truckngoClient";
import type { StaffProfile, StaffRole } from "@/types/truckngo";

const STORAGE_KEY = "truckngo_staff_session";

interface StaffAuthContextValue {
  staff: StaffProfile | null;
  isStaffAuthenticated: boolean;
  login: (email: string, password: string, role: StaffRole) => Promise<void>;
  loginDemo: (role: StaffRole) => Promise<void>;
  logout: () => void;
}

const StaffAuthContext = createContext<StaffAuthContextValue | null>(null);

function readStored(): StaffProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StaffProfile) : null;
  } catch {
    return null;
  }
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffProfile | null>(readStored);

  const persistStaff = useCallback((profile: StaffProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setStaff(profile);
  }, []);

  const login = useCallback(
    async (email: string, password: string, role: StaffRole) => {
      const { staff: profile } = await api.staffLogin(email, password, role);
      persistStaff(profile);
    },
    [persistStaff],
  );

  const loginDemo = useCallback(
    async (role: StaffRole) => {
      const { staff: profile } = await api.staffLoginDemo(role);
      persistStaff(profile);
    },
    [persistStaff],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStaff(null);
  }, []);

  const value = useMemo(
    () => ({
      staff,
      isStaffAuthenticated: !!staff,
      login,
      loginDemo,
      logout,
    }),
    [staff, login, loginDemo, logout],
  );

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be used within StaffAuthProvider");
  return ctx;
}
