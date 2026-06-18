import React, { useState } from 'react';
import { Typography, Tabs } from 'antd';
import { motion } from 'framer-motion';
import AdminDashboard from './AdminDashboard';
import AdminLeadsList from './AdminLeadsList';

const { Title, Text } = Typography;

const CRM = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Administration
          </Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>
            Leads Management Hub
          </Title>
          <Text type="secondary">
            Track lead status, conversion, and pipeline movement across all agencies and clients.
          </Text>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
          items={[
            {
              key: 'dashboard',
              label: <strong style={{ fontWeight: 600 }}>Dashboard</strong>,
              children: <AdminDashboard />
            },
            {
              key: 'leads',
              label: <strong style={{ fontWeight: 600 }}>Leads List</strong>,
              children: <AdminLeadsList />
            }
          ]}
        />
      </div>
    </motion.div>
  );
};

export default CRM;
