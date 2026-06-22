import { Recycle, Shield, Truck, User } from "lucide-react";
import { Link } from "react-router";
import { APP_NAME, APP_TAGLINE, CITY_SRC, LOGO_SRC } from "@/lib/brand";

const PORTALS = [
  {
    to: "/resident/login",
    title: "Residents",
    desc: "Track collection trucks, sort waste, earn rewards, and manage your sustainability wallet.",
    icon: User,
    color: "#1B5E20",
  },
  {
    to: "/driver/login",
    title: "Collection Drivers",
    desc: "Execute daily routes, update GPS, mark collections complete, and view performance scores.",
    icon: Truck,
    color: "#2E7D32",
  },
  {
    to: "/admin/login",
    title: "Municipal Admin",
    desc: "Manage zones, fleet, residents, drivers, rewards, and city-wide analytics.",
    icon: Shield,
    color: "#0F172A",
  },
] as const;

export function PortalLanding() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="px-6 py-10 text-center">
        <img src={LOGO_SRC} alt={APP_NAME} className="mx-auto h-20 w-auto object-contain" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Smarter Waste Management for{" "}
          <span className="text-primary">Cleaner Cities</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          {APP_TAGLINE}
        </p>
      </header>

      <div className="mx-auto max-w-lg px-6">
        <img src={CITY_SRC} alt="TRUCKNGO city" className="w-full object-contain" />
      </div>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-4 flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-primary">
          <Recycle size={14} />
          Smart Waste · Live Tracking · Rewards
        </div>

        <h2 className="mb-2 text-center text-lg font-bold text-foreground">Choose your portal</h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Residents · Drivers · Municipal operators
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {PORTALS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="group rounded-2xl border border-border bg-card p-6 no-underline shadow-sm transition hover:shadow-md"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${p.color}18` }}
              >
                <p.icon size={24} color={p.color} />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-primary">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
