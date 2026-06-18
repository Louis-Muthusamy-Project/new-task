import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Select } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Plus, AlertCircle, FileText, PenTool, CheckCircle2 } from 'lucide-react';
import AIStudioTab from './tabs/AIStudioTab';
import TrendsTab from './tabs/TrendsTab';
import ListViewTab from './tabs/ListViewTab';
import CalendarViewTab from './tabs/CalendarViewTab';

const { Title, Text } = Typography;

const Content = () => {
  const [activeTab, setActiveTab] = useState(0);

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

  const renderTabContent = () => {
    switch(activeTab) {
      case 0: return <AIStudioTab itemVariants={itemVariants} />;
      case 1: return <TrendsTab itemVariants={itemVariants} />;
      case 2: return <ListViewTab itemVariants={itemVariants} />;
      case 3: return <CalendarViewTab itemVariants={itemVariants} />;
      default: return <AIStudioTab itemVariants={itemVariants} />;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Content Marketing</Title>
          <Text type="secondary">Plan, produce, approve, and ship every content piece across channels.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select defaultValue="Prestige Estates" style={{ width: 200, fontWeight: 600 }} size="large">
            <Select.Option value="Prestige Estates">Prestige Estates</Select.Option>
          </Select>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Export</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>New Content</Button>
        </div>
      </motion.div>

      {/* GRADIENT STROKE CARDS WITH FLOATING BADGE */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24, paddingTop: 16 }}>
        {[
          { label: 'PUBLISHED THIS MONTH', val: '8', sub: 'Pieces shipped', colorStart: '#3b82f6', colorEnd: '#10b981', icon: <CheckCircle2 size={20}/> },
          { label: 'IN REVIEW / PENDING', val: '4', sub: 'Awaiting approval', colorStart: '#f59e0b', colorEnd: '#ef4444', icon: <AlertCircle size={20}/> },
          { label: 'SCHEDULED', val: '6', sub: 'Queued for go-live', colorStart: '#8b5cf6', colorEnd: '#3b82f6', icon: <PenTool size={20}/> },
          { label: 'TOTAL PIPELINE', val: '24', sub: 'All statuses', colorStart: '#0d9488', colorEnd: '#0ea5e9', icon: <FileText size={20}/> }
        ].map((kpi, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <div style={{ position: 'relative', height: '100%', paddingTop: 20 }}>
                {/* Floating Badge */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 24, 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${kpi.colorStart}, ${kpi.colorEnd})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 2
                }}>
                  {kpi.icon}
                </div>
                
                {/* Gradient Border Card Wrapper */}
                <div style={{ 
                  padding: 2, 
                  borderRadius: 16, 
                  background: `linear-gradient(135deg, ${kpi.colorStart}, transparent, transparent, ${kpi.colorEnd})`,
                  height: 'calc(100% - 20px)'
                }}>
                  <Card 
                    bodyStyle={{ padding: '28px 20px 20px', height: '100%', display: 'flex', flexDirection: 'column' }} 
                    style={{ 
                      borderRadius: 14, 
                      height: '100%',
                      background: 'var(--bg-primary)',
                      border: 'none',
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{kpi.label}</Text>
                    <Title level={2} style={{ margin: '8px 0 4px', color: 'var(--text-primary)', fontSize: 36, fontWeight: 800 }}>{kpi.val}</Title>
                    <Text style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 'auto' }}>{kpi.sub}</Text>
                  </Card>
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants}>
        <div style={{ 
          background: 'rgba(245, 158, 11, 0.05)', 
          border: '1px solid rgba(245, 158, 11, 0.2)', 
          padding: 20, 
          borderRadius: 16, 
          marginBottom: 24, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', color: 'var(--accent-warning)' }}>
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <AlertCircle size={24} style={{ marginTop: 2 }} />
            </motion.div>
            <span>
              <strong style={{ fontSize: 15, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>3 content pieces need client approval — Prestige Estates</strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Oldest waiting 4 days. Send a nudge to keep launches on track.</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button type="primary" style={{ background: 'var(--accent-warning)', border: 'none', color: '#fff', borderRadius: 8, fontWeight: 600 }}>Send Reminder</Button>
            <Button style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: 8, background: 'var(--bg-secondary)', fontWeight: 600 }}>View All</Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', marginBottom: 24, overflowX: 'auto', paddingBottom: 2 }}>
          {['AI Studio', 'Trends', 'List View', 'Calendar View'].map((tab, i) => (
            <div 
              key={tab} 
              onClick={() => setActiveTab(i)}
              style={{ 
                paddingBottom: 12, 
                borderBottom: activeTab === i ? '2px solid var(--accent-secondary)' : '2px solid transparent', 
                fontWeight: activeTab === i ? 700 : 500, 
                color: activeTab === i ? 'var(--text-primary)' : 'var(--text-secondary)', 
                cursor: 'pointer', 
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
};

export default Content;
