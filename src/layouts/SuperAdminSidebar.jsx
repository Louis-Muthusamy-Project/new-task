import React from 'react';
import { Layout, Menu, Drawer, Grid } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, CreditCard, Zap, Shield, Users, Globe
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLayoutContext } from '../contexts/LayoutContext';

const { Sider } = Layout;

const SuperAdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { mobileMenuOpen, setMobileMenuOpen } = useLayoutContext();
  const screens = Grid.useBreakpoint();

  const getIcon = (IconCmp) => <IconCmp size={16} strokeWidth={2} />;

  const menuItems = [
    {
      key: '/superadmin/dashboard',
      icon: getIcon(LayoutDashboard),
      label: 'Platform Overview',
    },
    {
      key: '/superadmin/companies',
      icon: getIcon(Building2),
      label: 'Companies / Agencies',
    },
    {
      key: '/superadmin/subscriptions',
      icon: getIcon(CreditCard),
      label: 'Subscriptions & Billing',
    },
    {
      key: '/superadmin/integrations',
      icon: getIcon(Zap),
      label: 'Global Integrations',
    },
    {
      key: '/superadmin/admins',
      icon: getIcon(Users),
      label: 'User Management',
    },
    {
      key: 'platform-views',
      icon: getIcon(Globe),
      label: 'Platform Views',
      children: [
        {
          key: '/dashboard',
          label: 'Admin Portal',
        },
        {
          key: '/agency/overview',
          label: 'Agency Portal',
        },
        {
          key: '/client/dashboard',
          label: 'Client Portal',
        },
      ]
    },
  ];

  const getSelectedKeys = () => [location.pathname];

  const sidebarContent = (
    <Sider 
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <div style={{ background: '#7c3aed', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>SA</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: 16, lineHeight: 1, color: 'var(--text-primary)' }}>SUPER ADMIN</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: 'var(--text-secondary)' }}>M1 PLATFORM</span>
          </div>
        </div>
      </div>
      <div style={{ height: 'calc(100vh - 72px)', overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
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
        bodyStyle={{ padding: 0, overflow: 'hidden' }}
        width={280}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return sidebarContent;
};

export default SuperAdminSidebar;
