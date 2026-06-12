import React from 'react';
import { Layout, Menu, Drawer, Grid } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLayoutContext } from '../contexts/LayoutContext';
import { useFeatures } from '../contexts/FeatureContext';
import { LayoutDashboard, Target, Users, CheckSquare, ShoppingCart, CreditCard, HelpCircle, Globe } from 'lucide-react';

const { Sider } = Layout;

const ClientSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { mobileMenuOpen, setMobileMenuOpen } = useLayoutContext();
  const screens = Grid.useBreakpoint();

  const { hasFeature } = useFeatures();

  const getIcon = (IconCmp) => <IconCmp size={16} strokeWidth={2} />;

  const allMenuItems = [
    { key: '/client/dashboard', icon: getIcon(LayoutDashboard), label: 'Dashboard', featureId: 'dashboard' },
    { key: '/client/performance', icon: getIcon(Target), label: 'My Performance', featureId: 'performance' },
    { key: '/client/leads', icon: getIcon(Users), label: 'Leads', featureId: 'leads' },
    { key: '/client/website', icon: getIcon(Globe), label: 'Website', featureId: 'website' },
    { key: '/client/tasks', icon: getIcon(CheckSquare), label: 'Tasks', featureId: 'tasks' },
    { key: '/client/store', icon: getIcon(ShoppingCart), label: 'Store', featureId: 'store' },
    { key: '/client/billing', icon: getIcon(CreditCard), label: 'Billing', featureId: 'billing' },
    { key: '/client/support', icon: getIcon(HelpCircle), label: 'Support', featureId: 'support' },
  ];

  const menuItems = allMenuItems.filter(item => hasFeature(item.featureId));

  const getSelectedKeys = () => {
    // Exact match or active parent
    const match = menuItems.find(item => location.pathname.startsWith(item.key));
    return match ? [match.key] : ['/client/dashboard'];
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
          <div style={{ background: 'var(--accent-primary)', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>PE</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ background: 'var(--accent-primary)', color: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>PE</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: 16, lineHeight: 1, color: 'var(--text-primary)' }}>Prestige Estates</span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: 'var(--text-secondary)' }}>POWERED BY BCC MARTECH</span>
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

export default ClientSidebar;
