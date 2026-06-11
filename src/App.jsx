import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './pages/SignIn/SignIn';

// Layouts
import AppLayout from './layouts/AppLayout';
import AgencyLayout from './layouts/AgencyLayout';
import ClientLayout from './layouts/ClientLayout';
import PlaceholderPage from './components/PlaceholderPage';
import { 
  Users, HeartHandshake, Monitor, MessageCircle, TrendingUp, Zap, 
  CheckSquare, Globe, PieChart, BarChart2, GitMerge, LineChart, 
  Lightbulb, Calendar, DollarSign, File, Store, Book, Library, Shield, Bell, CreditCard, Activity, Bot, Award
} from 'lucide-react';

// Admin Pages
import Dashboard from './pages/Dashboard/Dashboard';
import CRM from './pages/CRM/CRM';
import WebsiteBuilder from './pages/WebsiteBuilder/WebsiteBuilder';
import Strategy from './pages/Strategy/Strategy';
import SEO from './pages/SEO/SEO';
import Content from './pages/Content/Content';
import Creative from './pages/Creative/Creative';
import SocialMedia from './pages/SocialMedia/SocialMedia';
import PerformanceAds from './pages/PerformanceAds/PerformanceAds';
import Accounts from './pages/Accounts/Accounts';
import SLA from './pages/SLA/SLA';
import PortalSettings from './pages/PortalSettings/PortalSettings';
import Analytics from './pages/Analytics/Analytics';
import Automation from './pages/Automation/Automation';
import Tasks from './pages/Tasks/Tasks';
import Reports from './pages/Reports/Reports';
import Teams from './pages/Teams/Teams';
import TimeTracking from './pages/TimeTracking/TimeTracking';
import Resources from './pages/Resources/Resources';
import MOSScore from './pages/MOSScore/MOSScore';
import Finance from './pages/Finance/Finance';
import Profitability from './pages/Profitability/Profitability';
import NewBusiness from './pages/NewBusiness/NewBusiness';
import BusinessIntel from './pages/BusinessIntel/BusinessIntel';
import SettingsPage from './pages/Settings/Settings';
import AIAgents from './pages/AIAgents/AIAgents';
import AICopilot from './pages/AICopilot/AICopilot';
import Benchmarks from './pages/Benchmarks/Benchmarks';
import Marketplace from './pages/Marketplace/Marketplace';
import ClientChatGPTPage from './pages/ClientChatGPTPage/ClientChatGPTPage';
import ClientCanvaPage from './pages/ClientCanvaPage/ClientCanvaPage';

// Agency Portal Tabs
import OverviewTab from './pages/AgencyPortal/tabs/OverviewTab';
import ClientsTab from './pages/AgencyPortal/tabs/ClientsTab';
import AgencyPerformanceTab from './pages/AgencyPortal/tabs/PerformanceTab';
import AgencyTasksTab from './pages/AgencyPortal/tabs/TasksTab';
import AgencyBillingTab from './pages/AgencyPortal/tabs/BillingTab';
import AgencySupportTab from './pages/AgencyPortal/tabs/SupportTab';

// Client Portal Tabs
import ClientDashboardTab from './pages/ClientPortal/tabs/DashboardTab';
import ClientPerformanceTab from './pages/ClientPortal/tabs/MyPerformanceTab';
import ClientLeadsTab from './pages/ClientPortal/tabs/LeadsTab';
import ClientTasksTab from './pages/ClientPortal/tabs/TasksTab';
import ClientStoreTab from './pages/ClientPortal/tabs/StoreTab';
import ClientBillingTab from './pages/ClientPortal/tabs/BillingTab';
import ClientSupportTab from './pages/ClientPortal/tabs/SupportTab';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Component
const ProtectedRoute = ({ allowedRoles }) => {
  const { role } = useAuth();
  
  if (!role) {
    return <Navigate to="/signin" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard if trying to access unauthorized route
    if (role === 'admin') return <Navigate to="/dashboard" replace />;
    if (role === 'agency') return <Navigate to="/agency/overview" replace />;
    if (role === 'client') return <Navigate to="/client/dashboard" replace />;
  }
  
  return <Outlet />;
};

const AppRoutes = () => {
  const { role } = useAuth();
  
  return (
    <Routes>
      <Route path="/signin" element={role ? <Navigate to={role === 'admin' ? '/dashboard' : role === 'agency' ? '/agency/overview' : '/client/dashboard'} replace /> : <SignIn />} />
      
      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
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
          <Route path="workspace/website/*" element={<WebsiteBuilder />} />

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
          <Route path="settings/users" element={<PlaceholderPage title="User Settings" description="Manage user preferences." icon={Users} />} />
          <Route path="settings/roles" element={<PlaceholderPage title="Roles & Permissions" description="Define role-based access control." icon={Shield} />} />
          <Route path="settings/integrations" element={<PlaceholderPage title="Integrations" description="Connect third-party apps and APIs." icon={Zap} />} />
          <Route path="settings/notifications" element={<PlaceholderPage title="Notifications" description="Configure email and in-app alerts." icon={Bell} />} />
          <Route path="settings/billing" element={<PlaceholderPage title="Billing" description="Manage subscription plans and payment methods." icon={CreditCard} />} />
          <Route path="settings/audit" element={<PlaceholderPage title="Audit Logs" description="Review system activity and security events." icon={Activity} />} />
        </Route>
      </Route>

      {/* Agency Routes */}
      <Route element={<ProtectedRoute allowedRoles={['agency']} />}>
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
      <Route element={<ProtectedRoute allowedRoles={['client']} />}>
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboardTab />} />
          <Route path="performance" element={<ClientPerformanceTab />} />
          <Route path="leads" element={<ClientLeadsTab />} />
          <Route path="tasks" element={<ClientTasksTab />} />
          <Route path="store" element={<ClientStoreTab />} />
          <Route path="billing" element={<ClientBillingTab />} />
          <Route path="support" element={<ClientSupportTab />} />
        </Route>
      </Route>

      {/* Catch all - Redirect to sign in if no role, otherwise to respective dashboard */}
      <Route path="*" element={<ProtectedRoute allowedRoles={['admin', 'agency', 'client']} />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
