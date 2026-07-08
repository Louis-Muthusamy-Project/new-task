import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { FeatureProvider } from './contexts/FeatureContext';
import SignIn from './pages/SignIn/SignIn';

// Layouts (keep synchronous)
import AppLayout from './layouts/AppLayout';
import AgencyLayout from './layouts/AgencyLayout';
import ClientLayout from './layouts/ClientLayout';
import PlaceholderPage from './components/PlaceholderPage';

import BccBuilder from './pages/WebsiteBuilder/websiteWizard/BccBuilder';

// Icons used only by placeholders (keep synchronous)
import {
  Users,
  Shield,
  Zap,
  Bell,
  CreditCard,
  Activity,
} from 'lucide-react';

// Lazy route components (major bundle reducer)
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const CRM = lazy(() => import('./pages/CRM/CRM'));
const WebsiteBuilder = lazy(() => import('./pages/WebsiteBuilder/WebsiteBuilder'));
const WebsitesRouteWrapper = lazy(() => import('./pages/WebsiteBuilder/WebsitesRouteWrapper'));

const Strategy = lazy(() => import('./pages/Strategy/Strategy'));
const WebsiteSetupPage = lazy(() => import('./pages/WebsiteBuilder/websiteWizard/WebsiteSetupPage'));
const StorefrontPreviewPage = lazy(() => import('./pages/WebsiteBuilder/storefront/StorefrontPreviewPage'));

const SEO = lazy(() => import('./pages/SEO/SEO'));
const Content = lazy(() => import('./pages/Content/Content'));
const Creative = lazy(() => import('./pages/Creative/Creative'));
const SocialMedia = lazy(() => import('./pages/SocialMedia/SocialMedia'));
const PerformanceAds = lazy(() => import('./pages/PerformanceAds/PerformanceAds'));
const Accounts = lazy(() => import('./pages/Accounts/Accounts'));
const SLA = lazy(() => import('./pages/SLA/SLA'));
const PortalSettings = lazy(() => import('./pages/PortalSettings/PortalSettings'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Automation = lazy(() => import('./pages/Automation/Automation'));
const Tasks = lazy(() => import('./pages/Tasks/Tasks'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const Teams = lazy(() => import('./pages/Teams/Teams'));
const TimeTracking = lazy(() => import('./pages/TimeTracking/TimeTracking'));
const Resources = lazy(() => import('./pages/Resources/Resources'));
const MOSScore = lazy(() => import('./pages/MOSScore/MOSScore'));
const Finance = lazy(() => import('./pages/Finance/Finance'));
const Profitability = lazy(() => import('./pages/Profitability/Profitability'));
const NewBusiness = lazy(() => import('./pages/NewBusiness/NewBusiness'));
const BusinessIntel = lazy(() => import('./pages/BusinessIntel/BusinessIntel'));
const SettingsPage = lazy(() => import('./pages/Settings/Settings'));
const AIAgents = lazy(() => import('./pages/AIAgents/AIAgents'));
const AICopilot = lazy(() => import('./pages/AICopilot/AICopilot'));
const Benchmarks = lazy(() => import('./pages/Benchmarks/Benchmarks'));
const Marketplace = lazy(() => import('./pages/Marketplace/Marketplace'));
const ClientChatGPTPage = lazy(() => import('./pages/ClientChatGPTPage/ClientChatGPTPage'));
const ClientCanvaPage = lazy(() => import('./pages/ClientCanvaPage/ClientCanvaPage'));

// Agency portal tabs
const OverviewTab = lazy(() => import('./pages/AgencyPortal/tabs/OverviewTab'));
const ClientsTab = lazy(() => import('./pages/AgencyPortal/tabs/ClientsTab'));
const AgencyPerformanceTab = lazy(() => import('./pages/AgencyPortal/tabs/PerformanceTab'));
const AgencyTasksTab = lazy(() => import('./pages/AgencyPortal/tabs/TasksTab'));
const AgencyBillingTab = lazy(() => import('./pages/AgencyPortal/tabs/BillingTab'));
const AgencySupportTab = lazy(() => import('./pages/AgencyPortal/tabs/SupportTab'));

// Client portal tabs
const ClientDashboardTab = lazy(() => import('./pages/ClientPortal/tabs/DashboardTab'));
const ClientPerformanceTab = lazy(() => import('./pages/ClientPortal/tabs/MyPerformanceTab'));
const ClientLeadsTab = lazy(() => import('./pages/ClientPortal/tabs/LeadsTab'));
const ClientTasksTab = lazy(() => import('./pages/ClientPortal/tabs/TasksTab'));
const ClientStoreTab = lazy(() => import('./pages/ClientPortal/tabs/StoreTab'));
const ClientBillingTab = lazy(() => import('./pages/ClientPortal/tabs/BillingTab'));
const ClientSupportTab = lazy(() => import('./pages/ClientPortal/tabs/SupportTab'));
const ClientWebsiteTab = lazy(() => import('./pages/ClientPortal/tabs/ClientWebsiteTab'));

// Super admin
const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdmin/Dashboard'));
const SuperAdminCompanies = lazy(() => import('./pages/SuperAdmin/Companies'));
const SuperAdminSubscriptions = lazy(() => import('./pages/SuperAdmin/Subscriptions'));
const SuperAdminIntegrations = lazy(() => import('./pages/SuperAdmin/Integrations'));
const SuperAdminAdmins = lazy(() => import('./pages/SuperAdmin/Admins'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const ProtectedRoute = ({ allowedRoles }) => {
  const { role } = useAuth();

  if (!role) return <Navigate to="/signin" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/dashboard" replace />;
    if (role === 'agency') return <Navigate to="/agency/overview" replace />;
    if (role === 'client') return <Navigate to="/client/dashboard" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};


const AppRoutes = () => {
  const { role } = useAuth();

  return (
    <Suspense fallback={<div style={{ padding: 24, fontWeight: 700 }}>Loading…</div>}>
      <Routes>
        <Route
          path="/signin"
          element={
            role ? (
              <Navigate
                to={
                  role === 'superadmin'
                    ? '/superadmin/dashboard'
                    : role === 'admin'
                      ? '/dashboard'
                      : role === 'agency'
                        ? '/agency/overview'
                        : '/client/dashboard'
                }
                replace
              />
            ) : (
              <SignIn />
            )
          }
        />

        {/*
          Storefront Preview — unauthenticated on purpose, same as a real
          shopper would see. Used by StorePreviewModal's "Open in new tab"
          action; mounts the same StorefrontApp component the modal does.
        */}
        <Route path="/preview/store/:storeId" element={<StorefrontPreviewPage />} />

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="companies" element={<SuperAdminCompanies />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="integrations" element={<SuperAdminIntegrations />} />
            <Route path="admins" element={<SuperAdminAdmins />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="clients/accounts" element={<Accounts />} />
            <Route path="clients/sla" element={<SLA />} />
            <Route path="clients/portal" element={<PortalSettings />} />

            <Route path="workspace/strategy" element={<Strategy />} />
            <Route path="workspace/seo" element={<SEO />} />
            <Route path="workspace/content" element={<Content />} />
            <Route path="workspace/aistudio" element={<Creative />} />
            <Route path="workspace/social" element={<SocialMedia />} />
            <Route path="workspace/ads" element={<PerformanceAds />} />
            <Route path="workspace/crm" element={<CRM />} />
            <Route path="workspace/automation" element={<Automation />} />
            <Route path="workspace/tasks" element={<Tasks />} />
            {/*
              FIX: workspace/website/* still mounts WebsiteBuilder (the tab shell).
              The old /workspace/website/builder/:websiteId/:pageId builder route
              is REMOVED. All edit navigation now uses /websites/:websiteId/pages/:pageId.
            */}
            <Route path="workspace/website/*" element={<WebsiteBuilder />} />
            <Route path="/website/setup" element={<WebsiteSetupPage />} />


            <Route path="intelligence/analytics" element={<Analytics />} />
            <Route path="intelligence/mos" element={<MOSScore />} />
            <Route path="intelligence/copilot" element={<AICopilot />} />
            <Route path="intelligence/chatgpt" element={<ClientChatGPTPage />} />
            <Route path="intelligence/canva" element={<ClientCanvaPage />} />
            <Route path="intelligence/agents" element={<AIAgents />} />
            <Route path="intelligence/benchmarks" element={<Benchmarks />} />
            <Route path="intelligence/reporting" element={<Reports />} />

            <Route path="ops/team" element={<Teams />} />
            <Route path="ops/time" element={<TimeTracking />} />
            <Route path="ops/resources" element={<Resources />} />
            <Route path="ops/finance" element={<Finance />} />
            <Route path="ops/profitability" element={<Profitability />} />
            <Route path="ops/newbusiness" element={<NewBusiness />} />
            <Route path="ops/businessintel" element={<BusinessIntel />} />

            <Route path="settings/company" element={<SettingsPage />} />
            <Route path="settings/marketplace" element={<Marketplace />} />
            <Route
              path="settings/users"
              element={<PlaceholderPage title="User Settings" description="Manage user preferences." icon={Users} />}
            />
            <Route
              path="settings/roles"
              element={<PlaceholderPage title="Roles & Permissions" description="Define role-based access control." icon={Shield} />}
            />
            <Route
              path="settings/integrations"
              element={<PlaceholderPage title="Integrations" description="Connect third-party apps and APIs." icon={Zap} />}
            />
            <Route
              path="settings/notifications"
              element={<PlaceholderPage title="Notifications" description="Configure email and in-app alerts." icon={Bell} />}
            />
            <Route
              path="settings/billing"
              element={<PlaceholderPage title="Billing" description="Manage subscription plans and payment methods." icon={CreditCard} />}
            />
            <Route
              path="settings/audit"
              element={<PlaceholderPage title="Audit Logs" description="Review system activity and security events." icon={Activity} />}
            />
          </Route>
        </Route>

        {/*
          CANONICAL BUILDER ROUTES — outside AppLayout (no sidebar/header).

          FIX: Removed the old /workspace/website/builder/:websiteId/:pageId route entirely.
          The single canonical route for the page editor is:
            /websites/:websiteId/pages/:pageId  →  BccBuilder
          The wrapper route /websites/:websiteId  →  WebsitesRouteWrapper
          automatically redirects to the first page using the canonical URL.

          Both BccBuilder and WebsitesRouteWrapper read { websiteId, pageId }
          from useParams(), which matches the :websiteId / :pageId param names
          defined here — so refresh always works with no blank screen.
        */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
          {/* Step 1 — website-only URL: redirect to first page */}
          <Route path="websites/:websiteId" element={<WebsitesRouteWrapper />} />
          {/* Step 2 — CANONICAL full-screen page editor */}
          <Route
            path="websites/:websiteId/pages/:pageId"
            element={<BccBuilder />}
          />

          {/*
            Store-module counterpart of the routes above. Reuses the same
            GrapesJS builder (BccBuilder) — only the data it loads/saves
            differs (StorePage instead of WebsitePage), which BccBuilder
            detects from the :storeId param.
          */}
          <Route
            path="stores/:storeId/pages/:pageId"
            element={<BccBuilder />}
          />
        </Route>


        {/* Agency Routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin', 'agency']} />}>
          <Route path="/agency" element={<AgencyLayout />}>
            <Route index element={<Navigate to="/agency/overview" replace />} />
            <Route path="overview" element={<OverviewTab />} />
            <Route path="clients" element={<ClientsTab />} />
            <Route path="performance" element={<AgencyPerformanceTab />} />
            <Route path="tasks" element={<AgencyTasksTab />} />
            <Route path="billing" element={<AgencyBillingTab />} />
            <Route path="support" element={<AgencySupportTab />} />
          </Route>
        </Route>

        {/* Client Routes */}
        <Route element={<ProtectedRoute allowedRoles={['superadmin', 'client']} />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboardTab />} />
            <Route path="performance" element={<ClientPerformanceTab />} />
            <Route path="leads" element={<ClientLeadsTab />} />
            <Route path="website/*" element={<ClientWebsiteTab />} />
            <Route path="tasks" element={<ClientTasksTab />} />
            <Route path="store" element={<ClientStoreTab />} />
            <Route path="billing" element={<ClientBillingTab />} />
            <Route path="support" element={<ClientSupportTab />} />
          </Route>
        </Route>

        <Route path="*" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'agency', 'client']} />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <FeatureProvider>
          <LayoutProvider>
            <AppRoutes />
          </LayoutProvider>
        </FeatureProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;