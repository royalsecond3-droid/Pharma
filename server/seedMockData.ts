import { db, seedUserData } from "./db.js";

export interface MockPatient {
  fin: string;
  fullName: string;
  email: string;
  phone: string;
  conditionNotes: string;
}

export const MOCK_PATIENTS: MockPatient[] = [
  {
    fin: "123456789012",
    fullName: "Sarah Johnson",
    email: "sarah.j@email.et",
    phone: "+251 911 234 567",
    conditionNotes:
      "Alzheimer's disease — mild cognitive impairment. Caregiver-assisted medication management.",
  },
  {
    fin: "234567890123",
    fullName: "Abebe Tadesse",
    email: "abebe.t@email.et",
    phone: "+251 912 345 678",
    conditionNotes:
      "Alzheimer's disease — moderate stage. Lives with family; requires structured reminder schedule.",
  },
  {
    fin: "345678901234",
    fullName: "Helen Girma",
    email: "helen.g@email.et",
    phone: "+251 913 456 789",
    conditionNotes:
      "Vascular dementia with anxiety. Dual therapy for cognition and mood stabilization.",
  },
  {
    fin: "456789012345",
    fullName: "Dawit Mekonnen",
    email: "dawit.m@email.et",
    phone: "+251 914 567 890",
    conditionNotes:
      "Early-onset Alzheimer's. Active in memory clinic program; monthly neurology follow-up.",
  },
  {
    fin: "567890123456",
    fullName: "Ruth Haile",
    email: "ruth.h@email.et",
    phone: "+251 915 678 901",
    conditionNotes:
      "Mild cognitive impairment (MCI) — under observation. Preventive cognitive support medications.",
  },
  {
    fin: "678901234567",
    fullName: "Yonas Bekele",
    email: "yonas.b@email.et",
    phone: "+251 916 789 012",
    conditionNotes:
      "Alzheimer's with insomnia. Evening dosing adjusted; caregiver reports improved sleep routine.",
  },
  {
    fin: "789012345678",
    fullName: "Meron Assefa",
    email: "meron.a@email.et",
    phone: "+251 917 890 123",
    conditionNotes:
      "Mixed dementia (Alzheimer's + vascular). Hypertension comorbidity; coordinated cardiology care.",
  },
  {
    fin: "890123456789",
    fullName: "Tigist Worku",
    email: "tigist.w@email.et",
    phone: "+251 918 901 234",
    conditionNotes:
      "Late-stage Alzheimer's — palliative-focused care plan. Simplified medication regimen.",
  },
];

function seedPatientExtras(
  userId: number,
  doctorId: number,
  pharmacyId: number | null,
  index: number,
) {
  const templates = [
    {
      rx: [
        ["Donepezil", "10mg", "Once daily at bedtime", "active", "pending", "🧠", "#6C63FF"],
        ["Memantine", "10mg", "Twice daily", "active", "dispensed", "💊", "#1D6FE8"],
      ],
      record: {
        complaint: "Memory lapses and wandering at night",
        diagnosis: "Alzheimer's disease — moderate stage",
        notes: "Caregiver present. Medication adherence discussed. Fayda ID verified.",
      },
    },
    {
      rx: [
        ["Rivastigmine", "9mg", "Twice daily with meals", "active", "pending", "🧠", "#6C63FF"],
        ["Sertraline", "50mg", "Once daily in morning", "active", "pending", "💊", "#0FB8C3"],
      ],
      record: {
        complaint: "Anxiety and confusion in unfamiliar settings",
        diagnosis: "Vascular dementia with anxiety",
        notes: "Mood screening completed. Family education on de-escalation techniques.",
      },
    },
    {
      rx: [
        ["Galantamine", "8mg", "Twice daily", "active", "pending", "🧠", "#6C63FF"],
        ["Vitamin D3", "1000 IU", "Once daily", "active", "dispensed", "☀️", "#F59E0B"],
      ],
      record: {
        complaint: "Difficulty recognizing family members",
        diagnosis: "Early-onset Alzheimer's disease",
        notes: "Referred to memory clinic. Digital Rx issued via Fayda-linked EHR.",
      },
    },
  ];

  const t = templates[index % templates.length];
  const hospital = "St. Mary's Medical Center";

  const insertRx = db.prepare(`
    INSERT INTO prescriptions (
      user_id, hospital, medication, dosage, schedule, start_date, end_date,
      status, icon, color, issued_by, fulfillment_status, doctor_notes,
      dispensed_by, dispensed_at
    ) VALUES (?, ?, ?, ?, 'As directed', 'Jan 1, 2025', 'Dec 31, 2025', ?, ?, ?, ?, ?, 'Issued via Tena Care', ?, ?)
  `);

  for (const [med, dose, sched, status, fulfill, icon, color] of t.rx) {
    const dispensed = fulfill === "dispensed" && pharmacyId;
    insertRx.run(
      userId,
      hospital,
      med,
      dose,
      sched,
      status,
      icon,
      color,
      doctorId,
      fulfill,
      dispensed ? pharmacyId : null,
      dispensed ? new Date().toISOString() : null,
    );
  }

  db.prepare(`
    INSERT INTO health_records (user_id, staff_id, visit_date, chief_complaint, diagnosis, notes)
    VALUES (?, ?, date('now', '-' || ? || ' days'), ?, ?, ?)
  `).run(userId, doctorId, String(index * 7), t.record.complaint, t.record.diagnosis, t.record.notes);

  const insertAlarm = db.prepare(`
    INSERT INTO alarms (user_id, time, medication, days, sound, vibration)
    VALUES (?, ?, ?, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]', 1, 1)
  `);
  insertAlarm.run(userId, "08:00 AM", t.rx[0][0]);
  insertAlarm.run(userId, "08:00 PM", t.rx[0][0]);
}

export function seedMockPatients() {
  const count = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (count.c >= MOCK_PATIENTS.length) return;

  const doctor = db.prepare("SELECT id FROM staff WHERE role = 'doctor' LIMIT 1").get() as
    | { id: number }
    | undefined;
  const pharmacy = db.prepare("SELECT id FROM staff WHERE role = 'pharmacy' LIMIT 1").get() as
    | { id: number }
    | undefined;

  if (!doctor) return;

  const upsertUser = db.prepare(`
    INSERT INTO users (fayda_fin, full_name, email, phone, condition_notes)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(fayda_fin) DO UPDATE SET
      full_name = excluded.full_name,
      email = excluded.email,
      phone = excluded.phone,
      condition_notes = excluded.condition_notes
  `);

  MOCK_PATIENTS.forEach((p, index) => {
    upsertUser.run(p.fin, p.fullName, p.email, p.phone, p.conditionNotes);
    const user = db.prepare("SELECT id FROM users WHERE fayda_fin = ?").get(p.fin) as {
      id: number;
    };

    const rxCount = db
      .prepare("SELECT COUNT(*) as c FROM prescriptions WHERE user_id = ?")
      .get(user.id) as { c: number };

    if (rxCount.c === 0) {
      if (index === 0) {
        seedUserData(user.id);
      } else {
        seedPatientExtras(user.id, doctor.id, pharmacy?.id ?? null, index);
      }
    }
  });
}
