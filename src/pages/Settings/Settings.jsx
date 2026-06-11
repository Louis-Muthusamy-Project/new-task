import React, { useState } from 'react';
import { Typography, Tabs } from 'antd';
import { motion } from 'framer-motion';

import AgencyTab from './tabs/AgencyTab';
import IntegrationsTab from './tabs/IntegrationsTab';
import TeamAccessTab from './tabs/TeamAccessTab';
import NotificationsTab from './tabs/NotificationsTab';
import BackendConfigTab from './tabs/BackendConfigTab';
import AccessMatrixTab from './tabs/AccessMatrixTab';
import UserManagementTab from './tabs/UserManagementTab';

const { Title, Text } = Typography;

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('1');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 300, damping: 24 } 
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case '1': return <AgencyTab />;
      case '2': return <IntegrationsTab />;
      case '3': return <TeamAccessTab />;
      case '4': return <NotificationsTab />;
      case '5': return <BackendConfigTab />;
      case '6': return <AccessMatrixTab />;
      case '7': return <UserManagementTab />;
      default: return <AgencyTab />;
    }
  };

  const tabItems = [
    { key: '1', label: <strong style={{ fontWeight: 600 }}>Agency</strong> },
    { key: '2', label: <strong style={{ fontWeight: 600 }}>Integrations</strong> },
    { key: '3', label: <strong style={{ fontWeight: 600 }}>Team & Access</strong> },
    { key: '4', label: <strong style={{ fontWeight: 600 }}>Notifications</strong> },
    { key: '5', label: <strong style={{ fontWeight: 600 }}>Backend Config</strong> },
    { key: '6', label: <strong style={{ fontWeight: 600 }}>Access Matrix</strong> },
    { key: '7', label: <strong style={{ fontWeight: 600 }}>User Management</strong> },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>AGENCY OPS / CONTROL CENTRE</Text>
        <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Settings</Title>
        <Text type="secondary" style={{ fontWeight: 500 }}>Configure how the M1 platform works for BCC Martech.</Text>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          style={{ marginBottom: 32 }} 
          size="large"
          items={tabItems}
        />
      </motion.div>

      {renderContent()}

    </motion.div>
  );
};

export default SettingsPage;
