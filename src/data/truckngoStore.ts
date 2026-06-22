import type {
  AdminStats,
  AnalyticsData,
  CollectionSchedule,
  CommunityStats,
  DriverListItem,
  DriverRoute,
  FleetTruck,
  LeaderboardEntry,
  NotificationReminder,
  ResidentListItem,
  ResidentProfile,
  RewardHistory,
  RewardItem,
  RouteSummary,
  StaffProfile,
  StaffRole,
  TruckLocation,
  WasteSubmission,
  Zone,
} from "@/types/truckngo";
import { BADGES } from "@/types/truckngo";

const SESSION_KEY = "truckngo_resident_session";
const RESIDENT_ID_KEY = "truckngo_resident_id";
const PROFILE_PREFIX = "truckngo_profile_";
const SUBMISSIONS_PREFIX = "truckngo_submissions_";
const REDEMPTIONS_PREFIX = "truckngo_redemptions_";

const DEMO_RESIDENTS: Record<string, Omit<ResidentProfile, "id">> = {
  R100001: {
    residentId: "R100001",
    fullName: "Selam Bekele",
    email: "selam.b@email.et",
    phone: "+251 911 234 567",
    city: "Addis Ababa",
    zone: "Bole",
    neighborhood: "Gerji",
    address: "House 12, Gerji Road",
    routeId: "RT-BOL-01",
    pointsBalance: 485,
    totalEarned: 720,
    totalRedeemed: 235,
    rank: 3,
    badges: ["green-starter", "eco-champion"],
  },
  R100002: {
    residentId: "R100002",
    fullName: "Daniel Tesfaye",
    email: "daniel.t@email.et",
    phone: "+251 912 345 678",
    city: "Addis Ababa",
    zone: "Kirkos",
    neighborhood: "Kazanchis",
    address: "Block 5, Kazanchis",
    routeId: "RT-KIR-02",
    pointsBalance: 120,
    totalEarned: 120,
    totalRedeemed: 0,
    rank: 12,
    badges: ["green-starter"],
  },
  R100003: {
    residentId: "R100003",
    fullName: "Hanna Girma",
    email: "hanna.g@email.et",
    phone: "+251 913 456 789",
    city: "Addis Ababa",
    zone: "Yeka",
    neighborhood: "CMC",
    address: "Villa 8, CMC Area",
    routeId: "RT-YEK-01",
    pointsBalance: 1250,
    totalEarned: 1580,
    totalRedeemed: 330,
    rank: 1,
    badges: ["green-starter", "eco-champion", "recycling-hero", "sustainability-leader"],
  },
};

export const DEMO_RESIDENT_IDS = Object.entries(DEMO_RESIDENTS).map(([id, r]) => ({
  id,
  name: r.fullName,
}));

const STAFF: StaffProfile[] = [
  {
    id: 1,
    email: "driver@truckngo.et",
    role: "driver",
    fullName: "Alemayehu Desta",
    facilityName: "Bole Collection Route",
    licenseId: "DRV-2024-001",
  },
  {
    id: 2,
    email: "admin@truckngo.et",
    role: "admin",
    fullName: "Marta Haile",
    facilityName: "Addis Ababa Municipal Ops",
    licenseId: null,
  },
];

const DEMO_PASSWORDS: Record<string, string> = {
  "driver@truckngo.et": "driver123",
  "admin@truckngo.et": "admin123",
};

function readProfileOverride(id: string): Partial<ResidentProfile> | null {
  try {
    const raw = localStorage.getItem(`${PROFILE_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as Partial<ResidentProfile>) : null;
  } catch {
    return null;
  }
}

function getProfile(id: string): ResidentProfile {
  const base = DEMO_RESIDENTS[id];
  if (!base) {
    const override = readProfileOverride(id);
    if (override) {
      return {
        id: hashId(id),
        residentId: id,
        fullName: override.fullName ?? "Resident",
        email: override.email ?? null,
        phone: override.phone ?? null,
        city: override.city ?? "Addis Ababa",
        zone: override.zone ?? "Bole",
        neighborhood: override.neighborhood ?? "Gerji",
        address: override.address ?? "",
        routeId: override.routeId ?? "RT-BOL-01",
        pointsBalance: override.pointsBalance ?? 0,
        totalEarned: override.totalEarned ?? 0,
        totalRedeemed: override.totalRedeemed ?? 0,
        rank: override.rank ?? 99,
        badges: override.badges ?? [],
      };
    }
    throw new Error("Resident not found");
  }
  const override = readProfileOverride(id);
  return { id: hashId(id), ...base, ...override };
}

function hashId(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 10000;
  return h || 1;
}

function generateResidentId() {
  return `R${String(Math.floor(100000 + Math.random() * 900000))}`;
}

const MOCK_SUBMISSIONS: Record<string, WasteSubmission[]> = {
  R100001: [
    { id: 1, date: "Jun 20, 2026", categories: ["organic", "plastic"], sortResult: "correct", pointsAwarded: 25, photoTaken: true },
    { id: 2, date: "Jun 13, 2026", categories: ["paper", "glass"], sortResult: "partial", pointsAwarded: 10, photoTaken: true },
    { id: 3, date: "Jun 6, 2026", categories: ["organic"], sortResult: "correct", pointsAwarded: 20, photoTaken: true },
  ],
  R100003: [
    { id: 1, date: "Jun 21, 2026", categories: ["organic", "plastic", "paper", "metal", "glass"], sortResult: "correct", pointsAwarded: 50, photoTaken: true },
  ],
};

const REWARD_CATALOG: RewardItem[] = [
  { id: "trans-2", title: "Bus Ticket", description: "Single ride on city buses", cost: 100, category: "transport" },
  { id: "muni-1", title: "Park Entry Pass", description: "Free municipal park entry for one day", cost: 100, category: "municipal" },
  { id: "voucher-1", title: "Coffee Coupon", description: "50 ETB at partner cafés", cost: 150, category: "voucher" },
  { id: "util-1", title: "Water Bill Discount", description: "10% off your next water utility bill", cost: 200, category: "utility" },
  { id: "voucher-2", title: "Grocery Discount", description: "15% off at partner grocery stores", cost: 250, category: "voucher" },
  { id: "trans-1", title: "Bus Credit", description: "100 ETB transportation credit", cost: 300, category: "transport" },
  { id: "util-2", title: "Electricity Bill", description: "75 ETB credit toward electricity bill", cost: 300, category: "utility" },
  { id: "muni-2", title: "Recycling Starter Kit", description: "Home sorting bins from municipal program", cost: 400, category: "municipal" },
];

const ZONES: Zone[] = [
  { id: "Z-BOL", name: "Bole", city: "Addis Ababa", residents: 8420, truckId: "TRK-001", driverId: 1, collectionDays: ["Mon", "Thu"] },
  { id: "Z-KIR", name: "Kirkos", city: "Addis Ababa", residents: 6100, truckId: "TRK-002", driverId: null, collectionDays: ["Tue", "Fri"] },
  { id: "Z-YEK", name: "Yeka", city: "Addis Ababa", residents: 7800, truckId: "TRK-003", driverId: null, collectionDays: ["Wed", "Sat"] },
];

const FLEET: FleetTruck[] = [
  { id: "TRK-001", plate: "AA-3-12345", model: "Isuzu NQR", status: "active", utilization: 87, nextMaintenance: "Jul 15, 2026", assignedZone: "Bole" },
  { id: "TRK-002", plate: "AA-3-67890", model: "Hino 500", status: "active", utilization: 72, nextMaintenance: "Aug 2, 2026", assignedZone: "Kirkos" },
  { id: "TRK-003", plate: "AA-3-11223", model: "Isuzu NQR", status: "maintenance", utilization: 0, nextMaintenance: "In progress", assignedZone: null },
  { id: "TRK-004", plate: "AA-3-44556", model: "Hino 500", status: "inactive", utilization: 0, nextMaintenance: "Sep 10, 2026", assignedZone: null },
];

const TRUCK_POS: TruckLocation = {
  lat: 9.0192,
  lng: 38.7525,
  heading: 45,
  speed: 18,
  updatedAt: new Date().toISOString(),
};

const DRIVER_ROUTE: DriverRoute = {
  id: "RT-BOL-01",
  truckId: "TRK-001",
  truckPlate: "AA-3-12345",
  zone: "Bole",
  totalHouseholds: 48,
  estimatedCompletion: "2:45 PM",
  distanceKm: 24.5,
  progress: 35,
  stops: [
    { id: "S1", address: "Gerji Road 12", residentName: "Selam Bekele", completed: true, completedAt: "10:15 AM", lat: 9.012, lng: 38.789 },
    { id: "S2", address: "Summit Ave 5", residentName: "Tewodros A.", completed: true, completedAt: "10:28 AM", lat: 9.018, lng: 38.795 },
    { id: "S3", address: "Atlas St 22", residentName: "Meron K.", completed: false, lat: 9.022, lng: 38.801 },
    { id: "S4", address: "Bole Medhanialem 8", residentName: "Yonas M.", completed: false, lat: 9.025, lng: 38.808 },
    { id: "S5", address: "Gerji Park View 3", residentName: "Ruth H.", completed: false, lat: 9.015, lng: 38.792 },
  ],
};

function delay<T>(data: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const truckngoStore = {
  createSession(residentId: string) {
    return delay({ user: getProfile(residentId) });
  },

  registerResident(data: {
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    zone: string;
    neighborhood: string;
    address: string;
  }) {
    const residentId = generateResidentId();
    const routeId = `RT-${data.zone.slice(0, 3).toUpperCase()}-01`;
    const profile: Omit<ResidentProfile, "id"> = {
      residentId,
      fullName: data.fullName,
      email: data.email ?? null,
      phone: data.phone,
      city: data.city,
      zone: data.zone,
      neighborhood: data.neighborhood,
      address: data.address,
      routeId,
      pointsBalance: 25,
      totalEarned: 25,
      totalRedeemed: 0,
      rank: 50,
      badges: ["green-starter"],
    };
    localStorage.setItem(`${PROFILE_PREFIX}${residentId}`, JSON.stringify(profile));
    return delay({ user: { id: hashId(residentId), ...profile } });
  },

  getProfile(residentId: string) {
    return delay({ user: getProfile(residentId) });
  },

  updateProfile(
    residentId: string,
    data: Partial<Pick<ResidentProfile, "fullName" | "email" | "phone" | "address">>,
  ) {
    const current = getProfile(residentId);
    const updated = { ...current, ...data };
    localStorage.setItem(
      `${PROFILE_PREFIX}${residentId}`,
      JSON.stringify({
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        city: updated.city,
        zone: updated.zone,
        neighborhood: updated.neighborhood,
        routeId: updated.routeId,
        pointsBalance: updated.pointsBalance,
        totalEarned: updated.totalEarned,
        totalRedeemed: updated.totalRedeemed,
        rank: updated.rank,
        badges: updated.badges,
      }),
    );
    return delay({ user: updated });
  },

  getDashboard(residentId: string) {
    const profile = getProfile(residentId);
    const schedule: CollectionSchedule = {
      nextDate: "Today, Jun 22",
      nextTime: "11:30 AM",
      status: "en_route",
      etaMinutes: 28,
      truckId: "TRK-001",
      driverName: "Alemayehu D.",
      stopsRemaining: 3,
      routeProgress: 35,
    };
    const submissions = MOCK_SUBMISSIONS[residentId] ?? readSubmissions(residentId);
    const stats: CommunityStats = {
      recyclingRate: 78,
      householdsParticipating: 8420,
      wasteDivertedKg: 12400,
      neighborhoodRank: profile.rank,
    };
    return delay({ schedule, submissions: submissions.slice(0, 3), stats, profile });
  },

  getCollectionSchedule(_residentId: string) {
    const reminders: NotificationReminder[] = [
      { id: 1, type: "12h", message: "Collection tomorrow at 11:30 AM — prepare sorted waste", sentAt: "Jun 21, 11:30 PM", read: true },
      { id: 2, type: "3h", message: "Truck arrives in ~3 hours — final sorting check", sentAt: "Today, 8:30 AM", read: true },
      { id: 3, type: "30m", message: "Truck is 30 minutes away — place bins at curb", sentAt: "Today, 11:00 AM", read: false },
    ];
    const schedule: CollectionSchedule = {
      nextDate: "Today, Jun 22",
      nextTime: "11:30 AM",
      status: "en_route",
      etaMinutes: 28,
      truckId: "TRK-001",
      driverName: "Alemayehu D.",
      stopsRemaining: 3,
      routeProgress: 35,
    };
    return delay({ schedule, reminders });
  },

  getTruckTracking(_residentId: string) {
    return delay({
      location: TRUCK_POS,
      schedule: {
        nextDate: "Today",
        nextTime: "11:30 AM",
        status: "en_route" as const,
        etaMinutes: 28,
        truckId: "TRK-001",
        driverName: "Alemayehu D.",
        stopsRemaining: 3,
        routeProgress: 35,
      },
      route: DRIVER_ROUTE.stops,
      driverStatus: "on_route" as const,
    });
  },

  submitWaste(
    residentId: string,
    categories: string[],
    _photoTaken: boolean,
  ) {
    const results: ("correct" | "partial" | "incorrect")[] = ["correct", "partial", "incorrect"];
    const sortResult = categories.length >= 3 ? "correct" : categories.length >= 2 ? "partial" : results[Math.floor(Math.random() * results.length)];
    const pointsAwarded = sortResult === "correct" ? 25 : sortResult === "partial" ? 10 : 0;
    const submission: WasteSubmission = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      categories: categories as WasteSubmission["categories"],
      sortResult,
      pointsAwarded,
      photoTaken: true,
    };
    const existing = readSubmissions(residentId);
    writeSubmissions(residentId, [submission, ...existing]);
    if (pointsAwarded > 0) {
      const profile = getProfile(residentId);
      const newBalance = profile.pointsBalance + pointsAwarded;
      const newEarned = profile.totalEarned + pointsAwarded;
      const newBadges = [...profile.badges];
      for (const b of BADGES) {
        if (newEarned >= b.minPoints && !newBadges.includes(b.id)) newBadges.push(b.id);
      }
      localStorage.setItem(
        `${PROFILE_PREFIX}${residentId}`,
        JSON.stringify({ ...profile, pointsBalance: newBalance, totalEarned: newEarned, badges: newBadges }),
      );
    }
    return delay({ submission, pointsAwarded });
  },

  getSubmissions(residentId: string) {
    return delay({ submissions: readSubmissions(residentId) });
  },

  getWallet(residentId: string) {
    const profile = getProfile(residentId);
    const submissions = readSubmissions(residentId);

    const earnedFromUploads: RewardHistory[] = submissions
      .filter((s) => s.pointsAwarded > 0)
      .map((s) => ({
        id: s.id,
        date: s.date,
        type: "earned" as const,
        amount: s.pointsAwarded,
        description:
          s.sortResult === "correct" ? "Waste upload verified" : "Partial sorting bonus",
      }));

    const baseHistory: RewardHistory[] = [
      { id: 9001, date: "Jun 19, 2026", type: "earned", amount: 30, description: "Collection completed" },
      { id: 9002, date: "Jun 1, 2026", type: "redeemed", amount: -150, description: "Local Café Voucher" },
    ];

    const storedRedemptions = readRedemptions(residentId);
    const history = [...earnedFromUploads, ...baseHistory, ...storedRedemptions].sort(
      (a, b) => b.id - a.id,
    );

    const weeklyEarned = earnedFromUploads.reduce((sum, tx) => sum + tx.amount, 0) + 30;

    return delay({
      balance: profile.pointsBalance,
      totalEarned: profile.totalEarned,
      totalRedeemed: profile.totalRedeemed,
      weeklyEarned,
      rank: profile.rank,
      history,
      catalog: REWARD_CATALOG,
      badges: profile.badges,
    });
  },

  redeemReward(residentId: string, rewardId: string) {
    const item = REWARD_CATALOG.find((r) => r.id === rewardId);
    if (!item) throw new Error("Reward not found");
    const profile = getProfile(residentId);
    if (profile.pointsBalance < item.cost) throw new Error("Insufficient points");
    const updated = {
      ...profile,
      pointsBalance: profile.pointsBalance - item.cost,
      totalRedeemed: profile.totalRedeemed + item.cost,
    };
    localStorage.setItem(`${PROFILE_PREFIX}${residentId}`, JSON.stringify(updated));
    appendRedemption(residentId, {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: "redeemed",
      amount: -item.cost,
      description: item.title,
    });
    return delay({ success: true, item, newBalance: updated.pointsBalance });
  },

  getCommunity(_residentId: string) {
    const leaderboard: LeaderboardEntry[] = [
      { rank: 1, name: "Hanna G.", neighborhood: "CMC", points: 1250, badge: "Sustainability Leader" },
      { rank: 2, name: "Kebede A.", neighborhood: "Gerji", points: 890, badge: "Recycling Hero" },
      { rank: 3, name: "Selam B.", neighborhood: "Gerji", points: 485, badge: "Eco Champion" },
      { rank: 4, name: "Tigist W.", neighborhood: "Summit", points: 420 },
      { rank: 5, name: "Dawit M.", neighborhood: "Atlas", points: 380 },
    ];
    const stats: CommunityStats = {
      recyclingRate: 78,
      householdsParticipating: 8420,
      wasteDivertedKg: 12400,
      neighborhoodRank: 2,
    };
    return delay({ leaderboard, stats });
  },

  reportIssue(_residentId: string, type: string, description: string) {
    return delay({ ticketId: `TKT-${Date.now()}`, type, description, status: "submitted" });
  },

  staffLogin(email: string, password: string, role: StaffRole) {
    const staff = STAFF.find((s) => s.email === email && s.role === role);
    if (!staff || DEMO_PASSWORDS[email] !== password) {
      return Promise.reject(new Error("Invalid credentials"));
    }
    return delay({ staff });
  },

  staffLoginDemo(role: StaffRole) {
    const staff = STAFF.find((s) => s.role === role);
    if (!staff) return Promise.reject(new Error("Demo account not found"));
    return delay({ staff });
  },

  getDriverRoute(_staffId: number) {
    return delay({ route: DRIVER_ROUTE, truckLocation: TRUCK_POS });
  },

  completeStop(_staffId: number, stopId: string) {
    const stop = DRIVER_ROUTE.stops.find((s) => s.id === stopId);
    if (stop) {
      stop.completed = true;
      stop.completedAt = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      DRIVER_ROUTE.progress = Math.round(
        (DRIVER_ROUTE.stops.filter((s) => s.completed).length / DRIVER_ROUTE.stops.length) * 100,
      );
    }
    return delay({ stop, progress: DRIVER_ROUTE.progress });
  },

  getRouteSummary(_staffId: number): Promise<{ summary: RouteSummary }> {
    return delay({
      summary: {
        distanceKm: 24.5,
        householdsServed: 48,
        collectionsCompleted: 46,
        efficiencyScore: 94,
        durationMinutes: 185,
      },
    });
  },

  adminStats(_staffId: number): Promise<AdminStats> {
    return delay({
      activeTrucks: 2,
      driversOnline: 1,
      collectionProgress: 67,
      pendingIssues: 3,
      totalResidents: 22320,
      recyclingCompliance: 78,
      routesActive: 2,
    });
  },

  adminAnalytics(_staffId: number): Promise<AnalyticsData> {
    return delay({
      recyclingComplianceRate: 78,
      wastePerZone: [
        { zone: "Bole", kg: 4200 },
        { zone: "Kirkos", kg: 3100 },
        { zone: "Yeka", kg: 3800 },
      ],
      truckUtilization: 79,
      residentParticipation: 84,
      rewardsDistributed: 45200,
      collectionSuccessRate: 96,
      co2SavedKg: 18500,
    });
  },

  adminZones(_staffId: number) {
    return delay({ zones: ZONES });
  },

  adminFleet(_staffId: number) {
    return delay({ trucks: FLEET });
  },

  adminResidents(_staffId: number) {
    const residents: ResidentListItem[] = Object.entries(DEMO_RESIDENTS).map(([id, r]) => ({
      id: hashId(id),
      ...r,
      verified: true,
      suspended: false,
      submissionsCount: MOCK_SUBMISSIONS[id]?.length ?? 0,
    }));
    return delay({ residents });
  },

  adminDrivers(_staffId: number) {
    const drivers: DriverListItem[] = [
      { id: 1, fullName: "Alemayehu Desta", email: "driver@truckngo.et", status: "on_route", routesCompleted: 142, efficiencyScore: 94, assignedZone: "Bole" },
      { id: 3, fullName: "Birtukan Assefa", email: "birtukan@truckngo.et", status: "online", routesCompleted: 98, efficiencyScore: 88, assignedZone: "Kirkos" },
      { id: 4, fullName: "Getachew T.", email: "getachew@truckngo.et", status: "offline", routesCompleted: 76, efficiencyScore: 82, assignedZone: null },
    ];
    return delay({ drivers });
  },

  adminRewards(_staffId: number) {
    return delay({
      rules: [
        { id: "r1", name: "Correct sorting", points: 25 },
        { id: "r2", name: "Partial sorting", points: 10 },
        { id: "r3", name: "Weekly streak bonus", points: 50 },
      ],
      pendingRedemptions: 2,
      partnerships: 8,
      fraudFlags: 0,
    });
  },
};

function readSubmissions(residentId: string): WasteSubmission[] {
  try {
    const raw = localStorage.getItem(`${SUBMISSIONS_PREFIX}${residentId}`);
    if (raw) return JSON.parse(raw) as WasteSubmission[];
  } catch {
    /* ignore */
  }
  return MOCK_SUBMISSIONS[residentId] ?? [];
}

function writeSubmissions(residentId: string, subs: WasteSubmission[]) {
  localStorage.setItem(`${SUBMISSIONS_PREFIX}${residentId}`, JSON.stringify(subs));
}

function readRedemptions(residentId: string): RewardHistory[] {
  try {
    const raw = localStorage.getItem(`${REDEMPTIONS_PREFIX}${residentId}`);
    if (raw) return JSON.parse(raw) as RewardHistory[];
  } catch {
    /* ignore */
  }
  return [];
}

function appendRedemption(residentId: string, entry: RewardHistory) {
  const list = readRedemptions(residentId);
  localStorage.setItem(`${REDEMPTIONS_PREFIX}${residentId}`, JSON.stringify([entry, ...list]));
}

export { SESSION_KEY, RESIDENT_ID_KEY };
