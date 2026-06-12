import React from 'react';
import { Layout, Menu, Drawer, Grid } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLayoutContext } from '../contexts/LayoutContext';
import { LayoutDashboard, Users, TrendingUp, CheckSquare, CreditCard, HelpCircle } from 'lucide-react';

const { Sider } = Layout;

const AgencySidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { mobileMenuOpen, setMobileMenuOpen } = useLayoutContext();
  const screens = Grid.useBreakpoint();

  const getIcon = (IconCmp) => <IconCmp size={16} strokeWidth={2} />;

  const menuItems = [
    { key: '/agency/overview', icon: getIcon(LayoutDashboard), label: 'Overview' },
    { key: '/agency/clients', icon: getIcon(Users), label: 'Clients' },
    { key: '/agency/performance', icon: getIcon(TrendingUp), label: 'Performance' },
    { key: '/agency/tasks', icon: getIcon(CheckSquare), label: 'Tasks' },
    { key: '/agency/billing', icon: getIcon(CreditCard), label: 'Billing' },
    { key: '/agency/support', icon: getIcon(HelpCircle), label: 'Support' },
  ];

  const getSelectedKeys = () => {
    // Exact match or active parent
    const match = menuItems.find(item => location.pathname.startsWith(item.key));
    return match ? [match.key] : ['/agency/overview'];
  };

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
          <div style={{ background: '#3b82f6', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>BCC</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ background: '#3b82f6', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>BCC</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: 16, lineHeight: 1, color: 'var(--text-primary)' }}>BCC Martech</span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: 'var(--text-secondary)' }}>AGENCY PORTAL</span>
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

export default AgencySidebar;
