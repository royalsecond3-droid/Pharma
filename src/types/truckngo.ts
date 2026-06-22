export type WasteCategory = "organic" | "plastic" | "paper" | "metal" | "glass";
export type SortResult = "correct" | "partial" | "incorrect";
export type CollectionStatus = "scheduled" | "en_route" | "nearby" | "completed";
export type StaffRole = "driver" | "admin";
export type TruckStatus = "active" | "maintenance" | "inactive";
export type DriverStatus = "online" | "on_route" | "offline";

export interface ResidentProfile {
  id: number;
  residentId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  city: string;
  zone: string;
  neighborhood: string;
  address: string;
  routeId: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  rank: number;
  badges: string[];
}

export interface WasteSubmission {
  id: number;
  date: string;
  categories: WasteCategory[];
  sortResult: SortResult;
  pointsAwarded: number;
  photoTaken: boolean;
}

export interface CollectionSchedule {
  nextDate: string;
  nextTime: string;
  status: CollectionStatus;
  etaMinutes: number;
  truckId: string;
  driverName: string;
  stopsRemaining: number;
  routeProgress: number;
}

export interface NotificationReminder {
  id: number;
  type: "12h" | "3h" | "30m";
  message: string;
  sentAt: string;
  read: boolean;
}

export interface TruckLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  updatedAt: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: "utility" | "voucher" | "transport" | "municipal";
}

export interface RewardHistory {
  id: number;
  date: string;
  type: "earned" | "redeemed";
  amount: number;
  description: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  neighborhood: string;
  points: number;
  badge?: string;
}

export interface CommunityStats {
  recyclingRate: number;
  householdsParticipating: number;
  wasteDivertedKg: number;
  neighborhoodRank: number;
}

export interface RouteStop {
  id: string;
  address: string;
  residentName: string;
  completed: boolean;
  completedAt?: string;
  lat: number;
  lng: number;
}

export interface DriverRoute {
  id: string;
  truckId: string;
  truckPlate: string;
  zone: string;
  stops: RouteStop[];
  totalHouseholds: number;
  estimatedCompletion: string;
  distanceKm: number;
  progress: number;
}

export interface RouteSummary {
  distanceKm: number;
  householdsServed: number;
  collectionsCompleted: number;
  efficiencyScore: number;
  durationMinutes: number;
}

export interface StaffProfile {
  id: number;
  email: string;
  role: StaffRole;
  fullName: string;
  facilityName: string;
  licenseId: string | null;
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  residents: number;
  truckId: string | null;
  driverId: number | null;
  collectionDays: string[];
}

export interface FleetTruck {
  id: string;
  plate: string;
  model: string;
  status: TruckStatus;
  utilization: number;
  nextMaintenance: string;
  assignedZone: string | null;
}

export interface AdminStats {
  activeTrucks: number;
  driversOnline: number;
  collectionProgress: number;
  pendingIssues: number;
  totalResidents: number;
  recyclingCompliance: number;
  routesActive: number;
}

export interface AnalyticsData {
  recyclingComplianceRate: number;
  wastePerZone: { zone: string; kg: number }[];
  truckUtilization: number;
  residentParticipation: number;
  rewardsDistributed: number;
  collectionSuccessRate: number;
  co2SavedKg: number;
}

export interface ResidentListItem extends ResidentProfile {
  verified: boolean;
  suspended: boolean;
  submissionsCount: number;
}

export interface DriverListItem {
  id: number;
  fullName: string;
  email: string;
  status: DriverStatus;
  routesCompleted: number;
  efficiencyScore: number;
  assignedZone: string | null;
}

export const WASTE_CATEGORIES: { id: WasteCategory; label: string; icon: string; color: string }[] = [
  { id: "organic", label: "Organic", icon: "🌿", color: "#22C55E" },
  { id: "plastic", label: "Plastic", icon: "♻️", color: "#3B82F6" },
  { id: "paper", label: "Paper", icon: "📄", color: "#F59E0B" },
  { id: "metal", label: "Metal", icon: "🔩", color: "#64748B" },
  { id: "glass", label: "Glass", icon: "🫙", color: "#14B8A6" },
];

export const BADGES = [
  { id: "green-starter", name: "Green Starter", minPoints: 50 },
  { id: "eco-champion", name: "Eco Champion", minPoints: 200 },
  { id: "recycling-hero", name: "Recycling Hero", minPoints: 500 },
  { id: "sustainability-leader", name: "Sustainability Leader", minPoints: 1000 },
];

export const CITIES = ["Addis Ababa", "Dire Dawa", "Hawassa", "Bahir Dar"];
export const ZONES: Record<string, string[]> = {
  "Addis Ababa": ["Bole", "Kirkos", "Yeka", "Lideta", "Arada"],
  "Dire Dawa": ["Central", "Industrial", "Residential East"],
  "Hawassa": ["Lake View", "Central", "Industrial"],
  "Bahir Dar": ["Blue Nile", "Downtown", "University"],
};
export const NEIGHBORHOODS: Record<string, string[]> = {
  Bole: ["Bole Medhanialem", "Gerji", "Summit", "Atlas"],
  Kirkos: ["Kazanchis", "Meskel Square", "Piassa"],
  Yeka: ["CMC", "Meri", "Kotebe"],
  Lideta: ["Merkato", "Tor Hailoch"],
  Arada: ["Piazza", "Amist Kilo"],
  Central: ["Main Street", "Market Area"],
  "Industrial": ["Factory Zone A", "Factory Zone B"],
  "Residential East": ["East Hills", "Green Valley"],
  "Lake View": ["Shoreline", "Pine Grove"],
  Downtown: ["City Center", "Old Town"],
  University: ["Campus North", "Campus South"],
  "Blue Nile": ["Riverside", "Bridge View"],
};
