import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle,
  Heart,
  IdCard,
  LockKeyhole,
  Phone,
  Search,
  Scan,
  Shield,
  Flag,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { DEMO_PATIENT_FINS } from "@/data/mockPatients";
import { useAuth } from "@/context/AuthContext";
import {
  finValidationMessage,
  formatFinDisplay,
  isValidFin,
  normalizeFin,
} from "@/lib/fayda";
import { APP_NAME, LOGO_SRC } from "@/lib/brand";
import { useLanguage } from "@/context/LanguageContext";

const WORLD_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
] as const;

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithFayda, loginWithTourist } = useAuth();
  const { t } = useLanguage();
  const [fin, setFin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [touristName, setTouristName] = useState("");
  const [touristPhone, setTouristPhone] = useState("");
  const [touristCountry, setTouristCountry] = useState("");
  const [touristPassword, setTouristPassword] = useState("");
  const [touristConfirmPassword, setTouristConfirmPassword] = useState("");
  const [touristError, setTouristError] = useState<string | null>(null);
  const [touristSaving, setTouristSaving] = useState(false);
  const [touristOpen, setTouristOpen] = useState(false);
  const [touristCountrySearch, setTouristCountrySearch] = useState("");
  const [countryPickerOpen, setCountryPickerOpen] = useState(true);

  const filteredCountries = useMemo(() => {
    const query = touristCountrySearch.trim().toLowerCase();
    if (!query) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter((country) => country.toLowerCase().includes(query));
  }, [touristCountrySearch]);

  const selectedCountryLabel = touristCountry || "Select country";

  const handleSelectCountry = (country: string) => {
    setTouristCountry(country);
    setTouristCountrySearch("");
    setCountryPickerOpen(false);
  };

  const handleFinChange = (raw: string) => {
    setFin(formatFinDisplay(raw));
    if (error) setError(null);
  };

  const verifyAndLogin = async (normalizedFin: string) => {
    setVerifying(true);
    setError(null);
    try {
      await loginWithFayda(normalizedFin);
      navigate("/patient/home");
    } catch {
      setError(t("loginSignInError"));
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeFin(fin);
    const message = finValidationMessage(fin);
    if (message || !isValidFin(fin)) {
      setError(message ?? t("loginInvalidFin"));
      return;
    }
    await verifyAndLogin(normalized);
  };

  const handleOpenFaydaApp = async () => {
    const normalized = normalizeFin(fin);
    if (!isValidFin(fin)) {
      setError(
        finValidationMessage(fin) ??
          t("loginEnterFinFirst"),
      );
      return;
    }
    await verifyAndLogin(normalized);
  };

  const handleTouristSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouristError(null);

    if (!touristName.trim()) {
      setTouristError("Enter your name.");
      return;
    }
    if (!touristPhone.trim()) {
      setTouristError("Enter your phone number.");
      return;
    }
    if (!touristCountry.trim()) {
      setTouristError("Tell us the country you are coming from.");
      return;
    }
    if (!touristPassword.trim()) {
      setTouristError("Create a password.");
      return;
    }
    if (touristPassword !== touristConfirmPassword) {
      setTouristError("Passwords do not match.");
      return;
    }

    setTouristSaving(true);
    try {
      await loginWithTourist({
        fullName: touristName.trim(),
        phone: touristPhone.trim(),
        country: touristCountry.trim(),
        password: touristPassword,
      });
      navigate("/patient/home");
    } catch (signInError) {
      setTouristError(signInError instanceof Error ? signInError.message : "Could not create tourist account.");
    } finally {
      setTouristSaving(false);
    }
  };

  const closeTouristForm = () => {
    if (touristSaving) return;
    setTouristOpen(false);
    setTouristError(null);
    setTouristCountrySearch("");
    setCountryPickerOpen(true);
  };

  return (
    <MobileShell>
      <div className="flex min-h-dvh flex-col px-6 pb-8">
        <div
          className="relative -mx-6 flex flex-col items-center px-6 pb-8 pt-10"
          style={{
            background: "linear-gradient(160deg, #1D6FE8 0%, #0FB8C3 100%)",
            borderRadius: "0 0 36px 36px",
          }}
        >
          <div className="mb-3 flex flex-col items-center gap-2">
            <img
              src={LOGO_SRC}
              alt={`${APP_NAME} logo`}
              style={{
                width: 88,
                height: 88,
                borderRadius: 20,
                objectFit: "cover",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: -0.5,
                }}
              >
                {APP_NAME}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {t("loginPatientPortal")}
              </div>
            </div>
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: -0.5,
              textAlign: "center",
            }}
          >
            {t("loginSignInWithFayda")}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              textAlign: "center",
              marginTop: 4,
              maxWidth: 280,
            }}
          >
            {t("loginUseNationalId")}
          </div>
          <div style={{ position: "absolute", right: 20, top: 20, opacity: 0.12 }}>
            <Heart size={64} color="#fff" />
          </div>
          <div style={{ position: "absolute", left: 20, bottom: 16, opacity: 0.1 }}>
            <Activity size={48} color="#fff" />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 24,
            background: "#fff",
            borderRadius: 24,
            padding: "24px 20px",
            boxShadow: "0 8px 32px rgba(29,111,232,0.10)",
          }}
        >
          <div
            className="mb-5 flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #E8F5E9 0%, #E0F7F8 100%)",
              borderRadius: 12,
              padding: "10px 12px",
              border: "1px solid rgba(15, 184, 195, 0.25)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <IdCard size={18} color="#0B7A3E" />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F1B35" }}>
                {t("loginFaydaIdTitle")}
              </div>
              <div style={{ fontSize: 10, color: "#5A7399" }}>
                {t("loginFaydaIdSubtitle")}
              </div>
            </div>
            <CheckCircle size={16} color="#0FB8C3" />
          </div>

          <div className="mb-4">
            <label
              htmlFor="fayda-fin"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#5A7399",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              {t("loginFinLabel")}
            </label>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#F4F8FF",
                borderRadius: 12,
                padding: "13px 16px",
                border: error
                  ? "1.5px solid #E53E3E"
                  : "1.5px solid rgba(29,111,232,0.12)",
              }}
            >
              <IdCard size={16} color="#1D6FE8" />
              <input
                id="fayda-fin"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0000 0000 0000"
                value={fin}
                onChange={(e) => handleFinChange(e.target.value)}
                disabled={verifying}
                aria-invalid={!!error}
                aria-describedby={error ? "fin-error" : undefined}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 15,
                  color: "#0F1B35",
                  letterSpacing: 1.2,
                  fontWeight: 600,
                }}
              />
            </div>
            {error && (
              <p
                id="fin-error"
                role="alert"
                style={{ fontSize: 11, color: "#E53E3E", marginTop: 6 }}
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifying}
            style={{
              width: "100%",
              padding: "15px 0",
              borderRadius: 14,
              background: verifying
                ? "#9BA7B4"
                : "linear-gradient(135deg, #1D6FE8 0%, #0FB8C3 100%)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: verifying ? "wait" : "pointer",
              boxShadow: verifying
                ? "none"
                : "0 6px 20px rgba(29,111,232,0.35)",
              letterSpacing: 0.2,
            }}
          >
            {verifying ? t("loginVerifying") : t("loginVerifyNationalId")}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div style={{ flex: 1, height: 1, background: "rgba(29,111,232,0.10)" }} />
            <span style={{ fontSize: 12, color: "#5A7399", fontWeight: 500 }}>{t("loginOr")}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(29,111,232,0.10)" }} />
          </div>

          <button
            type="button"
            onClick={handleOpenFaydaApp}
            disabled={verifying}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 14,
              background: "#fff",
              color: "#0B7A3E",
              fontSize: 14,
              fontWeight: 700,
              border: "2px solid #0B7A3E",
              cursor: verifying ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Scan size={18} />
            {t("loginVerifyWithApp")}
          </button>

          <div className="mt-5 flex items-start gap-2">
            <Shield size={14} color="#5A7399" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: "#5A7399", lineHeight: 1.5, margin: 0 }}>
              {t("loginSecurityNote")}
            </p>
          </div>
        </form>

        <button
          type="button"
          onClick={() => setTouristOpen(true)}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "15px 0",
            borderRadius: 18,
            background: "linear-gradient(135deg, #0FB8C3 0%, #1D6FE8 100%)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 10px 22px rgba(29,111,232,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <UserPlus size={18} />
          Tourist account
        </button>

        {touristOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Tourist account form"
            onClick={closeTouristForm}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              background: "rgba(15, 27, 53, 0.45)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <form
              onSubmit={handleTouristSubmit}
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 420,
                background: "#fff",
                borderRadius: 28,
                padding: "18px 18px 22px",
                boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
                border: "1px solid rgba(29,111,232,0.08)",
                maxHeight: "86vh",
                overflowY: "auto",
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #1D6FE8 0%, #0FB8C3 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserPlus size={18} color="#fff" />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F1B35" }}>
                    Tourist account
                  </div>
                  <div style={{ fontSize: 10, color: "#5A7399" }}>
                    Create or sign in with your phone number, password, and country.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeTouristForm}
                  style={{
                    border: "none",
                    background: "#F4F8FF",
                    color: "#1D6FE8",
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5A7399" }}>Full name</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-3" style={{ background: "#F4F8FF", border: "1.5px solid rgba(29,111,232,0.12)" }}>
                  <IdCard size={16} color="#1D6FE8" />
                  <input
                    type="text"
                    value={touristName}
                    onChange={(e) => setTouristName(e.target.value)}
                    placeholder="Your full name"
                    disabled={touristSaving}
                    className="w-full bg-transparent outline-none"
                    style={{ fontSize: 14, color: "#0F1B35" }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5A7399" }}>Phone number</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-3" style={{ background: "#F4F8FF", border: "1.5px solid rgba(29,111,232,0.12)" }}>
                  <Phone size={16} color="#1D6FE8" />
                  <input
                    type="tel"
                    inputMode="tel"
                    value={touristPhone}
                    onChange={(e) => setTouristPhone(e.target.value)}
                    placeholder="+251 9xx xxx xxx"
                    disabled={touristSaving}
                    className="w-full bg-transparent outline-none"
                    style={{ fontSize: 14, color: "#0F1B35" }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5A7399" }}>Country you are coming from</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "#fff", border: "1.5px solid rgba(29,111,232,0.12)" }}>
                  <Search size={15} color="#5A7399" />
                  <input
                    type="text"
                    value={touristCountrySearch}
                    onChange={(e) => setTouristCountrySearch(e.target.value)}
                    placeholder="Search country"
                    disabled={touristSaving}
                    className="w-full bg-transparent outline-none"
                    style={{ fontSize: 13, color: "#0F1B35" }}
                  />
                </div>
                <div
                  className="mt-2 rounded-2xl"
                  style={{
                    background: "#F4F8FF",
                    border: "1.5px solid rgba(29,111,232,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: touristCountry && !countryPickerOpen ? "1px solid rgba(29,111,232,0.08)" : "none" }}>
                    <div className="flex items-center gap-2">
                      <Flag size={16} color="#1D6FE8" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1B35" }}>
                        {selectedCountryLabel}
                      </span>
                    </div>
                    {touristCountry && !countryPickerOpen && (
                      <button
                        type="button"
                        onClick={() => setCountryPickerOpen(true)}
                        disabled={touristSaving}
                        style={{
                          border: "none",
                          background: "rgba(29,111,232,0.08)",
                          color: "#1D6FE8",
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Change
                      </button>
                    )}
                  </div>
                  {countryPickerOpen ? (
                    <div style={{ maxHeight: 240, overflowY: "auto" }}>
                      <button
                        type="button"
                        onClick={() => handleSelectCountry("")}
                        disabled={touristSaving}
                        className="flex w-full items-center justify-between px-3 py-3 text-left"
                        style={{
                          border: "none",
                          background: !touristCountry ? "rgba(29,111,232,0.08)" : "transparent",
                          color: "#0F1B35",
                        }}
                      >
                        <span style={{ fontSize: 14 }}>Select country</span>
                        {!touristCountry && <span style={{ fontSize: 12, fontWeight: 700, color: "#1D6FE8" }}>Selected</span>}
                      </button>
                      {filteredCountries.length === 0 ? (
                        <div style={{ padding: "14px 12px", fontSize: 13, color: "#5A7399" }}>
                          No countries match your search.
                        </div>
                      ) : (
                        filteredCountries.map((country) => {
                          const isSelected = touristCountry === country;

                          return (
                            <button
                              key={country}
                              type="button"
                              onClick={() => handleSelectCountry(country)}
                              disabled={touristSaving}
                              className="flex w-full items-center justify-between px-3 py-3 text-left"
                              style={{
                                border: "none",
                                background: isSelected ? "rgba(29,111,232,0.08)" : "transparent",
                                color: "#0F1B35",
                                borderTop: "1px solid rgba(29,111,232,0.06)",
                              }}
                            >
                              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                                <span aria-hidden="true">🌍</span>
                                {country}
                              </span>
                              {isSelected && <span style={{ fontSize: 12, fontWeight: 700, color: "#1D6FE8" }}>Selected</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    touristCountry && (
                      <div style={{ padding: "10px 12px 12px", fontSize: 13, color: "#5A7399" }}>
                        Search is hidden after selection.
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5A7399" }}>Password</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-3" style={{ background: "#F4F8FF", border: "1.5px solid rgba(29,111,232,0.12)" }}>
                  <LockKeyhole size={16} color="#1D6FE8" />
                  <input
                    type="password"
                    value={touristPassword}
                    onChange={(e) => setTouristPassword(e.target.value)}
                    placeholder="Create a password"
                    disabled={touristSaving}
                    className="w-full bg-transparent outline-none"
                    style={{ fontSize: 14, color: "#0F1B35" }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#5A7399" }}>Confirm password</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-3" style={{ background: "#F4F8FF", border: "1.5px solid rgba(29,111,232,0.12)" }}>
                  <LockKeyhole size={16} color="#1D6FE8" />
                  <input
                    type="password"
                    value={touristConfirmPassword}
                    onChange={(e) => setTouristConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    disabled={touristSaving}
                    className="w-full bg-transparent outline-none"
                    style={{ fontSize: 14, color: "#0F1B35" }}
                  />
                </div>
              </div>

              {touristError && (
                <p role="alert" style={{ fontSize: 11, color: "#E53E3E", marginBottom: 10 }}>
                  {touristError}
                </p>
              )}

              <button
                type="submit"
                disabled={touristSaving}
                style={{
                  width: "100%",
                  padding: "15px 0",
                  borderRadius: 14,
                  background: touristSaving
                    ? "#9BA7B4"
                    : "linear-gradient(135deg, #1D6FE8 0%, #0FB8C3 100%)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  cursor: touristSaving ? "wait" : "pointer",
                  boxShadow: touristSaving ? "none" : "0 6px 20px rgba(29,111,232,0.35)",
                }}
              >
                {touristSaving ? "Saving..." : "Create tourist account"}
              </button>
            </form>
          </div>
        )}

        <div
          className="mt-5 rounded-2xl border border-border p-4"
          style={{ background: "#F4F8FF" }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: "#0F1B35", marginBottom: 8 }}>
            {t("loginDemoPatients")}
          </p>
          <div className="flex flex-col gap-1.5">
            {DEMO_PATIENT_FINS.slice(0, 4).map((p) => (
              <button
                key={p.fin}
                type="button"
                onClick={() => setFin(formatFinDisplay(p.fin))}
                className="flex justify-between rounded-lg bg-white/80 px-3 py-2 text-left text-xs"
                style={{ border: "1px solid rgba(29,111,232,0.1)" }}
              >
                <span style={{ fontWeight: 600, color: "#0F1B35" }}>{p.name}</span>
                <span style={{ fontFamily: "monospace", color: "#5A7399" }}>{p.fin}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center">
          <Link to="/" style={{ fontSize: 12, color: "#5A7399", textDecoration: "none" }}>
            ← {t("loginAllPortals")}
          </Link>
        </p>

        <p
          className="mt-4 text-center"
          style={{ fontSize: 12, color: "#5A7399", lineHeight: 1.5 }}
        >
          {t("loginNoFayda")}{" "}
          <a
            href="https://id.et"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1D6FE8", fontWeight: 700, textDecoration: "none" }}
          >
            {t("loginRegisterIdet")}
          </a>
        </p>
      </div>
    </MobileShell>
  );
}
