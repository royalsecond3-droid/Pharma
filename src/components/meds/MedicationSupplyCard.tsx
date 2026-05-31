import { Link } from "react-router";
import type { MedicationSupplyItem } from "@/types/medicationSupply";

export function MedicationSupplyCard({ item }: { item: MedicationSupplyItem }) {
  const bought = item.status === "paid";

  return (
    <div className="flex items-center gap-3 border-b border-[#E8EEF5] py-3 last:border-0">
      <span className="text-xl">{item.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#0F1B35]">{item.medication}</div>
        <div className="text-xs text-[#5A7399]">
          {item.dosage} · {item.pharmacyName}
        </div>
      </div>
      {bought ? (
        <span className="text-xs font-semibold text-[#10B981]">Pay buy</span>
      ) : (
        <Link
          to="/patient/find"
          className="text-xs font-semibold text-[#1D6FE8] no-underline"
        >
          Unbuy →
        </Link>
      )}
    </div>
  );
}
