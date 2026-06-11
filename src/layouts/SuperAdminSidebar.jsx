import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, CreditCard, Zap, Shield, Users
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const { Sider } = Layout;

const SuperAdminSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const getIcon = (IconCmp) => <IconCmp size={16} strokeWidth={2} />;

  const menuItems = [
    {
      key: '/superadmin/dashboard',
      icon: getIcon(LayoutDashboard),
      label: 'Platform Overview',
    },
    { type: 'divider' },
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
    { type: 'divider' },
    {
      key: '/superadmin/admins',
      icon: getIcon(Users),
      label: 'Super Admins',
    },
  ];

  const getSelectedKeys = () => [location.pathname];

  return (
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
          <div style={{ background: '#7c3aed', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>SA</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ background: '#7c3aed', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>SA</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: 16, lineHeight: 1, color: 'var(--text-primary)' }}>SUPER ADMIN</span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: 'var(--text-secondary)' }}>M1 PLATFORM</span>
            </div>
          </div>
        )}
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
};

export default SuperAdminSidebar;
