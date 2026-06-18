import React, { useState } from 'react';
import { Typography, Button, Select } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutDashboard, Zap, ClipboardList, Settings } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import MyWorkflowsTab from './tabs/MyWorkflowsTab';
import EventLogsTab from './tabs/EventLogsTab';
import WorkflowBuilderPage from './tabs/WorkflowBuilderPage';
import CreateWorkflowModal from './tabs/CreateWorkflowModal';

const { Title, Text } = Typography;
const { Option } = Select;

const Automation = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showCreateModal, setShowCreate] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);

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

  const handleCreateWorkflow = (data) => {
    setShowCreate(false);
    setEditingWorkflow({ id: null, name: data.name, type: data.type, isNew: true });
  };

  const handleOpenBuilder = (wf) => setEditingWorkflow(wf);
  const handleCloseBuilder = () => setEditingWorkflow(null);

  if (editingWorkflow) {
    return (
      <WorkflowBuilderPage
        workflow={editingWorkflow}
        onClose={handleCloseBuilder}
      />
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'Overview': return <OverviewTab itemVariants={itemVariants} onOpenBuilder={handleOpenBuilder} />;
      case 'My Workflows': return <MyWorkflowsTab itemVariants={itemVariants} onOpenBuilder={handleOpenBuilder} />;
      case 'Event Logs': return <EventLogsTab itemVariants={itemVariants} />;
      default: return <OverviewTab itemVariants={itemVariants} onOpenBuilder={handleOpenBuilder} />;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Marketing Automation</Title>
          <Text type="secondary">Build, manage, and monitor automated workflows across the client lifecycle.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select defaultValue="Prestige Estates" style={{ width: 200, fontWeight: 600 }} size="large"><Option value="Prestige Estates">Prestige Estates</Option></Select>
          <Button icon={<Settings size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Settings</Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setShowCreate(true)} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>New Workflow</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="glassmorphism" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          {/* Interactive Tabs */}
          <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', marginBottom: 24, overflowX: 'auto' }}>
            {[
              { id: 'Overview', icon: <LayoutDashboard size={16}/> },
              { id: 'My Workflows', icon: <Zap size={16}/> },
              { id: 'Event Logs', icon: <ClipboardList size={16}/> }
            ].map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  paddingBottom: 12, 
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent-secondary)' : '2px solid transparent', 
                  fontWeight: activeTab === tab.id ? 700 : 500, 
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ color: activeTab === tab.id ? 'var(--accent-secondary)' : 'var(--text-tertiary)' }}>{tab.icon}</span> 
                {tab.id}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <CreateWorkflowModal
        visible={showCreateModal}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateWorkflow}
      />

    </motion.div>
  );
};

export default Automation;
