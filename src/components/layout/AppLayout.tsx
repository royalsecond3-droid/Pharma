import { Outlet } from "react-router";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileShell } from "@/components/layout/MobileShell";

export function AppLayout() {
  return (
    <MobileShell className="flex flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pb-[5.5rem]">
        <Outlet />
      </div>
      <BottomNav />
    </MobileShell>
  );
}
