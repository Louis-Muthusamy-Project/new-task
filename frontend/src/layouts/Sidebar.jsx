import React from 'react';
import { Layout, Menu, Drawer, Grid } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, HeartHandshake, Monitor, Target, Search, FileText, 
  Sparkles, MessageCircle, TrendingUp, Zap, CheckSquare, Globe, PieChart, 
  BarChart2, GitMerge, LineChart, Lightbulb, Calendar, DollarSign, File, 
  Store, Book, Library, Settings as SettingsIcon, Shield, Bell, CreditCard, Activity, Clock, Briefcase, Bot, Award, AlertTriangle, Palette
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLayoutContext } from '../contexts/LayoutContext';

const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { mobileMenuOpen, setMobileMenuOpen } = useLayoutContext();
  const screens = Grid.useBreakpoint();

  const getIcon = (IconCmp) => <IconCmp size={16} strokeWidth={2} />;

  const getBadge = (text, type) => {
    let bg = 'var(--bg-tertiary)';
    let color = 'var(--text-secondary)';
    if (type === 'alert') { bg = 'rgba(239, 68, 68, 0.2)'; color = '#ef4444'; }
    if (type === 'warning') { bg = 'rgba(245, 158, 11, 0.2)'; color = '#f59e0b'; }
    if (type === 'success') { bg = 'rgba(16, 185, 129, 0.2)'; color = '#10b981'; }
    if (type === 'teal') { bg = 'rgba(13, 148, 136, 0.2)'; color = '#0d9488'; }

    return (
      <span style={{ 
        background: bg, color: color, padding: '2px 8px', borderRadius: 12, 
        fontSize: 10, fontWeight: 700, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4
      }}>
        {text}
      </span>
    );
  };

  const getLabel = (text, badgeText, badgeType) => {
    if (!badgeText) return text;
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {text}
        {getBadge(badgeText, badgeType)}
      </div>
    );
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: getIcon(LayoutDashboard),
      label: 'Command Center',
    },
    { type: 'divider' },
    {
      key: 'clients',
      label: collapsed ? 'CLI' : 'CLIENTS',
      children: [
        { key: '/clients/accounts', icon: getIcon(Users), label: getLabel('Accounts', '12', 'default') },
        { key: '/clients/sla', icon: getIcon(Shield), label: getLabel('SLA & Success', '3⚠', 'alert') },
        { key: '/clients/portal', icon: getIcon(Monitor), label: 'Portal Settings' },
      ],
    },
    { type: 'divider' },
    {
      key: 'workspace',
      label: collapsed ? 'WRK' : 'WORKSPACE',
      children: [
        { key: '/workspace/strategy', icon: getIcon(Target), label: 'Strategy' },
        { key: '/workspace/seo', icon: getIcon(Search), label: 'SEO / AEO / GEO' },
        { key: '/workspace/content', icon: getIcon(FileText), label: 'Content' },
        { key: '/workspace/aistudio', icon: getIcon(Palette), label: 'AI Studio' },
        { key: '/workspace/social', icon: getIcon(GitMerge), label: 'Social Media' },
        { key: '/workspace/ads', icon: getIcon(BarChart2), label: 'Performance Ads' },
        { key: '/workspace/crm', icon: getIcon(LineChart), label: getLabel('CRM & Leads', '142', 'default') },
        { key: '/workspace/automation', icon: getIcon(Zap), label: 'Automation' },
        { key: '/workspace/tasks', icon: getIcon(CheckSquare), label: 'Task Management' },
        { key: '/workspace/website', icon: getIcon(Globe), label: 'Websites' },
      ],
    },
    { type: 'divider' },
    {
      key: 'intelligence',
      label: collapsed ? 'INT' : 'INTELLIGENCE',
      children: [
        
        { key: '/intelligence/analytics', icon: getIcon(TrendingUp), label: 'Analytics & Attribution' },
        { key: '/intelligence/mos', icon: getIcon(Activity), label: getLabel('MOS Score', '68', 'warning') },
        { key: '/intelligence/copilot', icon: getIcon(MessageCircle), label: 'AI Co-Pilot' },
        { key: '/intelligence/chatgpt', icon: getIcon(MessageCircle), label: 'ChatGPT' },
        { key: '/intelligence/canva', icon: getIcon(Palette), label: 'Canva' },
        { key: '/intelligence/agents', icon: getIcon(Bot), label: getLabel('Ai Agent', 'teal') },
        { key: '/intelligence/benchmarks', icon: getIcon(Award), label: 'Benchmarks' },
        { key: '/intelligence/reporting', icon: getIcon(FileText), label: 'Reports' },
      ],
    },
    { type: 'divider' },
    {
      key: 'ops',
      label: collapsed ? 'OPS' : 'AGENCY OPS',
      children: [
        { key: '/ops/team', icon: getIcon(Users), label: getLabel('People', '5', 'default') },
        { key: '/ops/time', icon: getIcon(Clock), label: 'Time Tracking' },
        { key: '/ops/resources', icon: getIcon(Calendar), label: 'Resources' },
        { key: '/ops/finance', icon: getIcon(CreditCard), label: 'Finance' },
        { key: '/ops/profitability', icon: getIcon(DollarSign), label: 'Profitability' },
        { key: '/ops/newbusiness', icon: getIcon(Briefcase), label: getLabel('New Business', '8', 'default') },
        { key: '/ops/businessintel', icon: getIcon(PieChart), label: 'Business Intel' },
      ],
    },
    { type: 'divider' },
    {
      key: 'settings',
      label: collapsed ? 'SET' : 'SETTINGS',
      children: [
        { key: '/settings/company', icon: getIcon(SettingsIcon), label: 'Settings' },
        { key: '/settings/marketplace', icon: getIcon(Store), label: 'Master Item' },
      ],
    },
  ];

  const getSelectedKeys = () => [location.pathname];

  const sidebarContent = (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={(value) => setCollapsed(value)}
      width={280}
      theme={isDark ? 'dark' : 'light'}
      style={{
        borderRight: `1px solid var(--border-color)`,
        boxShadow: 'var(--shadow-sm)',
        zIndex: 10,
        overflow: 'hidden',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', background: 'var(--bg-primary)', zIndex: 11, borderBottom: '1px solid var(--border-color)' }}>
        {collapsed ? (
          <div style={{ background: '#0d9488', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>M1</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ background: '#0d9488', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>M1</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: 16, lineHeight: 1, color: 'var(--text-primary)' }}>M1</span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: 'var(--text-secondary)' }}>AGENCY GROWTH OS</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ height: 'calc(100vh - 72px)', overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={['clients', 'workspace', 'intelligence', 'ops', 'settings']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, paddingBottom: 60, paddingTop: 16 }}
        />
      </div>
    </Sider>
  );

  if (!screens.lg && screens.lg !== undefined) {
    return (
        <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0, overflow: 'hidden' } }}
        size="default"
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return sidebarContent;
};

export default Sidebar;
