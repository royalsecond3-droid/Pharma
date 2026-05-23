/** Fayda (Ethiopian National ID) — client-side validation until API is wired. */
const FIN_MIN_LENGTH = 12;
const FIN_MAX_LENGTH = 16;

export function normalizeFin(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatFinDisplay(value: string): string {
  const digits = normalizeFin(value).slice(0, FIN_MAX_LENGTH);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function isValidFin(value: string): boolean {
  const digits = normalizeFin(value);
  return digits.length >= FIN_MIN_LENGTH && digits.length <= FIN_MAX_LENGTH;
}

export function finValidationMessage(value: string): string | null {
  const digits = normalizeFin(value);
  if (!digits) return "Enter your Fayda National ID (FIN)";
  if (digits.length < FIN_MIN_LENGTH) {
    return `FIN must be at least ${FIN_MIN_LENGTH} digits`;
  }
  if (digits.length > FIN_MAX_LENGTH) {
    return `FIN must be at most ${FIN_MAX_LENGTH} digits`;
  }
  return null;
}
