import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, Target, Users, CheckSquare, ShoppingCart, CreditCard, HelpCircle } from 'lucide-react';

const { Sider } = Layout;

const ClientSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const getIcon = (IconCmp) => <IconCmp size={16} strokeWidth={2} />;

  const menuItems = [
    { key: '/client/dashboard', icon: getIcon(LayoutDashboard), label: 'Dashboard' },
    { key: '/client/performance', icon: getIcon(Target), label: 'My Performance' },
    { key: '/client/leads', icon: getIcon(Users), label: 'Leads' },
    { key: '/client/tasks', icon: getIcon(CheckSquare), label: 'Tasks' },
    { key: '/client/store', icon: getIcon(ShoppingCart), label: 'Store' },
    { key: '/client/billing', icon: getIcon(CreditCard), label: 'Billing' },
    { key: '/client/support', icon: getIcon(HelpCircle), label: 'Support' },
  ];

  const getSelectedKeys = () => {
    // Exact match or active parent
    const match = menuItems.find(item => location.pathname.startsWith(item.key));
    return match ? [match.key] : ['/client/dashboard'];
  };

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
};

export default ClientSidebar;
