import { IdCard, Search } from "lucide-react";
import { useState } from "react";
import { finValidationMessage, formatFinDisplay, isValidFin, normalizeFin } from "@/lib/fayda";

interface FaydaLookupProps {
  onLookup: (fin: string) => void;
  loading?: boolean;
  buttonLabel?: string;
}

export function FaydaLookup({
  onLookup,
  loading,
  buttonLabel = "Look up patient",
}: FaydaLookupProps) {
  const [fin, setFin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = finValidationMessage(fin);
    if (msg || !isValidFin(fin)) {
      setError(msg ?? "Invalid Fayda ID");
      return;
    }
    setError(null);
    onLookup(normalizeFin(fin));
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <IdCard size={18} className="text-primary" />
        <span className="text-sm font-bold text-foreground">Fayda National ID lookup</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0000 0000 0000"
          value={fin}
          onChange={(e) => {
            setFin(formatFinDisplay(e.target.value));
            setError(null);
          }}
          className="flex-1 rounded-xl border border-border bg-input-background px-4 py-3 text-sm font-semibold tracking-wider outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #1D6FE8 0%, #0FB8C3 100%)",
          }}
        >
          <Search size={16} />
          {loading ? "Searching…" : buttonLabel}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}
