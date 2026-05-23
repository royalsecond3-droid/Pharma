import {
  Activity,
  Brain,
  Building2,
  Pill,
  Shield,
  Stethoscope,
  User,
} from "lucide-react";
import { Link } from "react-router";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

const PORTALS = [
  {
    to: "/patient/login",
    title: "Patient & Caregiver",
    desc: "Medication reminders, SOS emergency, prescriptions, and health history — optimized for mental health & Alzheimer's care.",
    icon: User,
    color: "#1D6FE8",
  },
  {
    to: "/doctor/login",
    title: "Healthcare Provider",
    desc: "Update EHR, issue digital prescriptions, and manage consultations via Fayda ID.",
    icon: Stethoscope,
    color: "#6C63FF",
  },
  {
    to: "/pharmacy/login",
    title: "Pharmacy",
    desc: "Retrieve authorized prescriptions by Fayda number and mark medications as dispensed.",
    icon: Pill,
    color: "#0FB8C3",
  },
  {
    to: "/admin/login",
    title: "Administration",
    desc: "System overview, patient registry, staff accounts, and platform analytics.",
    icon: Shield,
    color: "#0F1B35",
  },
] as const;

export function PortalLanding() {
  return (
    <div className="min-h-dvh bg-background">
      <header
        className="px-6 py-12 text-center text-white md:py-16"
        style={{
          background: "linear-gradient(160deg, #1D6FE8 0%, #6C63FF 50%, #0FB8C3 100%)",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <div className="mb-4 flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            <Brain size={14} />
            Mental Health · Alzheimer&apos;s Care · Fayda ID
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{APP_NAME}</h1>
          <p className="mt-3 max-w-xl text-sm text-white/90 md:text-base">
            {APP_TAGLINE} — connecting patients, doctors, and pharmacies through Fayda National
            ID, with medication schedules, reminders, and patient SOS.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="mb-2 text-center text-lg font-bold text-foreground">
          Choose your portal
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          One ecosystem · Four secure entry points
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
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
              <h3 className="text-base font-bold text-foreground group-hover:text-primary">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </Link>
          ))}
        </div>

        <div
          className="mt-10 rounded-2xl border border-border p-6"
          style={{ background: "#F4F8FF" }}
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Activity size={16} color="#1D6FE8" />
            How it works
          </h3>
          <ol className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <li className="flex gap-2">
              <Building2 size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">Doctor</strong> enters the patient&apos;s
                Fayda ID during consultation to update records and prescribe digitally.
              </span>
            </li>
            <li className="flex gap-2">
              <Pill size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>
                <strong className="text-foreground">Pharmacy</strong> retrieves authorized
                medications using the same Fayda number — no paper scripts.
              </span>
            </li>
            <li className="flex gap-2">
              <User size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">Patient</strong> receives app alerts for
                doses and tracks their full medical history in one place.
              </span>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
