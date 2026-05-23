# Tena Care — Digital Medical Prescription & Fulfillment Portal

<div align="center">

![Tena Care logo](./public/tena-care-logo.png)

**Smart care starts here**

</div>

Supporting mental well-being in healthcare. Tena Care helps patients and caregivers manage prescriptions, doctor-issued schedules, medication reminders, and Fayda-linked identity — especially for older adults and those managing Alzheimer's, dementia, or cognitive challenges.

## Screenshots

| Logo | Patient login (Fayda) |
|------|------------------------|
| ![Tena Care](./image.png) | ![Patient login](./image%20copy.png) |

Production assets also live in [`public/tena-care-logo.png`](./public/tena-care-logo.png) and [`public/patient-login-screen.png`](./public/patient-login-screen.png).

---

## Run locally

```bash
pnpm install
pnpm dev
```

Open **http://localhost:5173**

| Portal | URL | Demo |
|--------|-----|------|
| **Patient** | `/patient/login` | Fayda FIN e.g. `123456789012` |
| **Doctor** | `/doctor/login` | `doctor@tanecare.et` / `doctor123` |
| **Pharmacy** | `/pharmacy/login` | `pharmacy@tanecare.et` / `pharmacy123` |
| **Admin** | `/admin/login` | `admin@tanecare.et` / `admin123` |

API + SQLite (optional): `pnpm dev:all` · database file `server/tanecare.db`

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind 4 |
| Backend | Node.js, Express |
| Database | SQLite (`better-sqlite3`) |
| Auth | Fayda FIN (patients), staff email/password |

Default mode uses **in-memory mock data** (no server required). Set `VITE_USE_API=true` for the live API.

---

## Key features

- **Fayda National ID** — patient sign-in and lookup across doctor, pharmacy, and admin portals
- **Doctor portal** — EHR notes, digital prescriptions, course length (days), dose times
- **Pharmacy portal** — fulfill prescriptions by Fayda ID
- **Patient app** — meds, schedule with alarms, profile, **SOS emergency** (demo)
- **Admin** — patients, prescriptions, staff overview

---

## Four-interface architecture

1. **Doctor** — prescribe, patient lookup, health records  
2. **Pharmacy** — dispense queue by Fayda ID  
3. **Admin** — platform oversight and analytics  
4. **Patient** — prescriptions, reminders, SOS, caregiver sync  

---

## Repository

https://github.com/royalsecond3-droid/Pharma
