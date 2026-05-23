import { Navigate, Outlet } from "react-router";
import { useStaffAuth } from "@/context/StaffAuthContext";
import type { StaffRole } from "@/types";

export function StaffRoute({ role }: { role: StaffRole }) {
  const { staff, isStaffAuthenticated } = useStaffAuth();

  if (!isStaffAuthenticated || staff?.role !== role) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  return <Outlet />;
}

export function StaffGuestRoute({ role }: { role: StaffRole }) {
  const { staff, isStaffAuthenticated } = useStaffAuth();

  if (isStaffAuthenticated && staff?.role === role) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <Outlet />;
}
