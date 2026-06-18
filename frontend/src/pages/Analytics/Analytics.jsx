import React, { useState } from 'react';
import { Typography, Select, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calendar as CalendarIcon, BarChart2, PieChart as PieChartIcon } from 'lucide-react';

import AnalyticsTab from './tabs/AnalyticsTab';
import AttributionTab from './tabs/AttributionTab';

const { Title, Text } = Typography;
const { Option } = Select;

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('analytics');

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

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'analytics': return <AnalyticsTab />;
      case 'attribution': return <AttributionTab />;
      default: return <AnalyticsTab />;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>INTELLIGENCE</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>{activeTab === 'analytics' ? 'Analytics' : 'Attribution'}</Title>
          <Text type="secondary">
            {activeTab === 'analytics' ? 'Unified performance data across all channels and clients.' : 'Understand which channels and touchpoints drive conversions.'}
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select defaultValue="All Clients" style={{ width: 150, fontWeight: 600 }} size="large"><Option value="All Clients">All Clients</Option></Select>
          <Button icon={<CalendarIcon size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>May 10 - Jun 9, 2026</Button>
          {activeTab === 'analytics' && <Button type="primary" icon={<Download size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>Export</Button>}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', marginBottom: 32, overflowX: 'auto', paddingBottom: 2 }}>
        <div 
          onClick={() => setActiveTab('analytics')}
          style={{ 
            paddingBottom: 16, 
            borderBottom: activeTab === 'analytics' ? '3px solid var(--accent-secondary)' : '3px solid transparent', 
            fontWeight: activeTab === 'analytics' ? 700 : 600, 
            color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-secondary)', 
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' 
          }}
        >
          <BarChart2 size={18} color={activeTab === 'analytics' ? "var(--accent-secondary)" : "var(--text-secondary)"}/> Analytics
        </div>
        <div 
          onClick={() => setActiveTab('attribution')}
          style={{ 
            paddingBottom: 16, 
            borderBottom: activeTab === 'attribution' ? '3px solid var(--accent-secondary)' : '3px solid transparent', 
            fontWeight: activeTab === 'attribution' ? 700 : 600, 
            color: activeTab === 'attribution' ? 'var(--text-primary)' : 'var(--text-secondary)', 
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' 
          }}
        >
          <PieChartIcon size={18} color={activeTab === 'attribution' ? "var(--accent-secondary)" : "var(--text-secondary)"}/> Attribution
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -10 }}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.2, staggerChildren: 0.05 } }
          }}
        >
          {renderActiveTab()}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
};

export default Analytics;
