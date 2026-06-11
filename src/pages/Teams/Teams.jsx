import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamOverviewTab from './tabs/TeamOverviewTab';
import HRMSTab from './tabs/HRMSTab';

const Teams = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <TeamOverviewTab />;
      case 'hrms': return <HRMSTab />;
      default: return <TeamOverviewTab />;
    }
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Top Tab Navigation */}
      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        {[
          { id: 'overview', label: 'Team Overview' },
          { id: 'hrms', label: 'HRMS' }
        ].map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <div 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                paddingBottom: 16, 
                borderBottom: isActive ? '2px solid var(--accent-secondary)' : '2px solid transparent', 
                color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)', 
                fontWeight: isActive ? 700 : 600, 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

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
    </div>
  );
};

export default Teams;
