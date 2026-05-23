import { Outlet } from "react-router";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileShell } from "@/components/layout/MobileShell";
import { SosFab } from "@/components/sos/SosFab";

export function AppLayout() {
  return (
    <MobileShell className="flex flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <SosFab />
      <BottomNav />
    </MobileShell>
  );
}
