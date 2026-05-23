import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/patient/login" replace />;
  }

  return <Outlet />;
}
