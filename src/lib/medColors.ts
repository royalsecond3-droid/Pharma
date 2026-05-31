const PALETTE = ["#1D6FE8", "#0FB8C3", "#6C63FF", "#10B981", "#F59E0B", "#E53E3E"];

export function colorForMedication(med: string): string {
  let hash = 0;
  for (let i = 0; i < med.length; i++) hash = med.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length]!;
}
