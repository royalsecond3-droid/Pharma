import { Link, useLocation } from "react-router";
import { AlertTriangle } from "lucide-react";

export function SosFab() {
  const { pathname } = useLocation();
  if (pathname === "/patient/sos") return null;

  return (
    <Link
      to="/patient/sos"
      aria-label="SOS Emergency"
      className="fixed z-30 flex items-center justify-center no-underline"
      style={{
        right: 16,
        bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "linear-gradient(145deg, #E53E3E 0%, #C53030 100%)",
        color: "#fff",
        boxShadow: "0 6px 24px rgba(229,62,62,0.5)",
        border: "3px solid #fff",
      }}
    >
      <AlertTriangle size={26} strokeWidth={2.5} />
    </Link>
  );
}
