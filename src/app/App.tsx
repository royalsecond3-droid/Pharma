import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "@/context/AuthContext";
import { StaffAuthProvider } from "@/context/StaffAuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { GuestRoute } from "@/components/layout/GuestRoute";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { WebPortalLayout } from "@/components/portal/WebPortalLayout";
import { StaffGuestRoute, StaffRoute } from "@/components/portal/StaffRoute";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignInPage } from "@/pages/SignInPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { MedsPage } from "@/pages/MedsPage";
import { PortalLanding } from "@/pages/PortalLanding";
import { ProfilePage } from "@/pages/ProfilePage";
import { FindCarePage } from "@/pages/FindCarePage";
import { SubscriptionPage } from "@/pages/SubscriptionPage";
import { MarketplacePage } from "@/pages/MarketplacePage";
import { SchedulePage } from "@/pages/SchedulePage";
import { BlogPage } from "@/pages/BlogPage";
import { SosPage } from "@/pages/SosPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminPatientsPage } from "@/pages/admin/AdminPatientsPage";
import { AdminPrescriptionsPage } from "@/pages/admin/AdminPrescriptionsPage";
import { AdminStaffPage } from "@/pages/admin/AdminStaffPage";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { DoctorDashboard } from "@/pages/doctor/DoctorDashboard";
import { DoctorPatientPage } from "@/pages/doctor/DoctorPatientPage";
import { DoctorRecordsPage } from "@/pages/doctor/DoctorRecordsPage";
import { StaffLoginPage } from "@/pages/portals/StaffLoginPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StaffAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PortalLanding />} />

              {/* Legacy redirects */}
              <Route path="/login" element={<Navigate to="/resident/login" replace />} />
              <Route path="/patient/*" element={<Navigate to="/resident/home" replace />} />
              <Route path="/doctor/*" element={<Navigate to="/driver" replace />} />
              <Route path="/pharmacy/*" element={<Navigate to="/" replace />} />

              {/* Resident mobile app */}
              <Route element={<GuestRoute />}>
                <Route path="/resident/login" element={<LoginPage />} />
                <Route path="/resident/signin" element={<SignInPage />} />
                <Route path="/resident/register" element={<RegisterPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/resident/home" element={<HomePage />} />
                  <Route path="/resident/sort" element={<MedsPage />} />
                  <Route path="/resident/schedule" element={<SchedulePage />} />
                  <Route path="/resident/community" element={<BlogPage />} />
                  <Route path="/resident/track" element={<FindCarePage />} />
                  <Route path="/resident/wallet" element={<SubscriptionPage />} />
                  <Route path="/resident/marketplace" element={<MarketplacePage />} />
                  <Route path="/resident/report" element={<SosPage />} />
                  <Route path="/resident/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              {/* Driver portal */}
              <Route element={<StaffGuestRoute role="driver" />}>
                <Route path="/driver/login" element={<StaffLoginPage role="driver" />} />
              </Route>
              <Route element={<StaffRoute role="driver" />}>
                <Route
                  element={
                    <WebPortalLayout
                      role="driver"
                      title="Driver Portal"
                      subtitle="Route execution & GPS"
                      accent="#14B8A6"
                      nav={[
                        { to: "/driver", label: "Dashboard" },
                        { to: "/driver/route", label: "Execute route" },
                        { to: "/driver/summary", label: "Route summary" },
                      ]}
                    />
                  }
                >
                  <Route path="/driver" element={<DoctorDashboard />} />
                  <Route path="/driver/route" element={<DoctorPatientPage />} />
                  <Route path="/driver/summary" element={<DoctorRecordsPage />} />
                </Route>
              </Route>

              {/* Admin portal */}
              <Route element={<StaffGuestRoute role="admin" />}>
                <Route path="/admin/login" element={<StaffLoginPage role="admin" />} />
              </Route>
              <Route element={<StaffRoute role="admin" />}>
                <Route
                  element={
                    <WebPortalLayout
                      role="admin"
                      title="Municipal Admin"
                      subtitle="City operations"
                      accent="#052E16"
                      nav={[
                        { to: "/admin", label: "Operations" },
                        { to: "/admin/zones", label: "Zones" },
                        { to: "/admin/fleet", label: "Fleet" },
                        { to: "/admin/people", label: "People" },
                        { to: "/admin/analytics", label: "Analytics" },
                      ]}
                    />
                  }
                >
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/zones" element={<AdminPatientsPage />} />
                  <Route path="/admin/fleet" element={<AdminPrescriptionsPage />} />
                  <Route path="/admin/people" element={<AdminStaffPage />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </StaffAuthProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
