import type { ReactNode } from "react";

interface MobileShellProps {
  children: ReactNode;
  className?: string;
}

/** Full-viewport mobile app shell (replaces Figma phone-frame preview). */
export function MobileShell({ children, className = "" }: MobileShellProps) {
  return (
    <div
      className={`relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background font-sans ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {children}
    </div>
  );
}
