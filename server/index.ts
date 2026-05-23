import cors from "cors";
import express from "express";
import { db, initDatabase, seedUserData } from "./db.js";
import { seedMockPatients } from "./seedMockData.js";
import {
  getOrCreatePatient,
  getUserByFin,
  mapPrescription,
  mapUser,
  normalizeFin,
  requirePatient,
  requireStaff,
} from "./helpers.js";

initDatabase();
seedMockPatients();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// ─── Patient (Fayda) ───────────────────────────────────────────────────────

app.post("/api/session", (req, res) => {
  const fin = normalizeFin(req.body?.fin ?? "");
  if (fin.length < 12) {
    res.status(400).json({ error: "Invalid Fayda FIN" });
    return;
  }
  const user = getOrCreatePatient(fin);
  seedUserData(user.id);
  res.json({ user: mapUser(user) });
});

app.get("/api/profile", (req, res) => {
  const user = requirePatient(req, res);
  if (!user) return;
  res.json({ user: mapUser(user) });
});

app.patch("/api/profile", (req, res) => {
  const user = requirePatient(req, res);
  if (!user) return;
  const { fullName, email, phone } = req.body ?? {};
  db.prepare(
    `UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?`,
  ).run(fullName ?? null, email ?? null, phone ?? null, user.id);
  const updated = getUserByFin(user.fayda_fin)!;
  res.json({ user: mapUser(updated) });
});

app.get("/api/stats", (req, res) => {
  const user = requirePatient(req, res);
  if (!user) return;
  const activeRx = db
    .prepare("SELECT COUNT(*) as c FROM prescriptions WHERE user_id = ? AND status = 'active'")
    .get(user.id) as { c: number };
  const completed = db
    .prepare("SELECT COUNT(*) as c FROM prescriptions WHERE user_id = ? AND status = 'completed'")
    .get(user.id) as { c: number };
  const today = db
    .prepare("SELECT COUNT(*) as c FROM alarms WHERE user_id = ?")
    .get(user.id) as { c: number };
  res.json({ activeRx: activeRx.c, completed: completed.c, today: today.c });
});

app.get("/api/prescriptions", (req, res) => {
  const user = requirePatient(req, res);
  if (!user) return;
  const status = req.query.status as string | undefined;
  const search = String(req.query.search ?? "").toLowerCase();
  let sql = "SELECT * FROM prescriptions WHERE user_id = ?";
  const params: (string | number)[] = [user.id];
  if (status && status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }
  const rows = db.prepare(sql + " ORDER BY status ASC, id ASC").all(...params);
  const prescriptions = (rows as Parameters<typeof mapPrescription>[0][])
    .map(mapPrescription)
    .filter(
      (p) =>
        !search ||
        p.medication.toLowerCase().includes(search) ||
        p.hospital.toLowerCase().includes(search),
    );
  res.json({ prescriptions });
});

app.get("/api/alarms", (req, res) => {
  const user = requirePatient(req, res);
  if (!user) return;
  const rows = db.prepare("SELECT * FROM alarms WHERE user_id = ? ORDER BY id ASC").all(user.id);
  res.json({
    alarms: (
      rows as {
        id: number;
        time: string;
        medication: string;
        days: string;
        sound: number;
        vibration: number;
        prescription_id: number | null;
      }[]
    ).map((r) => ({
      id: r.id,
      time: r.time,
      medication: r.medication,
      days: JSON.parse(r.days),
      sound: Boolean(r.sound),
      vibration: Boolean(r.vibration),
      prescriptionId: r.prescription_id ?? undefined,
    })),
  });
});

app.post("/api/alarms", (req, res) => {
  const user = requirePatient(req, res);
  if (!user) return;
  const { time, medication, days, sound, vibration, prescriptionId } = req.body ?? {};
  if (!time || !medication || !Array.isArray(days)) {
    res.status(400).json({ error: "Invalid alarm payload" });
    return;
  }
  const result = db
    .prepare(
      "INSERT INTO alarms (user_id, time, medication, days, sound, vibration, prescription_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      user.id,
      time,
      medication,
      JSON.stringify(days),
      sound ? 1 : 0,
      vibration ? 1 : 0,
      prescriptionId ?? null,
    );
  res.status(201).json({
    alarm: {
      id: Number(result.lastInsertRowid),
      time,
      medication,
      days,
      sound,
      vibration,
      prescriptionId: prescriptionId ?? undefined,
    },
  });
});

app.delete("/api/alarms/:id", (req, res) => {
  const user = requirePatient(req, res);
  if (!user) return;
  db.prepare("DELETE FROM alarms WHERE id = ? AND user_id = ?").run(Number(req.params.id), user.id);
  res.status(204).send();
});

// ─── Staff auth ──────────────────────────────────────────────────────────────

app.post("/api/staff/login", (req, res) => {
  const { email, password, role } = req.body ?? {};
  if (!email || !password || !role) {
    res.status(400).json({ error: "Email, password, and role required" });
    return;
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPassword = String(password).trim();
  const staff = db
    .prepare("SELECT * FROM staff WHERE email = ? AND role = ?")
    .get(normalizedEmail, role) as
    | { id: number; email: string; password: string; role: string; full_name: string; facility_name: string; license_id: string | null }
    | undefined;
  if (!staff || staff.password !== normalizedPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  res.json({
    staff: {
      id: staff.id,
      email: staff.email,
      role: staff.role,
      fullName: staff.full_name,
      facilityName: staff.facility_name,
      licenseId: staff.license_id,
    },
  });
});

function patientBundle(fin: string) {
  const user = getUserByFin(fin);
  if (!user) return null;

  const prescriptions = db
    .prepare("SELECT * FROM prescriptions WHERE user_id = ? ORDER BY id DESC")
    .all(user.id);

  const healthRecords = db
    .prepare(
      `SELECT h.*, s.full_name as doctor_name, s.facility_name
       FROM health_records h
       JOIN staff s ON s.id = h.staff_id
       WHERE h.user_id = ?
       ORDER BY h.visit_date DESC`,
    )
    .all(user.id);

  const alarms = db
    .prepare("SELECT * FROM alarms WHERE user_id = ?")
    .all(user.id);

  return {
    patient: mapUser(user),
    prescriptions: (prescriptions as Parameters<typeof mapPrescription>[0][]).map(mapPrescription),
    healthRecords: (healthRecords as {
      id: number;
      visit_date: string;
      chief_complaint: string | null;
      diagnosis: string | null;
      notes: string;
      doctor_name: string;
      facility_name: string;
    }[]).map((h) => ({
      id: h.id,
      visitDate: h.visit_date,
      chiefComplaint: h.chief_complaint,
      diagnosis: h.diagnosis,
      notes: h.notes,
      doctorName: h.doctor_name,
      facilityName: h.facility_name,
    })),
    alarms: (alarms as { id: number; time: string; medication: string }[]).map((a) => ({
      id: a.id,
      time: a.time,
      medication: a.medication,
    })),
  };
}

// ─── Doctor ──────────────────────────────────────────────────────────────────

app.get("/api/doctor/patient/:fin", (req, res) => {
  if (!requireStaff(req, res, ["doctor", "admin"])) return;
  const fin = normalizeFin(req.params.fin);
  if (fin.length < 12) {
    res.status(400).json({ error: "Invalid Fayda FIN" });
    return;
  }
  const bundle = patientBundle(fin);
  if (!bundle) {
    res.status(404).json({ error: "Patient not found. Register them via Fayda lookup first." });
    return;
  }
  res.json(bundle);
});

app.post("/api/doctor/patient/:fin/register", (req, res) => {
  const doctor = requireStaff(req, res, ["doctor"]);
  if (!doctor) return;
  const fin = normalizeFin(req.params.fin);
  if (fin.length < 12) {
    res.status(400).json({ error: "Invalid Fayda FIN" });
    return;
  }
  const { fullName, conditionNotes } = req.body ?? {};
  const user = getOrCreatePatient(fin, fullName);
  if (conditionNotes) {
    db.prepare("UPDATE users SET condition_notes = ? WHERE id = ?").run(conditionNotes, user.id);
  }
  seedUserData(user.id);
  res.json({ patient: mapUser(getUserByFin(fin)!) });
});

app.post("/api/doctor/prescriptions", (req, res) => {
  const doctor = requireStaff(req, res, ["doctor"]);
  if (!doctor) return;
  const {
    patientFin,
    medication,
    dosage,
    schedule,
    startDate,
    endDate,
    durationDays,
    doseTimes,
    doctorNotes,
    hospital,
  } = req.body ?? {};
  const fin = normalizeFin(patientFin ?? "");
  if (!medication || !dosage || fin.length < 12) {
    res.status(400).json({ error: "Patient FIN, medication, and dosage required" });
    return;
  }
  const patient = getOrCreatePatient(fin);
  const days = Number(durationDays) > 0 ? Number(durationDays) : 90;
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + days * 86400000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const times: string[] = Array.isArray(doseTimes)
    ? doseTimes
    : schedule?.toLowerCase().includes("twice")
      ? ["08:00 AM", "08:00 PM"]
      : schedule?.toLowerCase().includes("bedtime")
        ? ["09:00 PM"]
        : ["08:00 AM"];
  const result = db
    .prepare(
      `INSERT INTO prescriptions (
        user_id, hospital, medication, dosage, schedule, start_date, end_date,
        status, fulfillment_status, issued_by, doctor_notes, icon, color,
        duration_days, dose_times
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'pending', ?, ?, '🧠', '#6C63FF', ?, ?)`,
    )
    .run(
      patient.id,
      hospital ?? doctor.facility_name,
      medication,
      dosage,
      schedule ?? "As directed",
      fmt(start),
      fmt(end),
      doctor.id,
      doctorNotes ?? null,
      days,
      JSON.stringify(times),
    );
  const row = db.prepare("SELECT * FROM prescriptions WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ prescription: mapPrescription(row as Parameters<typeof mapPrescription>[0]) });
});

app.post("/api/doctor/health-records", (req, res) => {
  const doctor = requireStaff(req, res, ["doctor"]);
  if (!doctor) return;
  const { patientFin, visitDate, chiefComplaint, diagnosis, notes } = req.body ?? {};
  const fin = normalizeFin(patientFin ?? "");
  if (!notes || fin.length < 12) {
    res.status(400).json({ error: "Patient FIN and clinical notes required" });
    return;
  }
  const patient = getOrCreatePatient(fin);
  const result = db
    .prepare(
      `INSERT INTO health_records (user_id, staff_id, visit_date, chief_complaint, diagnosis, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      patient.id,
      doctor.id,
      visitDate ?? new Date().toISOString().slice(0, 10),
      chiefComplaint ?? null,
      diagnosis ?? null,
      notes,
    );
  res.status(201).json({ id: Number(result.lastInsertRowid) });
});

// ─── Pharmacy ────────────────────────────────────────────────────────────────

app.get("/api/pharmacy/patient/:fin", (req, res) => {
  if (!requireStaff(req, res, ["pharmacy", "admin"])) return;
  const fin = normalizeFin(req.params.fin);
  const user = getUserByFin(fin);
  if (!user) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  const prescriptions = db
    .prepare(
      `SELECT p.*, u.full_name, u.fayda_fin FROM prescriptions p
       JOIN users u ON u.id = p.user_id
       WHERE u.fayda_fin = ? AND p.status = 'active'
       ORDER BY p.fulfillment_status ASC, p.id DESC`,
    )
    .all(fin);
  res.json({
    patient: mapUser(user),
    prescriptions: (prescriptions as Parameters<typeof mapPrescription>[0][]).map(mapPrescription),
  });
});

app.patch("/api/pharmacy/prescriptions/:id/dispense", (req, res) => {
  const pharmacist = requireStaff(req, res, ["pharmacy"]);
  if (!pharmacist) return;
  const id = Number(req.params.id);
  db.prepare(
    `UPDATE prescriptions SET fulfillment_status = 'dispensed', dispensed_by = ?, dispensed_at = datetime('now')
     WHERE id = ? AND fulfillment_status = 'pending'`,
  ).run(pharmacist.id, id);
  const row = db.prepare("SELECT * FROM prescriptions WHERE id = ?").get(id);
  if (!row) {
    res.status(404).json({ error: "Prescription not found" });
    return;
  }
  res.json({ prescription: mapPrescription(row as Parameters<typeof mapPrescription>[0]) });
});

// ─── Shared patient list (doctor, pharmacy, admin) ───────────────────────────

app.get("/api/staff/patients", (req, res) => {
  if (!requireStaff(req, res, ["doctor", "pharmacy", "admin"])) return;
  const search = String(req.query.search ?? "").toLowerCase();
  const pendingOnly = req.query.pendingOnly === "true";

  const rows = db
    .prepare(
      `SELECT u.*,
        (SELECT COUNT(*) FROM prescriptions WHERE user_id = u.id) as rx_count,
        (SELECT COUNT(*) FROM prescriptions WHERE user_id = u.id AND status = 'active' AND fulfillment_status = 'pending') as pending_rx,
        (SELECT COUNT(*) FROM health_records WHERE user_id = u.id) as record_count
       FROM users u
       ORDER BY u.full_name ASC`,
    )
    .all() as {
    id: number;
    fayda_fin: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    condition_notes: string | null;
    rx_count: number;
    pending_rx: number;
    record_count: number;
  }[];

  const patients = rows
    .map((u) => ({
      ...mapUser(u),
      prescriptionCount: u.rx_count,
      pendingPrescriptions: u.pending_rx,
      healthRecordCount: u.record_count,
    }))
    .filter((p) => {
      const matchesSearch =
        !search ||
        p.fullName.toLowerCase().includes(search) ||
        p.faydaFin.includes(search.replace(/\D/g, ""));
      const matchesPending = !pendingOnly || (p.pendingPrescriptions ?? 0) > 0;
      return matchesSearch && matchesPending;
    });

  res.json({ patients, total: patients.length });
});

// ─── Admin ───────────────────────────────────────────────────────────────────

app.get("/api/admin/stats", (req, res) => {
  if (!requireStaff(req, res, ["admin"])) return;
  const patients = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  const prescriptions = db.prepare("SELECT COUNT(*) as c FROM prescriptions").get() as { c: number };
  const pending = db
    .prepare("SELECT COUNT(*) as c FROM prescriptions WHERE fulfillment_status = 'pending' AND status = 'active'")
    .get() as { c: number };
  const dispensed = db
    .prepare("SELECT COUNT(*) as c FROM prescriptions WHERE fulfillment_status = 'dispensed'")
    .get() as { c: number };
  const staff = db.prepare("SELECT COUNT(*) as c FROM staff").get() as { c: number };
  const records = db.prepare("SELECT COUNT(*) as c FROM health_records").get() as { c: number };
  res.json({
    patients: patients.c,
    prescriptions: prescriptions.c,
    pendingFulfillment: pending.c,
    dispensed: dispensed.c,
    staff: staff.c,
    healthRecords: records.c,
  });
});

app.get("/api/admin/patients", (req, res) => {
  if (!requireStaff(req, res, ["admin"])) return;
  const search = String(req.query.search ?? "").toLowerCase();
  const rows = db
    .prepare(
      `SELECT u.*,
        (SELECT COUNT(*) FROM prescriptions WHERE user_id = u.id) as rx_count,
        (SELECT COUNT(*) FROM health_records WHERE user_id = u.id) as record_count
       FROM users u ORDER BY u.created_at DESC`,
    )
    .all() as (ReturnType<typeof mapUser> extends infer U ? never : never)[];

  const patients = (
    rows as {
      id: number;
      fayda_fin: string;
      full_name: string;
      email: string | null;
      phone: string | null;
      condition_notes: string | null;
      created_at: string;
      rx_count: number;
      record_count: number;
    }[]
  )
    .map((u) => ({
      ...mapUser(u),
      createdAt: u.created_at,
      prescriptionCount: u.rx_count,
      healthRecordCount: u.record_count,
    }))
    .filter(
      (p) =>
        !search ||
        p.fullName.toLowerCase().includes(search) ||
        p.faydaFin.includes(search.replace(/\D/g, "")),
    );
  res.json({ patients });
});

app.get("/api/admin/staff", (req, res) => {
  if (!requireStaff(req, res, ["admin"])) return;
  const rows = db.prepare("SELECT id, email, role, full_name, facility_name, license_id, created_at FROM staff ORDER BY role").all();
  res.json({
    staff: (rows as { id: number; email: string; role: string; full_name: string; facility_name: string; license_id: string | null; created_at: string }[]).map((s) => ({
      id: s.id,
      email: s.email,
      role: s.role,
      fullName: s.full_name,
      facilityName: s.facility_name,
      licenseId: s.license_id,
      createdAt: s.created_at,
    })),
  });
});

app.get("/api/admin/prescriptions", (req, res) => {
  if (!requireStaff(req, res, ["admin"])) return;
  const rows = db
    .prepare(
      `SELECT p.*, u.full_name, u.fayda_fin FROM prescriptions p
       JOIN users u ON u.id = p.user_id ORDER BY p.id DESC LIMIT 100`,
    )
    .all();
  res.json({
    prescriptions: (rows as Parameters<typeof mapPrescription>[0][]).map(mapPrescription),
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Tena Care API running at http://localhost:${PORT}`);
});
