# Tane Care — Fayda Digital Health Platform

Secure healthcare ecosystem for **mental health & Alzheimer's care**, built on Ethiopia's **Fayda National Digital ID**. Connects patients, doctors, pharmacies, and administrators in one web platform.

**Patient app:** medications, doctor-prescribed schedule with alarms, profile (Fayda FIN), and **SOS emergency** (hold-to-alert caregiver — demo mode).

## Portals

| Portal | URL | Demo login |
|--------|-----|------------|
| **Landing** | http://localhost:5173/ | — |
| **Patient** | `/patient/login` | Fayda FIN (12+ digits) |
| **Doctor** | `/doctor/login` | `doctor@tanecare.et` / `doctor123` |
| **Pharmacy** | `/pharmacy/login` | `pharmacy@tanecare.et` / `pharmacy123` |
| **Admin** | `/admin/login` | `admin@tanecare.et` / `admin123` |

## How it works

1. **Doctor** — Looks up patient by Fayda ID, updates EHR, issues digital prescriptions.
2. **Pharmacy** — Retrieves authorized Rx by the same Fayda ID, marks medications dispensed (no paper).
3. **Patient** — Mobile app with meds, schedule/alarms, SOS, and prescription history.
4. **Admin** — Platform analytics, patient registry, staff accounts.

## Run locally

```bash
pnpm install
pnpm dev
```

Open **http://localhost:5173** — the app uses **built-in mock data** by default (no API server needed).

To use the real SQLite API instead, run both servers and set:

```bash
VITE_USE_API=true pnpm dev
```

- Frontend: http://localhost:5173  
- API + SQLite: http://localhost:3001 (only when `VITE_USE_API=true`)

If SQLite bindings fail after install:

```bash
cd node_modules/better-sqlite3 && npm run build-release
```

## Stack

- React 18 + TypeScript + Vite + Tailwind CSS 4
- Express API + **SQLite** (`server/tanecare.db`)
- Fayda FIN as the universal patient identifier

## Demo patients (Fayda FIN)

| Patient | FIN |
|---------|-----|
| Sarah Johnson | `123456789012` |
| Abebe Tadesse | `234567890123` |
| Helen Girma | `345678901234` |
| Dawit Mekonnen | `456789012345` |
| Ruth Haile | `567890123456` |
| Yonas Bekele | `678901234567` |
| Meron Assefa | `789012345678` |
| Tigist Worku | `890123456789` |

Mock data is seeded on API startup. To reset: delete `server/tanecare.db` and restart `pnpm dev`.

## Database tables

- `users` — patients (Fayda FIN)
- `staff` — doctors, pharmacists, admins
- `prescriptions` — digital Rx + pharmacy fulfillment status
- `health_records` — EHR consultation notes
- `alarms` — patient medication reminders

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | API + frontend |
| `pnpm dev:client` | Vite only |
| `pnpm dev:server` | API only |
| `pnpm build` | Production build |
