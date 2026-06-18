import React, { useState } from 'react';
import { Layout, Menu, Typography, Dropdown, Avatar, Button, Space, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sun, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Import Tabs
import DashboardTab from './tabs/DashboardTab';
import MyPerformanceTab from './tabs/MyPerformanceTab';
import LeadsTab from './tabs/LeadsTab';
import TasksTab from './tabs/TasksTab';
import StoreTab from './tabs/StoreTab';
import BillingTab from './tabs/BillingTab';
import SupportTab from './tabs/SupportTab';

const { Header, Content } = Layout;
const { Text } = Typography;

const ClientPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'performance', label: 'My Performance' },
    { key: 'leads', label: 'Leads' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'store', label: 'Store' },
    { key: 'billing', label: 'Billing' },
    { key: 'support', label: 'Support' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'performance': return <MyPerformanceTab />;
      case 'leads': return <LeadsTab />;
      case 'tasks': return <TasksTab />;
      case 'store': return <StoreTab />;
      case 'billing': return <BillingTab />;
      case 'support': return <SupportTab />;
      default:
        return <DashboardTab />; // fallback
    }
  };

  const accountMenu = (
    <Menu>
      <Menu.Item key="1">Profile</Menu.Item>
      <Menu.Item key="2">Company Details</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3" danger>Log out</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Custom Full-Width Header */}
      <Header style={{ 
        background: 'var(--bg-secondary)', 
        padding: '0 32px', 
        height: 80, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Left: Client Logo & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-primary)', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            PE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Text style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>Prestige Estates</Text>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>Powered by BCC Martech</Text>
          </div>
        </div>

        {/* Middle: Tab Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <div 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{ 
                  padding: '0 24px', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Text style={{ 
                  fontWeight: isActive ? 800 : 600, 
                  fontSize: 14, 
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  transition: 'color 0.2s'
                }}>
                  {tab.label}
                </Text>
                {isActive && (
                  <motion.div 
                    layoutId="client-active-tab-indicator"
                    style={{
                      position: 'absolute',
                      bottom: 24,
                      left: '20%',
                      right: '20%',
                      height: 4,
                      borderRadius: 4,
                      background: 'var(--accent-primary)'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Actions & Profile */}
        <Space size={24} align="center">
          <Button type="text" icon={<Sun size={20} />} style={{ color: 'var(--text-secondary)' }} />
          <Badge dot color="var(--accent-danger)">
            <Button type="text" icon={<Bell size={20} />} style={{ color: 'var(--text-secondary)' }} />
          </Badge>
          
          <Dropdown overlay={accountMenu} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 16px', background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <Avatar style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }} size={32}>RK</Avatar>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <Text style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Rahul Kapoor</Text>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>Account Settings <ChevronDown size={12} style={{ verticalAlign: '-2px' }} /></Text>
              </div>
            </div>
          </Dropdown>
          
          <Button type="text" icon={<LogOut size={20} />} style={{ color: 'var(--text-secondary)' }} onClick={() => navigate('/dashboard')} />
        </Space>
      </Header>

      {/* Main Content Area */}
      <Content style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Content>
    </Layout>
  );
};

export default ClientPortal;
