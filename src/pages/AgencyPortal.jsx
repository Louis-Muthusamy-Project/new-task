import React, { useState } from 'react';
import { Layout, Avatar, Button, Menu, Dropdown } from 'antd';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Tabs
import OverviewTab from './AgencyPortalTabs/OverviewTab';
import ClientsTab from './AgencyPortalTabs/ClientsTab';
import PerformanceTab from './AgencyPortalTabs/PerformanceTab';
import TasksTab from './AgencyPortalTabs/TasksTab';
import BillingTab from './AgencyPortalTabs/BillingTab';
import SupportTab from './AgencyPortalTabs/SupportTab';

const { Header, Content, Footer } = Layout;

const AgencyPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('clients');

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'clients', label: 'Clients' },
    { key: 'performance', label: 'Performance' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'billing', label: 'Billing' },
    { key: 'support', label: 'Support' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'clients': return <ClientsTab />;
      case 'performance': return <PerformanceTab />;
      case 'tasks': return <TasksTab />;
      case 'billing': return <BillingTab />;
      case 'support': return <SupportTab />;
      default: return <OverviewTab />;
    }
  };

  const userMenuItems = [
    { key: 'profile', label: 'My Profile' },
    { type: 'divider' },
    { key: 'logout', label: 'Logout', danger: true },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Custom Full-Width Header */}
      <Header style={{ 
        background: 'var(--bg-secondary)', 
        padding: '0 32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        height: 72,
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>
            BCC
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>BCC Martech</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>Agency Portal</span>
          </div>
        </div>

        {/* Center: Tabs */}
        <div style={{ display: 'flex', height: '100%' }}>
          {tabs.map(tab => (
            <div 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{ 
                height: '100%', 
                padding: '0 24px', 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.key ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
              className="hover-text-primary"
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Button 
            type="text" 
            icon={<ArrowLeft size={16} />} 
            onClick={() => navigate('/dashboard')}
            style={{ color: 'var(--text-secondary)', fontWeight: 600 }}
          >
            Back to M1
          </Button>

          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#F59E0B', fontWeight: 800, color: '#fff' }}>AS</Avatar>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Arjun Sharma</span>
              <ChevronDown size={14} color="var(--text-tertiary)" />
            </div>
          </Dropdown>
        </div>
      </Header>

      <Content style={{ overflow: 'initial' }}>
        {renderContent()}
      </Content>

      <Footer style={{ textAlign: 'center', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)', fontSize: 13, fontWeight: 500 }}>
        <span>© 2026 BCC Martech - Agency Portal</span>
        <span>Powered by M1</span>
      </Footer>
    </Layout>
  );
};

export default AgencyPortal;
