import { truckngoStore } from "@/data/truckngoStore";
import type { StaffRole } from "@/types/truckngo";
import type { ResidentProfile } from "@/types/truckngo";

export const api = {
  createSession(residentId: string) {
    return truckngoStore.createSession(residentId);
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
    return truckngoStore.registerResident(data);
  },

  getProfile(residentId: string) {
    return truckngoStore.getProfile(residentId);
  },

  updateProfile(
    residentId: string,
    data: Partial<Pick<ResidentProfile, "fullName" | "email" | "phone" | "address">>,
  ) {
    return truckngoStore.updateProfile(residentId, data);
  },

  getDashboard(residentId: string) {
    return truckngoStore.getDashboard(residentId);
  },

  getCollectionSchedule(residentId: string) {
    return truckngoStore.getCollectionSchedule(residentId);
  },

  getTruckTracking(residentId: string) {
    return truckngoStore.getTruckTracking(residentId);
  },

  submitWaste(residentId: string, categories: string[], photoTaken: boolean) {
    return truckngoStore.submitWaste(residentId, categories, photoTaken);
  },

  getSubmissions(residentId: string) {
    return truckngoStore.getSubmissions(residentId);
  },

  getWallet(residentId: string) {
    return truckngoStore.getWallet(residentId);
  },

  redeemReward(residentId: string, rewardId: string) {
    return truckngoStore.redeemReward(residentId, rewardId);
  },

  getCommunity(residentId: string) {
    return truckngoStore.getCommunity(residentId);
  },

  reportIssue(residentId: string, type: string, description: string) {
    return truckngoStore.reportIssue(residentId, type, description);
  },

  staffLogin(email: string, password: string, role: StaffRole) {
    return truckngoStore.staffLogin(email, password, role);
  },

  staffLoginDemo(role: StaffRole) {
    return truckngoStore.staffLoginDemo(role);
  },

  getDriverRoute(staffId: number) {
    return truckngoStore.getDriverRoute(staffId);
  },

  completeStop(staffId: number, stopId: string) {
    return truckngoStore.completeStop(staffId, stopId);
  },

  getRouteSummary(staffId: number) {
    return truckngoStore.getRouteSummary(staffId);
  },

  adminStats(staffId: number) {
    return truckngoStore.adminStats(staffId);
  },

  adminAnalytics(staffId: number) {
    return truckngoStore.adminAnalytics(staffId);
  },

  adminZones(staffId: number) {
    return truckngoStore.adminZones(staffId);
  },

  adminFleet(staffId: number) {
    return truckngoStore.adminFleet(staffId);
  },

  adminResidents(staffId: number) {
    return truckngoStore.adminResidents(staffId);
  },

  adminDrivers(staffId: number) {
    return truckngoStore.adminDrivers(staffId);
  },

  adminRewards(staffId: number) {
    return truckngoStore.adminRewards(staffId);
  },
};
