import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME, LOGO_SRC } from "@/lib/brand";
import { CITIES, NEIGHBORHOODS, ZONES } from "@/types/truckngo";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [zone, setZone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");

  const zones = ZONES[city] ?? [];
  const neighborhoods = zone ? (NEIGHBORHOODS[zone] ?? []) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !zone || !neighborhood || !address.trim()) {
      setError("Fill in all required fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ fullName, phone, email: email || undefined, city, zone, neighborhood, address });
      navigate("/resident/home");
    } catch {
      setError("Could not create account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 text-sm outline-none focus:border-[#1B5E20]";

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white px-6 pb-10 pt-12">
      <Link to="/resident/login" className="text-sm font-semibold text-[#1B5E20] no-underline">
        ← Back
      </Link>

      <div className="mt-8 flex flex-col items-center">
        <img src={LOGO_SRC} alt={APP_NAME} className="h-12 w-12 object-contain" />
        <h1 className="mt-4 text-2xl font-bold text-[#1A1A1A]">Create account</h1>
        <p className="mt-2 text-center text-sm text-[#6B7280]">
          We&apos;ll assign your nearest collection route
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#6B7280]">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className={field} required />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6B7280]">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 9xx xxx xxx" className={field} required />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6B7280]">Email (optional)</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={field} />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6B7280]">Home address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no, street" className={field} required />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6B7280]">City</label>
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setZone(""); setNeighborhood(""); }}
            className={field}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6B7280]">Zone</label>
          <select value={zone} onChange={(e) => { setZone(e.target.value); setNeighborhood(""); }} className={field} required>
            <option value="">Select zone</option>
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6B7280]">Neighborhood</label>
          <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={field} required disabled={!zone}>
            <option value="">Select neighborhood</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#1B5E20] py-4 text-base font-bold text-white disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Get Started"}
        </button>
      </form>
    </div>
  );
}
