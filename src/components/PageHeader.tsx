import { ArrowLeft, Bell, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  showBack?: boolean;
  showBell?: boolean;
  showMenu?: boolean;
  rightSlot?: React.ReactNode;
}

export function PageHeader({
  title,
  backTo,
  showBack = true,
  showBell = false,
  showMenu = false,
  rightSlot,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-background/95 px-5 py-4 backdrop-blur-md">
      {showBack ? (
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent"
          aria-label="Go back"
        >
          <ArrowLeft size={22} className="text-foreground" />
        </button>
      ) : (
        <span className="w-9" />
      )}
      <h1 className="text-base font-bold text-foreground">{title}</h1>
      {rightSlot ?? (
        <div className="flex h-9 w-9 items-center justify-center">
          {showBell && <Bell size={20} className="text-foreground" />}
          {showMenu && <MoreVertical size={20} className="text-foreground" />}
          {!showBell && !showMenu && <span className="w-9" />}
        </div>
      )}
    </header>
  );
}
