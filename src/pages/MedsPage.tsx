import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { api } from "@/api/client";
import { MedicationSupplyCard } from "@/components/meds/MedicationSupplyCard";
import { useAuth } from "@/context/AuthContext";
import type { LabEquipmentRequest } from "@/types/aura";
import type { MedicationSupplyItem } from "@/types/medicationSupply";
import type { Prescription } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

type Tab = "drugs" | "lab" | "unbuy" | "paybuy";

function DrugRow({
  rx,
  buyStatus,
  t,
}: {
  rx: Prescription;
  buyStatus?: "paybuy" | "unbuy";
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#E8EEF5] py-3 last:border-0">
      <span className="text-xl">{rx.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#0F1B35]">{rx.medication}</div>
        <div className="text-xs text-[#5A7399]">
          {rx.dosage} · {rx.schedule}
        </div>
      </div>
      {buyStatus === "paybuy" ? (
        <span className="text-xs font-semibold text-[#10B981]">{t("medsPayBuy")}</span>
      ) : buyStatus === "unbuy" ? (
        <Link to="/patient/find" className="text-xs font-semibold text-[#D97706] no-underline">
          {t("medsUnbuy")}
        </Link>
      ) : (
        <span className="text-xs text-[#5A7399]">
          {rx.status === "active" ? t("medsActive") : t("medsDone")}
        </span>
      )}
    </div>
  );
}

function LabRow({ req, t }: { req: LabEquipmentRequest; t: (key: string) => string }) {
  const booked = req.status === "booked";
  return (
    <div className="flex items-center gap-3 border-b border-[#E8EEF5] py-3 last:border-0">
      <span className="text-xl">🔬</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#0F1B35]">{req.equipment}</div>
        <div className="text-xs text-[#5A7399]">{req.facilityName}</div>
      </div>
      <span
        className="text-xs font-semibold"
        style={{ color: booked ? "#10B981" : "#1D6FE8" }}
      >
        {booked ? t("medsBooked") : t("medsRequested")}
      </span>
    </div>
  );
}

export function MedsPage() {
  const { faydaFin } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("drugs");
  const [supplyPaid, setSupplyPaid] = useState<MedicationSupplyItem[]>([]);
  const [supplyUnpaid, setSupplyUnpaid] = useState<MedicationSupplyItem[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labRequests, setLabRequests] = useState<LabEquipmentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!faydaFin) return;
    setLoading(true);
    Promise.all([
      api.getMedicationSupply(faydaFin),
      api.getPrescriptions(faydaFin),
      api.getLabEquipmentRequests(faydaFin),
    ])
      .then(([supply, rx, lab]) => {
        setSupplyPaid(supply.supply.paid);
        setSupplyUnpaid(supply.supply.unpaid);
        setPrescriptions(rx.prescriptions);
        setLabRequests(lab.requests);
      })
      .finally(() => setLoading(false));
  }, [faydaFin]);

  const statusByMed = useMemo(() => {
    const map = new Map<string, "paybuy" | "unbuy">();
    for (const i of supplyPaid) {
      map.set(i.medication.toLowerCase(), "paybuy");
    }
    for (const i of supplyUnpaid) {
      if (!map.has(i.medication.toLowerCase())) {
        map.set(i.medication.toLowerCase(), "unbuy");
      }
    }
    return map;
  }, [supplyPaid, supplyUnpaid]);

  const tabs = [
    { id: "drugs" as const, label: t("medsTabDrugs") },
    { id: "lab" as const, label: t("medsTabLab") },
    { id: "unbuy" as const, label: t("medsTabUnbuy") },
    { id: "paybuy" as const, label: t("medsTabPayBuy") },
  ];

  return (
    <div className="px-5 pb-6 pt-5">
      <h1 className="text-xl font-bold text-[#0F1B35]">{t("medsMyMeds")}</h1>

      <Link
        to="/patient/find"
        className="mt-3 mb-4 block text-sm font-medium text-[#1D6FE8] no-underline"
      >
        {t("medsFindOnMap")} →
      </Link>

      <div className="mb-4 flex rounded-xl bg-[#F4F8FF] p-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="flex-1 rounded-lg py-2 text-[11px] font-semibold transition-colors sm:text-xs"
            style={{
              background: tab === id ? "#fff" : "transparent",
              color: tab === id ? "#1D6FE8" : "#5A7399",
              boxShadow: tab === id ? "0 1px 6px rgba(29,111,232,0.12)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white px-4 shadow-sm ring-1 ring-[rgba(29,111,232,0.08)]">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#5A7399]">{t("medsLoading")}</p>
        ) : tab === "drugs" ? (
          prescriptions.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#5A7399]">{t("medsNoMeds")}</p>
          ) : (
            prescriptions.map((rx) => (
              <DrugRow
                key={rx.id}
                rx={rx}
                buyStatus={statusByMed.get(rx.medication.toLowerCase())}
                t={t}
              />
            ))
          )
        ) : tab === "lab" ? (
          labRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#5A7399]">
              {t("medsNoLabRequests")} -{" "}
              <Link to="/patient/find" className="text-[#1D6FE8] no-underline">
                {t("medsRequestInFindCare")}
              </Link>
            </p>
          ) : (
            labRequests.map((req) => <LabRow key={req.id} req={req} t={t} />)
          )
        ) : tab === "unbuy" ? (
          supplyUnpaid.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#5A7399]">{t("medsNothingUnbuy")}</p>
          ) : (
            supplyUnpaid.map((item) => <MedicationSupplyCard key={item.id} item={item} />)
          )
        ) : supplyPaid.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#5A7399]">{t("medsNoPayBuy")}</p>
        ) : (
          supplyPaid.map((item) => <MedicationSupplyCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
