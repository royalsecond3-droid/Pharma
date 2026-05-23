import type { Request, Response } from "express";
import { db } from "./db.js";

export interface UserRow {
  id: number;
  fayda_fin: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  condition_notes: string | null;
}

export interface StaffRow {
  id: number;
  email: string;
  password: string;
  role: string;
  full_name: string;
  facility_name: string;
  license_id: string | null;
}

export function normalizeFin(raw: string): string {
  return String(raw).replace(/\D/g, "");
}

export function getUserByFin(fin: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE fayda_fin = ?").get(fin) as
    | UserRow
    | undefined;
}

export function mapUser(row: UserRow) {
  return {
    id: row.id,
    faydaFin: row.fayda_fin,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    conditionNotes: row.condition_notes,
  };
}

export function mapPrescription(r: {
  id: number;
  hospital: string;
  medication: string;
  dosage: string;
  schedule: string;
  start_date: string;
  end_date: string;
  status: string;
  fulfillment_status: string;
  icon: string;
  color: string;
  doctor_notes: string | null;
  dispensed_at: string | null;
  duration_days?: number | null;
  dose_times?: string | null;
  full_name?: string;
  fayda_fin?: string;
}) {
  let doseTimes: string[] = [];
  if (r.dose_times) {
    try {
      doseTimes = JSON.parse(r.dose_times) as string[];
    } catch {
      doseTimes = [];
    }
  }
  const mapped = {
    id: r.id,
    hospital: r.hospital,
    medication: r.medication,
    dosage: r.dosage,
    schedule: r.schedule,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status,
    fulfillmentStatus: r.fulfillment_status,
    icon: r.icon,
    color: r.color,
    doctorNotes: r.doctor_notes,
    dispensedAt: r.dispensed_at,
    durationDays: r.duration_days ?? 0,
    doseTimes,
    patientName: r.full_name,
    patientFin: r.fayda_fin,
  };
  if (!mapped.durationDays || !mapped.doseTimes.length) {
    const start = new Date(mapped.startDate);
    const end = new Date(mapped.endDate);
    if (!mapped.durationDays && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      mapped.durationDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / 86400000),
      );
    }
    if (!mapped.doseTimes.length) {
      const s = mapped.schedule.toLowerCase();
      if (s.includes("twice")) mapped.doseTimes = ["08:00 AM", "08:00 PM"];
      else if (s.includes("bedtime") || s.includes("night"))
        mapped.doseTimes = ["09:00 PM"];
      else mapped.doseTimes = ["08:00 AM"];
    }
    if (!mapped.durationDays) mapped.durationDays = 90;
  }
  return mapped;
}

export function requirePatient(req: Request, res: Response): UserRow | null {
  const fin = req.header("x-fayda-fin");
  if (!fin) {
    res.status(401).json({ error: "Missing Fayda FIN" });
    return null;
  }
  const user = getUserByFin(fin);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return null;
  }
  return user;
}

export function requireStaff(
  req: Request,
  res: Response,
  roles?: string[],
): StaffRow | null {
  const id = Number(req.header("x-staff-id"));
  if (!id) {
    res.status(401).json({ error: "Staff authentication required" });
    return null;
  }
  const staff = db.prepare("SELECT * FROM staff WHERE id = ?").get(id) as
    | StaffRow
    | undefined;
  if (!staff) {
    res.status(401).json({ error: "Invalid staff session" });
    return null;
  }
  if (roles && !roles.includes(staff.role)) {
    res.status(403).json({ error: "Insufficient permissions" });
    return null;
  }
  return staff;
}

export function getOrCreatePatient(fin: string, fullName?: string): UserRow {
  let user = getUserByFin(fin);
  if (!user) {
    const insert = db
      .prepare("INSERT INTO users (fayda_fin, full_name) VALUES (?, ?)")
      .run(fin, fullName ?? "New Patient");
    user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(insert.lastInsertRowid) as UserRow;
  }
  return user;
}
