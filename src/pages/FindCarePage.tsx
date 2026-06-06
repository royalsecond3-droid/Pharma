import { useEffect, useMemo, useState } from "react";
import { CreditCard, Pill, Scan, X } from "lucide-react";
import { api } from "@/api/client";
import { AppHeader } from "@/components/AppHeader";
import { CareMapPanel } from "@/components/map/CareMapPanel";
import type { CareMapMarker } from "@/components/map/CareMap";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";
import { PAYMENT_METHOD_LABELS } from "@/data/subscriptionPlans";
import { colorForMedication } from "@/lib/medColors";
import { DEFAULT_PATIENT_LOCATION, markerIdForPharmacy } from "@/lib/aura/proximity";
import { usePatientPlan } from "@/hooks/usePatientPlan";
import { planIncludesFeature } from "@/services/subscriptionService";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/hooks/useApi";
import type { EquipmentAllocationResult, PharmacyNearby } from "@/types/aura";
import type { PaymentMethodType } from "@/types/subscription";
import { useLanguage } from "@/context/LanguageContext";

const EQUIPMENT_OPTIONS = ["MRI", "CT Scanner", "Ultrasound"];
const PAY_METHODS: PaymentMethodType[] = ["telebirr", "cbe_birr", "chapa"];
const ALL_MEDICATIONS = "__all__";

export function FindCarePage() {
  const { user, faydaFin: fin } = useAuth();
  const { t } = useLanguage();
  const { planId, isPro } = usePatientPlan();
  const [tab, setTab] = useState<"pharmacy" | "lab">("pharmacy");
  const [selectedMed, setSelectedMed] = useState(ALL_MEDICATIONS);
  const [pharmacies, setPharmacies] = useState<PharmacyNearby[]>([]);
  const [equipment, setEquipment] = useState("MRI");
  const [labResult, setLabResult] = useState<EquipmentAllocationResult | null>(null);
  const [reserving, setReserving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<PharmacyNearby | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethodType>("telebirr");
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [routeActive, setRouteActive] = useState(false);
  const [labRequesting, setLabRequesting] = useState<string | null>(null);

  const selectPlace = (id: string) => {
    setSelectedMapId(id);
    setRouteActive(false);
  };

  const startRoute = (id: string) => {
    setSelectedMapId(id);
    setRouteActive(true);
  };

  const { data: rxData } = useApiData(
    useMemo(() => (f: string) => api.getPrescriptions(f, { status: "active" }), []),
  );

  const medications = useMemo(() => {
    const fromRx = rxData?.prescriptions.map((p) => p.medication) ?? [];
    return [...new Set([...fromRx, "Donepezil", "Memantine", "Rivastigmine"])];
  }, [rxData]);

  const showAllMeds = selectedMed === ALL_MEDICATIONS;

  useEffect(() => {
    if (tab !== "pharmacy" || !planIncludesFeature(planId, "find_care")) return;
    const load =
      showAllMeds && medications.length > 0
        ? api.getAllNearbyPharmacies(medications)
        : api.getNearbyPharmacies(selectedMed);
    load.then((r) => {
      setPharmacies(r.pharmacies);
      if (r.pharmacies[0]) selectPlace(markerIdForPharmacy(r.pharmacies[0]));
    });
  }, [tab, selectedMed, planId, showAllMeds, medications]);

  useEffect(() => {
    if (tab !== "lab" || !fin) return;
    if (!planIncludesFeature(planId, "lab_wizard") && planId === "free") return;
    api.searchEquipment(fin, equipment).then((r) => {
      setLabResult(r.result);
      if (r.result.facilities[0]) selectPlace(r.result.facilities[0].facilityId);
    });
  }, [tab, fin, equipment, planId]);

  const hasFindCare = planIncludesFeature(planId, "find_care");
  const hasLab = planIncludesFeature(planId, "lab_wizard");

  const pharmacyMapMarkers: CareMapMarker[] = useMemo(() => {
    const you: CareMapMarker = {
      id: "patient",
      lat: DEFAULT_PATIENT_LOCATION.lat,
      lng: DEFAULT_PATIENT_LOCATION.lng,
      label: t("findcareYou"),
      kind: "patient",
    };
    const coordCount = new Map<string, number>();
    return [
      you,
      ...pharmacies.map((p) => {
        const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
        const n = coordCount.get(key) ?? 0;
        coordCount.set(key, n + 1);
        return {
          id: markerIdForPharmacy(p),
          lat: p.lat + n * 0.00015,
          lng: p.lng + n * 0.0002,
          label: p.name,
          medication: p.medication,
          distanceKm: p.distanceKm,
          etaMinutes: p.etaMinutes,
          etaLabel: p.etaLabel,
          sublabel: `${p.medication ? `${p.medication} · ` : ""}${p.priceEtb} ETB`,
          kind: "pharmacy" as const,
        };
      }),
    ];
  }, [pharmacies, t]);

  const labMapMarkers: CareMapMarker[] = useMemo(() => {
    const you: CareMapMarker = {
      id: "patient",
      lat: DEFAULT_PATIENT_LOCATION.lat,
      lng: DEFAULT_PATIENT_LOCATION.lng,
      label: t("findcareYou"),
      kind: "patient",
    };
    return [
      you,
      ...(labResult?.facilities ?? []).map((f) => ({
        id: f.facilityId,
        lat: f.lat,
        lng: f.lng,
        label: f.name,
        distanceKm: f.distanceKm,
        etaMinutes: f.etaMinutes,
        etaLabel: f.etaLabel,
        sublabel: `${f.stock} slot(s) · ${f.priceEtb.toLocaleString()} ETB`,
        kind: "hospital" as const,
      })),
    ];
  }, [labResult, t]);

  const completeReserve = async (ph: PharmacyNearby, paid: boolean) => {
    if (!fin || !user) return;
    setReserving(ph.facilityId);
    setMessage(null);
    try {
      if (paid) {
        const med =
          ph.medication ?? (showAllMeds ? medications[0] ?? "Medication" : selectedMed);
        await api.payPharmacyOrder(fin, {
          amountEtb: ph.priceEtb,
          medication: med,
          method: payMethod,
          pharmacyName: ph.name,
        });
      }
      const med =
        ph.medication ?? (showAllMeds ? medications[0] ?? "Medication" : selectedMed);
      if (!paid) {
        await api.addUnpaidMedication(fin, {
          medication: med,
          amountEtb: ph.priceEtb,
          pharmacyName: ph.name,
        });
      }
      await api.reserveMedication({
        patientFin: fin,
        patientName: user.fullName,
        medication: med,
        quantity: 1,
        facilityId: ph.facilityId,
      });
      setMessage(
        paid
          ? `${t("findcarePayReserved")} ${ph.name} (${ph.priceEtb} ETB)`
          : `${t("findcareUnbuyReserved")} ${ph.name}`,
      );
      setPayModal(null);
    } catch {
      setMessage(t("findcareCouldNotComplete"));
    } finally {
      setReserving(null);
    }
  };

  const requestLab = async (facility: {
    facilityId: string;
    name: string;
    city: string;
    priceEtb: number;
    etaLabel: string;
  }) => {
    if (!fin) return;
    setLabRequesting(facility.facilityId);
    setMessage(null);
    try {
      await api.createLabEquipmentRequest(fin, {
        equipment,
        facilityName: facility.name,
        city: facility.city,
        priceEtb: facility.priceEtb,
        etaLabel: facility.etaLabel,
      });
      setMessage(`${t("findcareLabRequestPrefix")}: ${equipment} at ${facility.name}`);
    } catch {
      setMessage(t("findcareCouldNotLabRequest"));
    } finally {
      setLabRequesting(null);
    }
  };

  const onReserveClick = (ph: PharmacyNearby) => {
    if (planIncludesFeature(planId, "priority_rx")) {
      void completeReserve(ph, false);
    } else {
      setPayModal(ph);
    }
  };

  const mapMarkers = tab === "pharmacy" ? pharmacyMapMarkers : labMapMarkers;

  return (
    <>
      <AppHeader userName={user?.fullName ?? "Patient"} planId={planId} greeting={t("goodMorning")} />
      <SubscriptionGate feature={t("findcareFeature")} requiredPlan="care_plus" currentPlan={planId} />

      <div className="px-5 pb-6">
        <h1 className="text-lg font-bold text-[#0F1B35]">{t("findCare")}</h1>
        <p className="mt-1 text-sm text-[#5A7399]">
          {showAllMeds && tab === "pharmacy"
            ? `${pharmacies.length} ${t("findcareMapAllDots")}`
            : t("findcarePickPlace")}
        </p>

        <div className="mt-4 flex gap-2 rounded-xl bg-[#F4F8FF] p-1">
          {(
            [
              { id: "pharmacy" as const, label: t("findcarePharmacies"), icon: Pill },
              { id: "lab" as const, label: t("findcareLabEquip"), icon: Scan },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold"
              style={{
                background: tab === id ? "#fff" : "transparent",
                color: tab === id ? "#1D6FE8" : "#5A7399",
                boxShadow: tab === id ? "0 2px 8px rgba(29,111,232,0.12)" : "none",
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <CareMapPanel
            markers={
              mapMarkers.length > 1
                ? mapMarkers
                : [
                    { id: "patient", lat: DEFAULT_PATIENT_LOCATION.lat, lng: DEFAULT_PATIENT_LOCATION.lng, label: t("findcareYou"), kind: "patient" },
                  ]
            }
            selectedId={selectedMapId ?? "patient"}
            onSelect={selectPlace}
            isPro={isPro}
            proOnly
            height={240}
            routeActive={routeActive}
            onStartRoute={() => selectedMapId && startRoute(selectedMapId)}
          />
        </div>

        {tab === "pharmacy" && (
          <>
            {!hasFindCare ? (
              <p className="mt-8 text-center text-sm text-[#5A7399]">
                {t("findcareUpgrade")}
              </p>
            ) : (
              <>
                <label className="mt-4 block text-xs text-[#5A7399]">{t("findcareMedication")}</label>
                <select
                  value={selectedMed}
                  onChange={(e) => {
                    setSelectedMed(e.target.value);
                    setRouteActive(false);
                  }}
                  className="mt-1 w-full rounded-lg border border-[#E8EEF5] px-3 py-2 text-sm"
                >
                  <option value={ALL_MEDICATIONS}>{t("findcareAllMeds")}</option>
                  {medications.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {showAllMeds && medications.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {medications.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium text-[#5A7399]"
                        style={{ background: "#F4F8FF" }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: colorForMedication(m) }}
                        />
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {message && (
                  <p className="mt-3 text-sm font-medium text-[#10B981]">{message}</p>
                )}

                <div className="mt-4 flex flex-col gap-3">
                  {pharmacies.length === 0 ? (
                    <p className="py-8 text-center text-sm text-[#5A7399]">
                      {t("findcareNoStock")}
                    </p>
                  ) : (
                    pharmacies.map((ph) => {
                      const mid = markerIdForPharmacy(ph);
                      return (
                      <div
                        key={mid}
                        className={`rounded-lg border px-3 py-3 ${
                          selectedMapId === mid
                            ? "border-[#1D6FE8] bg-[#F8FBFF]"
                            : "border-[#E8EEF5] bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {ph.medication && (
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ background: colorForMedication(ph.medication) }}
                            />
                          )}
                          <div className="text-sm font-medium text-[#0F1B35]">
                            {ph.name}
                            {ph.medication && (
                              <span className="font-normal text-[#5A7399]"> · {ph.medication}</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-0.5 text-xs text-[#5A7399]">
                          {ph.etaLabel} · {ph.distanceKm.toFixed(1)} km · {t("findcareStock")} {ph.stock} ·{" "}
                          {ph.priceEtb} ETB
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startRoute(mid)}
                            className="rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                            style={{
                              background:
                                routeActive && selectedMapId === mid
                                  ? "#34A853"
                                  : "#1A73E8",
                            }}
                          >
                            {routeActive && selectedMapId === mid ? t("findcareOnRoute") : t("findcareStart")}
                          </button>
                          <button
                            type="button"
                            disabled={reserving === ph.facilityId}
                            onClick={() => onReserveClick(ph)}
                            className="rounded-md border border-[#E8EEF5] px-3 py-1.5 text-xs font-medium text-[#5A7399]"
                          >
                            {reserving === ph.facilityId ? "..." : t("findcareReserve")}
                          </button>
                        </div>
                      </div>
                    );
                    })
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === "lab" && (
          <>
            {!hasLab && (
              <SubscriptionGate
                feature="Lab equipment search"
                requiredPlan="care_premium"
                currentPlan={planId}
              />
            )}
            {hasLab && (
              <>
                <label className="mt-4 block text-xs font-semibold uppercase text-[#5A7399]">
                  {t("findcareProcedureMachine")}
                </label>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[rgba(29,111,232,0.15)] px-3 py-2.5 text-sm"
                >
                  {EQUIPMENT_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>

                {message && tab === "lab" && (
                  <p className="mt-3 text-sm font-medium text-[#10B981]">{message}</p>
                )}

                {labResult?.safetyNotice && (
                  <div
                    className="mt-4 rounded-xl border px-3 py-3 text-sm"
                    style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}
                  >
                    {labResult.safetyNotice}
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-3">
                  {(labResult?.facilities ?? []).map((f) => (
                    <div
                      key={f.facilityId}
                      className={`rounded-lg border px-3 py-3 ${
                        selectedMapId === f.facilityId
                          ? "border-[#1D6FE8] bg-[#F8FBFF]"
                          : "border-[#E8EEF5] bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium text-[#0F1B35]">{f.name}</div>
                      <div className="mt-0.5 text-xs text-[#5A7399]">
                        {f.etaLabel} · {f.distanceKm.toFixed(1)} km · {f.priceEtb.toLocaleString()}{" "}
                        ETB
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => startRoute(f.facilityId)}
                          className="rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                          style={{ background: "#1D6FE8" }}
                        >
                          {t("findcareStart")}
                        </button>
                        <button
                          type="button"
                          disabled={labRequesting === f.facilityId}
                          onClick={() => requestLab(f)}
                          className="rounded-md border border-[#1D6FE8] px-3 py-1.5 text-xs font-semibold text-[#1D6FE8]"
                        >
                          {labRequesting === f.facilityId ? "..." : t("findcareRequest")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {payModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5">
            <div className="flex justify-between">
              <h3 className="font-bold text-[#0F1B35]">{t("findcarePayToReserve")}</h3>
              <button type="button" onClick={() => setPayModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <p className="mt-2 text-sm text-[#5A7399]">
              {selectedMed} at {payModal.name} — <strong>{payModal.priceEtb} ETB</strong>
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPayMethod(m)}
                  className="rounded-xl border-2 py-2 text-xs font-bold"
                  style={{
                    borderColor: payMethod === m ? "#1D6FE8" : "#eee",
                    background: payMethod === m ? "#F4F8FF" : "#fff",
                  }}
                >
                  {PAYMENT_METHOD_LABELS[m].icon} {PAYMENT_METHOD_LABELS[m].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!!reserving}
              onClick={() => completeReserve(payModal, true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #1D6FE8, #0FB8C3)" }}
            >
              <CreditCard size={18} />
              {t("findcareConfirmPayment")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
