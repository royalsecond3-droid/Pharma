import { LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { APP_NAME } from "@/lib/brand";
import type { StaffRole } from "@/types";

interface NavItem {
  to: string;
  label: string;
}

interface WebPortalLayoutProps {
  role: StaffRole;
  title: string;
  subtitle: string;
  nav: NavItem[];
  accent: string;
}

export function WebPortalLayout({
  role,
  title,
  subtitle,
  nav,
  accent,
}: WebPortalLayoutProps) {
  const { staff, logout } = useStaffAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(`/${role}/login`);
  };

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className="flex w-56 shrink-0 flex-col border-r border-border px-4 py-6"
        style={{ background: `linear-gradient(180deg, ${accent}08 0%, transparent 100%)` }}
      >
        <div className="mb-8">
          <div className="text-lg font-bold text-foreground" style={{ color: accent }}>
            {APP_NAME}
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{subtitle}</div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: accent } : undefined
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-2 text-xs font-semibold text-foreground">
            {staff?.fullName}
          </div>
          <div className="mb-3 text-[10px] text-muted-foreground">
            {staff?.facilityName}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
