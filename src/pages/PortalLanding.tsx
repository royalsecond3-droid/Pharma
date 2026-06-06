import {
  Activity,
  Brain,
  BookOpen,
  Building2,
  FileText,
  Pill,
  Shield,
  Stethoscope,
  User,
  Video,
} from "lucide-react";
import { Link } from "react-router";
import { APP_NAME, APP_TAGLINE, LOGO_SRC } from "@/lib/brand";

const PORTALS = [
  {
    to: "/patient/login",
    title: "Patient & Caregiver",
    desc: "Subscriptions (Telebirr/CBE/Chapa), Find Care, health insights, SOS, and Fayda-linked records.",
    icon: User,
    color: "#1D6FE8",
  },
  {
    to: "/doctor/login",
    title: "Healthcare Provider",
    desc: "EHR, vitals ingestion, consultation wizard with equipment safety checks, and digital prescriptions.",
    icon: Stethoscope,
    color: "#6C63FF",
  },
  {
    to: "/pharmacy/login",
    title: "Pharmacy",
    desc: "Dispense prescriptions, reservation queue, and vetted directory stock fulfillment.",
    icon: Pill,
    color: "#0FB8C3",
  },
  {
    to: "/admin/login",
    title: "Administration",
    desc: "Aura analytics — ingestion latency, duplicate blocking, regional stock, and safety logs.",
    icon: Shield,
    color: "#0F1B35",
  },
] as const;

const BLOG_NAV_ITEMS = [
  { href: "#blog-all", label: "All" },
  { href: "#blog-videos", label: "Teaching Videos" },
  { href: "#blog-posts", label: "Blog Posts" },
  { href: "#blog-tech", label: "Tech & Updates" },
] as const;

const BLOG_CONTENT = {
  all: [
    "Medication safety basics for caregivers",
    "How to read your digital prescription",
    "Using Find Care to compare pharmacy stock",
  ],
  videos: [
    "Video: How to set reminders in 60 seconds",
    "Video: SOS quick steps for family support",
  ],
  posts: [
    "Post: Understanding dosage, frequency, and timing",
    "Post: 7 mistakes to avoid with long-term medication plans",
  ],
  tech: [
    "Update: New Fayda verification flow",
    "Update: Faster map loading for Find Care",
  ],
} as const;

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
          <img
            src={LOGO_SRC}
            alt={`${APP_NAME} logo`}
            className="mb-4 h-24 w-24 rounded-2xl object-cover shadow-lg"
          />
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

      <section className="border-b border-border bg-white/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <BookOpen size={16} color="#1D6FE8" />
            Blog Navigator
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Blog navigation">
            {BLOG_NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-[rgba(29,111,232,0.18)] px-3 py-1.5 text-xs font-semibold text-[#1D6FE8] no-underline transition hover:bg-[#1D6FE8] hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-8">
        <div className="grid gap-3 md:grid-cols-2">
          <article id="blog-all" className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-bold text-foreground">All Highlights</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {BLOG_CONTENT.all.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article id="blog-videos" className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <Video size={15} color="#1D6FE8" />
              Teaching Videos
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {BLOG_CONTENT.videos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article id="blog-posts" className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <FileText size={15} color="#0FB8C3" />
              Blog Posts
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {BLOG_CONTENT.posts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article id="blog-tech" className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-bold text-foreground">Tech & Updates</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {BLOG_CONTENT.tech.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

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
