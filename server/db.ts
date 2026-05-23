import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "tanecare.db");

export const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fayda_fin TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL DEFAULT 'Patient',
      email TEXT,
      phone TEXT,
      condition_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('doctor', 'pharmacy', 'admin')),
      full_name TEXT NOT NULL,
      facility_name TEXT NOT NULL,
      license_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      hospital TEXT NOT NULL,
      medication TEXT NOT NULL,
      dosage TEXT NOT NULL,
      schedule TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
      fulfillment_status TEXT NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'dispensed')),
      icon TEXT NOT NULL DEFAULT '💊',
      color TEXT NOT NULL DEFAULT '#1D6FE8',
      issued_by INTEGER,
      dispensed_by INTEGER,
      dispensed_at TEXT,
      doctor_notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (issued_by) REFERENCES staff(id),
      FOREIGN KEY (dispensed_by) REFERENCES staff(id)
    );

    CREATE TABLE IF NOT EXISTS health_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      staff_id INTEGER NOT NULL,
      visit_date TEXT NOT NULL,
      chief_complaint TEXT,
      diagnosis TEXT,
      notes TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    );

    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      time TEXT NOT NULL,
      medication TEXT NOT NULL,
      days TEXT NOT NULL,
      sound INTEGER NOT NULL DEFAULT 1,
      vibration INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  migrateColumns();
  seedStaff();
}

function migrateColumns() {
  const userCols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!userCols.some((c) => c.name === "condition_notes")) {
    db.exec("ALTER TABLE users ADD COLUMN condition_notes TEXT");
  }

  const rxCols = db.prepare("PRAGMA table_info(prescriptions)").all() as { name: string }[];
  const addRx = (col: string, def: string) => {
    if (!rxCols.some((c) => c.name === col)) {
      db.exec(`ALTER TABLE prescriptions ADD COLUMN ${col} ${def}`);
    }
  };
  addRx("fulfillment_status", "TEXT NOT NULL DEFAULT 'pending'");
  addRx("issued_by", "INTEGER");
  addRx("dispensed_by", "INTEGER");
  addRx("dispensed_at", "TEXT");
  addRx("doctor_notes", "TEXT");
  addRx("duration_days", "INTEGER");
  addRx("dose_times", "TEXT");

  const alarmCols = db.prepare("PRAGMA table_info(alarms)").all() as { name: string }[];
  if (!alarmCols.some((c) => c.name === "prescription_id")) {
    db.exec("ALTER TABLE alarms ADD COLUMN prescription_id INTEGER REFERENCES prescriptions(id)");
  }
}

function seedStaff() {
  const count = db.prepare("SELECT COUNT(*) as c FROM staff").get() as { c: number };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO staff (email, password, role, full_name, facility_name, license_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    "admin@tanecare.et",
    "admin123",
    "admin",
    "System Administrator",
    "Tena Care HQ",
    "ADM-001",
  );
  insert.run(
    "doctor@tanecare.et",
    "doctor123",
    "doctor",
    "Dr. Abebe Kebede",
    "St. Mary's Medical Center",
    "MD-ETH-8842",
  );
  insert.run(
    "pharmacy@tanecare.et",
    "pharmacy123",
    "pharmacy",
    "Helen Tadesse",
    "CityCare Pharmacy",
    "PHM-ETH-2201",
  );
}

export function seedUserData(userId: number) {
  const count = db
    .prepare("SELECT COUNT(*) as c FROM prescriptions WHERE user_id = ?")
    .get(userId) as { c: number };

  if (count.c > 0) return;

  db.prepare(
    "UPDATE users SET condition_notes = ? WHERE id = ?",
  ).run(
    "Alzheimer's disease — mild cognitive impairment. Caregiver-assisted medication management.",
    userId,
  );

  const doctor = db
    .prepare("SELECT id FROM staff WHERE role = 'doctor' LIMIT 1")
    .get() as { id: number } | undefined;

  const insertRx = db.prepare(`
    INSERT INTO prescriptions (
      user_id, hospital, medication, dosage, schedule, start_date, end_date,
      status, icon, color, issued_by, fulfillment_status, doctor_notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `);

  const prescriptions = [
    [
      "St. Mary's Medical Center",
      "Donepezil",
      "10mg",
      "Once daily at bedtime",
      "May 1, 2025",
      "Dec 31, 2025",
      "active",
      "🧠",
      "#6C63FF",
      "Cholinesterase inhibitor for cognitive support",
    ],
    [
      "St. Mary's Medical Center",
      "Memantine",
      "10mg",
      "Twice daily",
      "May 1, 2025",
      "Dec 31, 2025",
      "active",
      "💊",
      "#1D6FE8",
      "NMDA receptor antagonist",
    ],
    [
      "City General Hospital",
      "Vitamin D3",
      "1000 IU",
      "Once daily with meals",
      "Mar 15, 2025",
      "Sep 15, 2025",
      "active",
      "☀️",
      "#F59E0B",
      null,
    ],
    [
      "Greenview Clinic",
      "Atorvastatin",
      "20mg",
      "Once daily at bedtime",
      "Jan 10, 2025",
      "Apr 10, 2025",
      "completed",
      "🧬",
      "#10B981",
      null,
    ],
  ] as const;

  for (const row of prescriptions) {
    insertRx.run(
      userId,
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      row[5],
      row[6],
      row[7],
      row[8],
      doctor?.id ?? null,
      row[9],
    );
  }

  const insertAlarm = db.prepare(`
    INSERT INTO alarms (user_id, time, medication, days, sound, vibration)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const alarms = [
    ["08:00 AM", "Donepezil", '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 1, 1],
    ["08:00 PM", "Memantine", '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 1, 1],
    ["08:00 PM", "Memantine", '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 1, 0],
    ["07:30 AM", "Vitamin D3", '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 1, 1],
  ] as const;

  for (const row of alarms) {
    insertAlarm.run(userId, ...row);
  }

  if (doctor) {
    db.prepare(`
      INSERT INTO health_records (user_id, staff_id, visit_date, chief_complaint, diagnosis, notes)
      VALUES (?, ?, date('now'), ?, ?, ?)
    `).run(
      userId,
      doctor.id,
      "Memory lapses and difficulty with daily routines",
      "Alzheimer's disease — early stage",
      "Patient linked via Fayda ID. Digital prescription issued. Caregiver education provided on medication adherence.",
    );
  }
}

if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
