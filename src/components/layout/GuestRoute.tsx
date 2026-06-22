import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";

/** Redirect authenticated users away from login/signup. */
export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/resident/home" replace />;
  }

  return <Outlet />;
}
