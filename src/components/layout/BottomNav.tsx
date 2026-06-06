import { useLayoutEffect, useRef, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  CircleUserRound,
  Compass,
  Home,
  Pill,
  Siren,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { useLanguage } from "@/context/LanguageContext";
import "@/styles/dynamic-island-nav.css";

type NavIcon = typeof Home;

interface NavItem {
  to: string;
  icon: NavIcon;
  labelKey: string;
  sos?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/patient/home", icon: Home, labelKey: "navHome" },
  { to: "/patient/meds", icon: Pill, labelKey: "navMeds" },
  { to: "/patient/find", icon: Compass, labelKey: "navFind" },
  { to: "/patient/blog", icon: BookOpen, labelKey: "navBlog" },
  { to: "/patient/sos", icon: Siren, labelKey: "navSos", sos: true },
  { to: "/patient/schedule", icon: CalendarClock, labelKey: "navSchedule" },
  { to: "/patient/profile", icon: CircleUserRound, labelKey: "navProfile" },
];

function activeIndexFor(pathname: string): number {
  const i = NAV_ITEMS.findIndex(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
  return i >= 0 ? i : 0;
}

export function BottomNav() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const activeIndex = activeIndexFor(pathname);
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [bubble, setBubble] = useState({ left: 0, width: 56 });
  const sosActive = NAV_ITEMS[activeIndex]?.sos;

  const measure = () => {
    const nav = navRef.current;
    const tab = tabRefs.current[activeIndex];
    if (!nav || !tab) return;
    const navBox = nav.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    setBubble({
      left: tabBox.left - navBox.left,
      width: tabBox.width,
    });
  };

  useLayoutEffect(() => {
    measure();
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [activeIndex, pathname]);

  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2">
      <nav
        ref={navRef}
        className="dynamic-island-nav pointer-events-auto relative w-full overflow-hidden border-t border-border bg-card/95 px-1 pt-2 shadow-[0_-8px_32px_rgba(29,111,232,0.12)] backdrop-blur-xl"
        style={{
          paddingBottom: "max(10px, env(safe-area-inset-bottom))",
          borderTopLeftRadius: "18px",
          borderTopRightRadius: "22px",
        }}
        aria-label="Main navigation"
      >
        <div
          className={`dynamic-island-bubble absolute top-1.5 h-[calc(100%-0.75rem)] ${
            sosActive ? "dynamic-island-bubble--sos" : ""
          }`}
          style={{
            left: bubble.left,
            width: bubble.width,
          }}
          aria-hidden
        />

        <div className="relative flex w-full items-end">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                to={item.to}
                aria-label={t(item.labelKey)}
                aria-current={isActive ? "page" : undefined}
                className={`dynamic-island-link relative z-[1] flex flex-1 flex-col items-center justify-center px-0.5 py-2 no-underline ${
                  item.sos ? "dynamic-island-tab--sos -mt-3" : ""
                } ${
                  isActive
                    ? "is-active text-primary"
                    : item.sos
                      ? "text-destructive/75"
                      : "text-muted-foreground"
                }`}
              >
                {item.sos ? (
                  <span
                    className={`dynamic-island-sos-btn mb-0.5 flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "h-[46px] w-[46px] bg-destructive text-destructive-foreground shadow-[0_4px_16px_rgba(229,62,62,0.45)]"
                        : "h-[40px] w-[40px] border-2 border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                    style={{ borderRadius: "13px 13px 9px 9px" }}
                  >
                    <Icon size={isActive ? 24 : 20} strokeWidth={2.5} />
                  </span>
                ) : (
                  <Icon
                    size={isActive ? 24 : 21}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="shrink-0 transition-all duration-300"
                  />
                )}
                <span
                  className={`dynamic-island-label mt-0.5 truncate text-[9px] font-semibold ${
                    isActive
                      ? item.sos
                        ? "text-destructive"
                        : "text-primary"
                      : "text-transparent"
                  }`}
                >
                  {t(item.labelKey)}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
