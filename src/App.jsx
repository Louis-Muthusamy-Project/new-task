import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import PlaceholderPage from './components/PlaceholderPage';
import { 
  Users, HeartHandshake, Monitor, MessageCircle, TrendingUp, Zap, 
  CheckSquare, Globe, PieChart, BarChart2, GitMerge, LineChart, 
  Lightbulb, Calendar, DollarSign, File, Store, Book, Library, Shield, Bell, CreditCard, Activity, Bot, Award
} from 'lucide-react';

// Actual Pages
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import WebsiteBuilder from './pages/WebsiteBuilder';
import Strategy from './pages/Strategy';
import SEO from './pages/SEO';
import Content from './pages/Content';
import Creative from './pages/Creative';
import SocialMedia from './pages/SocialMedia';
import PerformanceAds from './pages/PerformanceAds';
import Accounts from './pages/Accounts';
import SLA from './pages/SLA';
import PortalSettings from './pages/PortalSettings';
import Analytics from './pages/Analytics';
import Automation from './pages/Automation';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Teams from './pages/Teams';
import TimeTracking from './pages/TimeTracking';
import Resources from './pages/Resources';
import MOSScore from './pages/MOSScore';
import Finance from './pages/Finance';
import Profitability from './pages/Profitability';
import NewBusiness from './pages/NewBusiness';
import BusinessIntel from './pages/BusinessIntel';
import SettingsPage from './pages/Settings';
import AIAgents from './pages/AIAgents';
import AICopilot from './pages/AICopilot';
import Benchmarks from './pages/Benchmarks';
import Marketplace from './pages/Marketplace';
import AgencyPortal from './pages/AgencyPortal';
import ClientPortal from './pages/ClientPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Section 1 */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Section 2: Clients */}
          <Route path="clients/accounts" element={<Accounts />} />
          <Route path="clients/sla" element={<SLA />} />
          <Route path="clients/portal" element={<PortalSettings />} />

          {/* Section 3: Workspace */}
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

          {/* Section 4: Intelligence */}
          <Route path="intelligence/analytics" element={<Analytics />} />
          <Route path="intelligence/mos" element={<MOSScore />} />
          <Route path="intelligence/copilot" element={<AICopilot />} />
          <Route path="intelligence/agents" element={<AIAgents />} />
          <Route path="intelligence/benchmarks" element={<Benchmarks />} />
          <Route path="intelligence/reporting" element={<Reports />} />

          {/* Section 5: Agency Ops */}
          <Route path="ops/team" element={<Teams />} />
          <Route path="ops/time" element={<TimeTracking />} />
          <Route path="ops/resources" element={<Resources />} />
          <Route path="ops/finance" element={<Finance />} />
          <Route path="ops/profitability" element={<Profitability />} />
          <Route path="ops/newbusiness" element={<NewBusiness />} />
          <Route path="ops/businessintel" element={<BusinessIntel />} />

          {/* Section 6: Settings */}
          <Route path="settings/company" element={<SettingsPage />} />
          <Route path="settings/marketplace" element={<Marketplace />} />
          <Route path="settings/agency" element={<AgencyPortal />} />
          <Route path="settings/client" element={<ClientPortal />} />
          <Route path="settings/users" element={<PlaceholderPage title="User Settings" description="Manage user preferences." icon={Users} />} />
          <Route path="settings/roles" element={<PlaceholderPage title="Roles & Permissions" description="Define role-based access control." icon={Shield} />} />
          <Route path="settings/integrations" element={<PlaceholderPage title="Integrations" description="Connect third-party apps and APIs." icon={Zap} />} />
          <Route path="settings/notifications" element={<PlaceholderPage title="Notifications" description="Configure email and in-app alerts." icon={Bell} />} />
          <Route path="settings/billing" element={<PlaceholderPage title="Billing" description="Manage subscription plans and payment methods." icon={CreditCard} />} />
          <Route path="settings/audit" element={<PlaceholderPage title="Audit Logs" description="Review system activity and security events." icon={Activity} />} />

          {/* Catch all */}
          <Route path="*" element={<div style={{ padding: 24, textAlign: 'center', marginTop: 40 }}><h2 style={{color: 'var(--text-primary)'}}>404 - Page Not Found</h2></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
