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
import { MedsPage } from "@/pages/MedsPage";
import { PortalLanding } from "@/pages/PortalLanding";
import { ProfilePage } from "@/pages/ProfilePage";
import { FindCarePage } from "@/pages/FindCarePage";
import { SubscriptionPage } from "@/pages/SubscriptionPage";
import { SchedulePage } from "@/pages/SchedulePage";
import { BlogPage } from "@/pages/BlogPage";
import { DoctorConsultationPage } from "@/pages/doctor/DoctorConsultationPage";
import { SosPage } from "@/pages/SosPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminPatientsPage } from "@/pages/admin/AdminPatientsPage";
import { AdminPrescriptionsPage } from "@/pages/admin/AdminPrescriptionsPage";
import { AdminStaffPage } from "@/pages/admin/AdminStaffPage";
import { DoctorDashboard } from "@/pages/doctor/DoctorDashboard";
import { DoctorPatientsPage } from "@/pages/doctor/DoctorPatientsPage";
import { DoctorPatientPage } from "@/pages/doctor/DoctorPatientPage";
import { DoctorPrescribePage } from "@/pages/doctor/DoctorPrescribePage";
import { DoctorRecordsPage } from "@/pages/doctor/DoctorRecordsPage";
import { PharmacyDashboard } from "@/pages/pharmacy/PharmacyDashboard";
import { PharmacyDispensePage } from "@/pages/pharmacy/PharmacyDispensePage";
import { StaffLoginPage } from "@/pages/portals/StaffLoginPage";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StaffAuthProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<PortalLanding />} />

            {/* Patient mobile app */}
            <Route path="/login" element={<Navigate to="/patient/login" replace />} />
            <Route path="/home" element={<Navigate to="/patient/home" replace />} />
            <Route path="/meds" element={<Navigate to="/patient/meds" replace />} />
            <Route path="/schedule" element={<Navigate to="/patient/schedule" replace />} />
            <Route path="/blog" element={<Navigate to="/patient/blog" replace />} />
            <Route path="/profile" element={<Navigate to="/patient/profile" replace />} />
            <Route path="/sos" element={<Navigate to="/patient/sos" replace />} />
            <Route path="/dashboard" element={<Navigate to="/patient/home" replace />} />
            <Route path="/alarms" element={<Navigate to="/patient/schedule" replace />} />

            <Route element={<GuestRoute />}>
              <Route path="/patient/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/patient/home" element={<HomePage />} />
                <Route path="/patient/meds" element={<MedsPage />} />
                <Route path="/patient/schedule" element={<SchedulePage />} />
                <Route path="/patient/blog" element={<BlogPage />} />
                <Route path="/patient/find" element={<FindCarePage />} />
                <Route path="/patient/subscription" element={<SubscriptionPage />} />
                <Route path="/patient/sos" element={<SosPage />} />
                <Route path="/patient/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Doctor portal */}
            <Route element={<StaffGuestRoute role="doctor" />}>
              <Route path="/doctor/login" element={<StaffLoginPage role="doctor" />} />
            </Route>
            <Route element={<StaffRoute role="doctor" />}>
              <Route
                element={
                  <WebPortalLayout
                    role="doctor"
                    title="Provider Portal"
                    subtitle="Fayda-linked EHR"
                    accent="#6C63FF"
                    nav={[
                      { to: "/doctor", label: "Dashboard" },
                      { to: "/doctor/patients", label: "Patients" },
                      { to: "/doctor/patient", label: "Patient lookup" },
                      { to: "/doctor/prescribe", label: "Prescribe" },
                      { to: "/doctor/records", label: "Health records" },
                      { to: "/doctor/consultation", label: "Consultation" },
                    ]}
                  />
                }
              >
                <Route path="/doctor" element={<DoctorDashboard />} />
                <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
                <Route path="/doctor/patient" element={<DoctorPatientPage />} />
                <Route path="/doctor/prescribe" element={<DoctorPrescribePage />} />
                <Route path="/doctor/records" element={<DoctorRecordsPage />} />
                <Route path="/doctor/consultation" element={<DoctorConsultationPage />} />
              </Route>
            </Route>

            {/* Pharmacy portal */}
            <Route element={<StaffGuestRoute role="pharmacy" />}>
              <Route path="/pharmacy/login" element={<StaffLoginPage role="pharmacy" />} />
            </Route>
            <Route element={<StaffRoute role="pharmacy" />}>
              <Route
                element={
                  <WebPortalLayout
                    role="pharmacy"
                    title="Pharmacy Portal"
                    subtitle="Digital fulfillment"
                    accent="#0FB8C3"
                    nav={[
                      { to: "/pharmacy", label: "Dashboard" },
                      { to: "/pharmacy/dispense", label: "Dispense" },
                    ]}
                  />
                }
              >
                <Route path="/pharmacy" element={<PharmacyDashboard />} />
                <Route path="/pharmacy/dispense" element={<PharmacyDispensePage />} />
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
                    title="Admin Portal"
                    subtitle="System management"
                    accent="#0F1B35"
                    nav={[
                      { to: "/admin", label: "Overview" },
                      { to: "/admin/patients", label: "Patients" },
                      { to: "/admin/prescriptions", label: "Prescriptions" },
                      { to: "/admin/staff", label: "Staff" },
                    ]}
                  />
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/patients" element={<AdminPatientsPage />} />
                <Route path="/admin/prescriptions" element={<AdminPrescriptionsPage />} />
                <Route path="/admin/staff" element={<AdminStaffPage />} />
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
