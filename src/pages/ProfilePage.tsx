import { useState } from "react";
import { LogOut, MapPin, Phone, Recycle, User } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "@/api/truckngoClient";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";

export function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.residentId) return;
    setSaving(true);
    try {
      await api.updateProfile(user.residentId, { fullName, phone, address });
      await refreshUser();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/resident/login");
  };

  return (
    <>
      <AppHeader userName={user?.fullName ?? "Resident"} greeting="Your profile," showScheduleLink={false} />
      <div className="px-5 pb-6">
        <div className="mb-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <User size={28} color="#0F766E" />
            </div>
            <div>
              <div className="text-lg font-bold">{user?.fullName}</div>
              <div className="text-xs text-muted-foreground">ID: {user?.residentId}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { icon: MapPin, label: "Location", value: `${user?.neighborhood}, ${user?.zone}, ${user?.city}` },
            { icon: Recycle, label: "Route", value: user?.routeId ?? "—" },
            { icon: Phone, label: "Phone", value: user?.phone ?? "—" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <row.icon size={18} color="#0F766E" />
              <div>
                <div className="text-[10px] text-muted-foreground">{row.label}</div>
                <div className="text-sm font-semibold">{row.value}</div>
              </div>
            </div>
          ))}
        </div>

        {editing ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Name" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold">Cancel</button>
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="mt-4 w-full rounded-xl border border-primary py-3 text-sm font-bold text-primary">
            Edit profile
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-destructive"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  );
}
