import { useState } from "react";
import { AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { api } from "@/api/truckngoClient";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";

const ISSUE_TYPES = [
  { id: "overflow", label: "Bin overflow", icon: Trash2 },
  { id: "illegal", label: "Illegal dumping", icon: AlertTriangle },
  { id: "missed", label: "Missed collection", icon: CheckCircle },
];

export function SosPage() {
  const { user } = useAuth();
  const [type, setType] = useState("overflow");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.residentId) return;
    setSubmitting(true);
    try {
      const res = await api.reportIssue(user.residentId, type, description);
      setTicket(res.ticketId);
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader userName={user?.fullName ?? "Resident"} greeting="Report an issue," showScheduleLink={false} />
      <div className="px-5 pb-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Report overflow bins, illegal dumping, or missed collections. Municipal ops will be notified.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 grid gap-2">
            {ISSUE_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left ${
                  type === t.id ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <t.icon size={20} color={type === t.id ? "#0F766E" : "#64748B"} />
                <span className="text-sm font-semibold">{t.label}</span>
              </button>
            ))}
          </div>

          <label className="text-xs font-semibold text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue and location details..."
            rows={4}
            required
            className="mt-2 w-full rounded-xl border border-border bg-input-background p-3 text-sm outline-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-xl bg-destructive py-3.5 text-sm font-bold text-destructive-foreground disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </form>

        {ticket && (
          <div className="mt-4 rounded-xl border border-primary bg-primary/5 p-4 text-center">
            <CheckCircle size={24} color="#22C55E" className="mx-auto" />
            <p className="mt-2 text-sm font-bold">Report submitted</p>
            <p className="text-xs text-muted-foreground">Ticket: {ticket}</p>
          </div>
        )}
      </div>
    </>
  );
}
