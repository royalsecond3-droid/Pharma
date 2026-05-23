const SOS_HISTORY_KEY = "tanecare_sos_history";

export interface SosAlert {
  id: number;
  sentAt: string;
  fin: string;
  patientName: string;
  locationNote: string;
  contactsNotified: string[];
}

export function getSosHistory(fin: string): SosAlert[] {
  try {
    const raw = localStorage.getItem(SOS_HISTORY_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as SosAlert[];
    return all.filter((a) => a.fin === fin).slice(0, 10);
  } catch {
    return [];
  }
}

export function sendSosAlert(payload: {
  fin: string;
  patientName: string;
  caregiverPhone?: string | null;
}): SosAlert {
  const contacts = [
    "Emergency services (911)",
    payload.caregiverPhone
      ? `Caregiver · ${payload.caregiverPhone}`
      : "Registered caregiver",
    "Tena Care response team (demo)",
  ];
  const alert: SosAlert = {
    id: Date.now(),
    sentAt: new Date().toISOString(),
    fin: payload.fin,
    patientName: payload.patientName,
    locationNote: "Location shared with responders (demo GPS)",
    contactsNotified: contacts,
  };
  try {
    const raw = localStorage.getItem(SOS_HISTORY_KEY);
    const all: SosAlert[] = raw ? JSON.parse(raw) : [];
    all.unshift(alert);
    localStorage.setItem(SOS_HISTORY_KEY, JSON.stringify(all.slice(0, 50)));
  } catch {
    /* ignore */
  }
  return alert;
}
