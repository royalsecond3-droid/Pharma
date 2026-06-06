import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppLanguage = "en" | "am" | "om";

const STORAGE_KEY = "patientLanguage";

const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afaan Oromo",
};

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    navHome: "Home",
    navMeds: "Meds",
    navFind: "Find",
    navBlog: "Blog",
    navSos: "SOS",
    navSchedule: "Schedule",
    navProfile: "Profile",
    blogTitle: "Blog & Learning",
    blogSubtitle: "Teaching videos, patient blog posts, and health education updates.",
    blogSearchPlaceholder: "Search videos and posts",
    blogNoResults: "No results found. Try another keyword.",

    goodMorning: "Good morning,",
    unlockFindCare: "Unlock Find Care & insights - from 299 ETB/mo",
    activeRx: "Active Rx",
    completed: "Completed",
    today: "Today",
    findCare: "Find Care",
    findCareDesc: "Rare meds & lab equipment - stock & ETB prices nationwide",
    recentPrescriptions: "Recent Prescriptions",
    viewAll: "View all",
    loadingPrescriptions: "Loading prescriptions...",
    noPrescriptions: "No prescriptions yet.",
    homeDays: "days",

    loginPatientPortal: "Patient Portal",
    loginSignInWithFayda: "Sign in with Fayda",
    loginUseNationalId: "Use your Ethiopian National ID (Fayda) to access your health records",
    loginSignInError: "Could not sign in. Check your Fayda ID and try again.",
    loginInvalidFin: "Invalid Fayda National ID",
    loginEnterFinFirst: "Enter your Fayda National ID first, or open the Fayda app to verify.",
    loginFaydaIdTitle: "Fayda National ID",
    loginFaydaIdSubtitle: "Official digital identity - Ethiopia",
    loginFinLabel: "Fayda ID number (FIN)",
    loginVerifyNationalId: "Verify National ID",
    loginVerifying: "Verifying...",
    loginOr: "or",
    loginVerifyWithApp: "Verify with Fayda App",
    loginSecurityNote: "Login is only available through Fayda National ID. Your identity is verified securely and is never shared without your consent.",
    loginDemoPatients: "Demo patients (tap FIN to copy)",
    loginAllPortals: "All portals",
    loginNoFayda: "Don't have Fayda yet?",
    loginRegisterIdet: "Register at id.et",

    medsMyMeds: "My Medications",
    medsFindOnMap: "Find on map",
    medsTabDrugs: "Drugs",
    medsTabLab: "Lab",
    medsTabUnbuy: "Unbuy",
    medsTabPayBuy: "Pay buy",
    medsLoading: "Loading...",
    medsNoMeds: "No medications yet",
    medsNoLabRequests: "No lab requests",
    medsRequestInFindCare: "request in Find Care",
    medsNothingUnbuy: "Nothing to unbuy",
    medsNoPayBuy: "No pay buy yet",
    medsPayBuy: "Pay buy",
    medsUnbuy: "Unbuy",
    medsActive: "Active",
    medsDone: "Done",
    medsBooked: "Booked",
    medsRequested: "Requested",

    scheduleTitle: "Medication Schedule",
    scheduleSubtitle: "Doctor-prescribed plan, course length, and reminder alarms",
    scheduleByDoctor: "Prescribed by your doctor",
    scheduleLoadingPlan: "Loading your medication plan...",
    scheduleNoActive: "No active prescriptions yet. Your doctor will add medications with how many days to take them and when to take each dose.",
    scheduleActiveReminders: "Active reminders",
    scheduleCancel: "Cancel",
    scheduleCustomAlarm: "+ Custom alarm",
    scheduleMedicationName: "Medication name",
    scheduleTimePlaceholder: "e.g. 08:00 AM",
    scheduleSound: "Sound",
    scheduleVibrate: "Vibrate",
    scheduleSaveCustom: "Save custom reminder",
    scheduleLoadingReminders: "Loading reminders...",
    scheduleTapSetAlarm: "Tap \"Set alarm\" on a dose time above to get reminders.",
    scheduleRemoveAlarm: "Remove alarm",
    scheduleLinkedRx: "Linked to Rx",
    scheduleTakeTimes: "Take at these times",
    scheduleAlarmOn: "Alarm on",
    scheduleSetAlarm: "Set alarm",
    schedulePillsLeft: "Pills left",
    scheduleDoseTaken: "I took this dose",

    findcareMapAllDots: "dots on map - tap Start for route",
    findcarePickPlace: "Pick a place, tap Start to see the route",
    findcarePharmacies: "Pharmacies",
    findcareLabEquip: "Lab equipment",
    findcareUpgrade: "Upgrade your subscription to search pharmacies nationwide.",
    findcareMedication: "Medication",
    findcareAllMeds: "All my medications - show all dots",
    findcareNoStock: "No in-stock pharmacies within 15 km.",
    findcareStock: "Stock",
    findcareOnRoute: "On route",
    findcareStart: "Start",
    findcareReserve: "Reserve",
    findcareProcedureMachine: "Procedure / machine",
    findcareRequest: "Request",
    findcarePayToReserve: "Pay to reserve",
    findcareConfirmPayment: "Confirm payment",
    findcareCouldNotComplete: "Could not complete - try again",
    findcareCouldNotLabRequest: "Could not save lab request",
    findcareLabRequestPrefix: "Lab request",
    findcarePayReserved: "Pay buy reserved at",
    findcareUnbuyReserved: "Unbuy - reserved at",
    findcareYou: "You",
    findcareFeature: "Find Care",

    profilePersonalDetails: "Personal details",
    profileFullName: "Full name",
    profileEmail: "Email",
    profilePhone: "Phone",
    profileSave: "Save profile",
    profileSaving: "Saving...",
    profileSaved: "Profile saved",
    profileSaveFailed: "Could not save profile",
    profileSecureNote: "Your account is linked to Fayda National ID. Prescriptions, payments, and schedules are stored securely in the Aura Care platform.",
    profileLogout: "Log out",
    profileFamilyCore: "Family Core - 4 linked profiles - annual billing",
    profileManageSub: "Manage subscription - Pay with Telebirr, CBE, Chapa",
    profileUpgrade: "Upgrade",

    sosTitle: "SOS Emergency",
    sosSubtitle: "Hold the button for 2 seconds to alert your caregiver and share your Fayda-linked profile",
    sosSent: "SOS alert sent (demo)",
    sosKeepHolding: "Keep holding...",
    sosHold2Sec: "Hold 2 sec",
    sosReleaseCancel: "Release to cancel - Demo mode - no real emergency dispatch",
    sosQuickCall: "Quick call",
    sosRecentAlerts: "Recent alerts",
    sosLocationSoon: "Location sharing (coming soon)",
    sosLocationBody: "Live GPS will be sent to caregivers when SOS is triggered. Update your phone in",
    sosCaregiverFamily: "Caregiver / family",

    subTitle: "Subscription",
    subSubtitle: "Pay in ETB - Telebirr, CBE, Chapa & card",
    subTrial: "TRIAL",
    subCancelsAtEnd: "Cancels at period end",
    subRenews: "Renews",
    subAutoOn: "Auto-renew on",
    subAutoOff: "Auto-renew off",
    subFamilyMembers: "Family Core members (4/4)",
    subFamilyCovers: "One subscription covers all linked Fayda profiles",
    subPrimary: "Primary",
    subPlansPay: "Plans & pay",
    subBilling: "Billing",
    subTryFree: "Try Care Plus free for 14 days",
    subMonthly: "Monthly",
    subAnnual: "Annual (save ~17%)",
    subPaymentMethod: "Payment method",
    subWalletPhone: "Wallet phone number",
    subCardNumber: "Card number",
    subDemoOnly: "Demo only - no real charge",
    subProcessing: "Processing payment...",
    subSwitchFree: "Switch to Free",
    subPayPrefix: "Pay",
    subTurnOffRenew: "Turn off auto-renew",
    subNoPayments: "No payments yet",
    subYear: "year",
    subMo: "mo",
  },
  am: {
    navHome: "መነሻ",
    navMeds: "መድሃኒት",
    navFind: "ፈልግ",
    navBlog: "ብሎግ",
    navSos: "SOS",
    navSchedule: "መርሃግብር",
    navProfile: "መገለጫ",
    blogTitle: "ብሎግ እና ትምህርት",
    blogSubtitle: "የትምህርት ቪዲዮዎች፣ የታካሚ ጽሁፎች እና የጤና ማብራሪያዎች።",
    blogSearchPlaceholder: "ቪዲዮ እና ጽሁፍ ፈልግ",
    blogNoResults: "ውጤት አልተገኘም። ሌላ ቃል ይሞክሩ።",

    goodMorning: "እንደምን አደሩ,",
    unlockFindCare: "Find Care እና ጥልቅ መረጃዎችን ይክፈቱ - ከ299 ብር/ወር",
    activeRx: "ንቁ መድሃኒቶች",
    completed: "የተጠናቀቁ",
    today: "ዛሬ",
    findCare: "እንክብካቤ ፈልግ",
    findCareDesc: "እጥረት ያላቸው መድሃኒቶች እና የላብ መሳሪያዎች - አገር አቀፍ ክምችት እና ዋጋ",
    recentPrescriptions: "የቅርብ ጊዜ ማዘዣዎች",
    viewAll: "ሁሉን ይመልከቱ",
    loadingPrescriptions: "ማዘዣዎች በመጫን ላይ...",
    noPrescriptions: "እስካሁን ማዘዣ የለም።",
    homeDays: "ቀናት",

    loginPatientPortal: "የታካሚ ፖርታል",
    loginSignInWithFayda: "በፋይዳ ይግቡ",
    loginUseNationalId: "የጤና መረጃዎን ለማግኘት የኢትዮጵያ ብሄራዊ መታወቂያ (ፋይዳ) ይጠቀሙ",
    loginVerifyNationalId: "ብሄራዊ መታወቂያ ያረጋግጡ",
    loginVerifying: "በማረጋገጥ ላይ...",
    loginOr: "ወይም",
    loginVerifyWithApp: "በፋይዳ መተግበሪያ ያረጋግጡ",

    medsMyMeds: "መድሃኒቶቼ",
    medsFindOnMap: "በካርታ ፈልግ",
    medsTabDrugs: "መድሃኒቶች",
    medsTabLab: "ላብ",
    medsTabUnbuy: "Unbuy",
    medsTabPayBuy: "Pay buy",
    medsLoading: "በመጫን ላይ...",
    medsNoMeds: "እስካሁን መድሃኒት የለም",

    scheduleTitle: "የመድሃኒት መርሃግብር",
    scheduleSubtitle: "በሐኪም የተዘጋጀ እቅድ፣ የኮርስ ጊዜ እና የማስታወሻ ማንቂያዎች",
    scheduleByDoctor: "በሐኪምዎ የታዘዘ",
    scheduleActiveReminders: "ንቁ ማስታወሻዎች",
    scheduleCancel: "ይቅር",
    scheduleCustomAlarm: "+ ብጁ ማንቂያ",
    scheduleSaveCustom: "ብጁ ማስታወሻ አስቀምጥ",
    scheduleLoadingReminders: "ማስታወሻዎች በመጫን ላይ...",

    findcarePharmacies: "ፋርማሲዎች",
    findcareLabEquip: "የላብ መሳሪያ",
    findcareStart: "ጀምር",
    findcareReserve: "ያስይዙ",
    findcareRequest: "ይጠይቁ",
    findcarePayToReserve: "ለማስያዝ ይክፈሉ",
    findcareConfirmPayment: "ክፍያ ያረጋግጡ",
    findcareFeature: "Find Care",
    findcareYou: "እርስዎ",

    profilePersonalDetails: "የግል ዝርዝሮች",
    profileFullName: "ሙሉ ስም",
    profileEmail: "ኢሜይል",
    profilePhone: "ስልክ",
    profileSave: "መገለጫ አስቀምጥ",
    profileSaving: "በማስቀመጥ ላይ...",
    profileSaved: "መገለጫ ተቀምጧል",
    profileSaveFailed: "መገለጫ ማስቀመጥ አልተቻለም",
    profileLogout: "ውጣ",

    sosTitle: "SOS አስቸኳይ",
    sosQuickCall: "ፈጣን ጥሪ",
    sosRecentAlerts: "የቅርብ ማስጠንቀቂያዎች",

    subTitle: "ምዝገባ",
    subPlansPay: "እቅዶች እና ክፍያ",
    subBilling: "ክፍያ",
    subPaymentMethod: "የክፍያ ዘዴ",
    subNoPayments: "እስካሁን ክፍያ የለም",
  },
  om: {
    navHome: "Mana",
    navMeds: "Qoricha",
    navFind: "Barbaadi",
    navBlog: "Biloogii",
    navSos: "SOS",
    navSchedule: "Sagantaa",
    navProfile: "Profaayilii",
    blogTitle: "Biloogii fi Barnoota",
    blogSubtitle: "Viidiyoo barsiisoo, barruulee dhukkubsataa fi odeeffannoo fayyaa.",
    blogSearchPlaceholder: "Viidiyoo fi barruu barbaadi",
    blogNoResults: "Bu'aan hin argamne. Jecha biraa yaali.",

    goodMorning: "Akkam bultan,",
    unlockFindCare: "Find Care fi insight bani - irraa jalqaba 299 ETB/ji'a",
    activeRx: "Ajaja Fayyaa Jira",
    completed: "Xumurame",
    today: "Har'a",
    findCare: "Tajaajila Barbaadi",
    findCareDesc: "Qorichoota rakkisoo fi meeshaa laaboraatoorii - kuusaa fi gatii biyya guutuu",
    recentPrescriptions: "Ajajoota Dhihoo",
    viewAll: "Hunda ilaali",
    loadingPrescriptions: "Ajajoonni fe'amaa jiru...",
    noPrescriptions: "Ammaaf ajajni hin jiru.",
    homeDays: "guyyaa",

    loginPatientPortal: "Poortaalii Dhukkubsataa",
    loginSignInWithFayda: "Faydaan seeni",
    loginVerifyNationalId: "ID Biyyaalessaa mirkaneessi",
    loginVerifying: "Mirkaneessaa jira...",
    loginOr: "ykn",
    loginVerifyWithApp: "App Faydaan mirkaneessi",

    medsMyMeds: "Qorichoota Koo",
    medsFindOnMap: "Kaarta irratti barbaadi",
    medsTabDrugs: "Qoricha",
    medsTabLab: "Laab",
    medsTabUnbuy: "Unbuy",
    medsTabPayBuy: "Pay buy",

    scheduleTitle: "Sagantaa Qorichaa",
    scheduleSubtitle: "Karoora hakiimaan kenname, dheerina yaalaa fi yaadannoowwan",
    scheduleByDoctor: "Hakiima keessaniin kenname",
    scheduleActiveReminders: "Yaadannoowwan hojii irra jiran",
    scheduleCancel: "Dhiisi",
    scheduleCustomAlarm: "+ Yaadannoo dhuunfaa",

    findcarePharmacies: "Faarmaasiiwwan",
    findcareLabEquip: "Meeshaa laaboraatoorii",
    findcareStart: "Jalqabi",
    findcareReserve: "Qabsiisi",
    findcareRequest: "Gaafadhu",
    findcarePayToReserve: "Qabsiisuuf kaffali",
    findcareConfirmPayment: "Kaffaltii mirkaneessi",
    findcareFeature: "Find Care",
    findcareYou: "Ati",

    profilePersonalDetails: "Odeeffannoo dhuunfaa",
    profileFullName: "Maqaa guutuu",
    profileEmail: "Imeelii",
    profilePhone: "Bilbila",
    profileSave: "Profaayilii kuusi",
    profileSaving: "Kuusaa jira...",
    profileSaved: "Profaayiliin kuufameera",
    profileSaveFailed: "Profaayilii kuusuu hin dandeenye",
    profileLogout: "Ba'i",

    sosTitle: "SOS Hatattamaa",
    sosQuickCall: "Bilbila saffisaa",
    sosRecentAlerts: "Akeekkachiisa dhihoo",

    subTitle: "Miseensummaa",
    subPlansPay: "Karoorota fi kaffaltii",
    subBilling: "Kaffaltii",
    subPaymentMethod: "Mala kaffaltii",
    subNoPayments: "Kaffaltiin amma hin jiru",
  },
};

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string) => string;
  options: Array<{ code: AppLanguage; label: string }>;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage === "en" || savedLanguage === "am" || savedLanguage === "om") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const options = [
      { code: "en" as const, label: LANGUAGE_LABELS.en },
      { code: "am" as const, label: LANGUAGE_LABELS.am },
      { code: "om" as const, label: LANGUAGE_LABELS.om },
    ];

    return {
      language,
      setLanguage,
      t: (key: string) => TRANSLATIONS[language][key] ?? TRANSLATIONS.en[key] ?? key,
      options,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
