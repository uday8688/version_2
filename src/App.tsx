import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute, AdminRoute, OwnerRoute, TenantRoute, VendorRoute } from '@/components/auth/ProtectedRoute'
import { ROUTES } from '@/lib/constants'

import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import TenantDashboard from '@/pages/TenantDashboard'
import OwnerDashboard from '@/pages/OwnerDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import ServiceProviderDashboard from '@/pages/ServiceProviderDashboard'
import Payment from '@/pages/Payment'
import Maintenance from '@/pages/Maintenance'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'
import BackgroundVerification from '@/pages/BackgroundVerification'
import LeaseExtension from '@/pages/LeaseExtension'
import UtilityPayments from '@/pages/UtilityPayments'
import ServiceProviderManagement from '@/pages/ServiceProviderManagement'
import Announcements from '@/pages/Announcements'
import Settings from '@/pages/Settings'
import UserManagement from '@/pages/admin/UserManagement'
import Analytics from '@/pages/admin/Analytics'
import VendorCoordination from '@/pages/admin/VendorCoordination'
import VisitorMonitoring from '@/pages/admin/VisitorMonitoring'
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements'
import Properties from '@/pages/admin/Properties'
import AdminMaintenance from '@/pages/admin/AdminMaintenance'
import AdminPayments from '@/pages/admin/AdminPayments'
import AdminReports from '@/pages/admin/AdminReports'
import AdminNotifications from '@/pages/admin/AdminNotifications'
import AdminSettings from '@/pages/admin/AdminSettings'

// Owner pages
import TenantDirectory from '@/pages/owner/TenantDirectory'
import ActiveLeases from '@/pages/owner/ActiveLeases'
import ExpiringLeases from '@/pages/owner/ExpiringLeases'
import LeaseExtensions from '@/pages/owner/LeaseExtensions'
import FinancialReports from '@/pages/owner/FinancialReports'
import TaxReports from '@/pages/owner/TaxReports'
import OwnerProperties from '@/pages/owner/Properties'
import OwnerAnalytics from '@/pages/owner/Analytics'
import CommunityEvents from '@/pages/CommunityEvents'
import CommunityHub from '@/pages/CommunityHub'
import VisitorApproval from '@/pages/VisitorApproval'
import AdminBackgroundVerification from '@/pages/admin/BackgroundVerification'
import AdminServiceProviderManagement from '@/pages/admin/ServiceProviderManagement'
import TenantUtilityPayments from '@/pages/tenant/UtilityPayments'


function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
            <Routes>
              <Route path={ROUTES.HOME} element={<Index />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.SIGNUP} element={<Signup />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />

              {/* Protected Routes */}
              <Route path={ROUTES.PAYMENT} element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.MAINTENANCE} element={
                <ProtectedRoute>
                  <Maintenance />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.BACKGROUND_VERIFICATION} element={
                <ProtectedRoute>
                  <BackgroundVerification />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.LEASE_EXTENSION} element={
                <TenantRoute>
                  <LeaseExtension />
                </TenantRoute>
              } />
              <Route path={ROUTES.UTILITY_PAYMENTS} element={
                <ProtectedRoute>
                  <UtilityPayments />
                </ProtectedRoute>
              } />
              <Route path="/tenant/utility-payments" element={
                <TenantRoute>
                  <TenantUtilityPayments />
                </TenantRoute>
              } />
              <Route path={ROUTES.SERVICE_PROVIDER_MANAGEMENT} element={
                <ProtectedRoute requiredPermission={{ resource: 'users', action: 'view' }}>
                  <ServiceProviderManagement />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.ANNOUNCEMENTS} element={
                <ProtectedRoute>
                  <Announcements />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.SETTINGS} element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.COMMUNITY_EVENTS} element={
                <ProtectedRoute>
                  <CommunityEvents />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.COMMUNITY_HUB} element={
                <ProtectedRoute>
                  <CommunityHub />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.VISITOR_APPROVAL} element={
                <ProtectedRoute>
                  <VisitorApproval />
                </ProtectedRoute>
              } />

              {/* Role-based Dashboard Routes */}
              <Route path={ROUTES.TENANT} element={
                <TenantRoute>
                  <TenantDashboard />
                </TenantRoute>
              } />
              <Route path={ROUTES.OWNER} element={
                <OwnerRoute>
                  <OwnerDashboard />
                </OwnerRoute>
              } />
              <Route path={ROUTES.ADMIN} element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path={ROUTES.VENDOR} element={
                <VendorRoute>
                  <ServiceProviderDashboard />
                </VendorRoute>
              } />

              {/* Admin Sub-routes */}
              <Route path={ROUTES.ADMIN_USERS} element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_ANALYTICS} element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_VENDORS} element={
                <AdminRoute>
                  <VendorCoordination />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_MONITORING} element={
                <AdminRoute>
                  <VisitorMonitoring />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_ANNOUNCEMENTS} element={
                <AdminRoute>
                  <AdminAnnouncements />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_PROPERTIES} element={
                <AdminRoute>
                  <Properties />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_MAINTENANCE} element={
                <AdminRoute>
                  <AdminMaintenance />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_PAYMENTS} element={
                <AdminRoute>
                  <AdminPayments />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_REPORTS} element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={
                <AdminRoute>
                  <AdminNotifications />
                </AdminRoute>
              } />
              <Route path={ROUTES.ADMIN_SETTINGS} element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              } />
              <Route path="/admin/background-verification" element={
                <AdminRoute>
                  <AdminBackgroundVerification />
                </AdminRoute>
              } />
              <Route path="/admin/service-providers" element={
                <AdminRoute>
                  <AdminServiceProviderManagement />
                </AdminRoute>
              } />

              {/* Owner Sub-routes */}
              <Route path={ROUTES.OWNER_TENANT_DIRECTORY} element={
                <OwnerRoute>
                  <TenantDirectory />
                </OwnerRoute>
              } />
              <Route path={ROUTES.OWNER_ACTIVE_LEASES} element={
                <OwnerRoute>
                  <ActiveLeases />
                </OwnerRoute>
              } />
              <Route path={ROUTES.OWNER_EXPIRING_LEASES} element={
                <OwnerRoute>
                  <ExpiringLeases />
                </OwnerRoute>
              } />
              <Route path={ROUTES.OWNER_LEASE_EXTENSIONS} element={
                <OwnerRoute>
                  <LeaseExtensions />
                </OwnerRoute>
              } />
              <Route path={ROUTES.OWNER_FINANCIAL_REPORTS} element={
                <OwnerRoute>
                  <FinancialReports />
                </OwnerRoute>
              } />
              <Route path={ROUTES.OWNER_TAX_REPORTS} element={
                <OwnerRoute>
                  <TaxReports />
                </OwnerRoute>
              } />
              <Route path={ROUTES.OWNER_PROPERTIES} element={
                <OwnerRoute>
                  <OwnerProperties />
                </OwnerRoute>
              } />
              <Route path={ROUTES.OWNER_ANALYTICS} element={
                <OwnerRoute>
                  <OwnerAnalytics />
                </OwnerRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App;
