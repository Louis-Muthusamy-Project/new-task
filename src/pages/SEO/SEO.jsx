import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Avatar } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Play, Search, MessageSquare, Sparkles, Target } from 'lucide-react';
import SEOTab from './tabs/SEOTab';
import AEOTab from './tabs/AEOTab';
import GEOTab from './tabs/GEOTab';

const { Title, Text } = Typography;

const SEO = () => {
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
      case 0: return <SEOTab itemVariants={itemVariants} />;
      case 1: return <AEOTab itemVariants={itemVariants} />;
      case 2: return <GEOTab itemVariants={itemVariants} />;
      case 3: return <SEOTab itemVariants={itemVariants} />; // Placeholder for Unified Search
      default: return <SEOTab itemVariants={itemVariants} />;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>SEO / AEO / GEO</Title>
          <Text type="secondary">Search - Answer Engine - Generative Engine — unified in one view.</Text>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 16, borderRight: '1px solid var(--border-color)' }}>
            <Avatar size="default" style={{ backgroundColor: 'var(--accent-secondary)', fontWeight: 700 }}>PE</Avatar>
            <div style={{ lineHeight: 1.2 }}>
              <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)' }}>Prestige Estates</strong>
              <Text type="secondary" style={{ fontSize: 11 }}>Synced 4 mins ago</Text>
            </div>
          </div>
          <Button icon={<Play size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Run Full Audit</Button>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Export Report</Button>
          <Button style={{ borderRadius: 8, borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)', background: 'rgba(16, 185, 129, 0.05)', fontWeight: 600 }}>Google - Connected</Button>
        </div>
      </motion.div>

      {/* NEW INNER GLOW AURA CARDS / TABS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'SEO', title: 'SEO HEALTH', val: '88', sub: '▲ +3', color: 'var(--accent-secondary)', icon: <Search size={24} />, glowPos: 'top-left', subText: 'Search Engine Optimisation' },
          { label: 'AEO', title: 'ANSWER ENGINE', val: '74', sub: '▲ +5', color: 'var(--accent-primary)', icon: <MessageSquare size={24} />, glowPos: 'bottom-right', subText: 'Answer Engine Optimisation' },
          { label: 'GEO', title: 'GENERATIVE ENGINE', val: '72', sub: '▲ +8', color: 'var(--accent-info)', icon: <Sparkles size={24} />, glowPos: 'top-right', subText: 'Generative Engine Optimisation' },
          { label: 'UNIFIED SEARCH', title: 'UNIFIED SEARCH', val: '78', sub: 'Top 21% in Real Estate', color: 'var(--accent-warning)', icon: <Target size={24} />, glowPos: 'bottom-left', isOverall: true }
        ].map((kpi, i) => {
          const isActive = activeTab === i;
          return (
            <Col xs={24} sm={12} lg={6} key={i}>
              <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%', cursor: 'pointer' }} onClick={() => setActiveTab(i)}>
                <Card 
                  bodyStyle={{ padding: 24, height: '100%' }} 
                  style={{ 
                    borderRadius: 16, 
                    background: isActive ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderBottom: isActive ? `3px solid ${kpi.color}` : '1px solid var(--border-color)',
                    boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Radial Glow Aura */}
                  {isActive && (
                    <div style={{ 
                      position: 'absolute', 
                      top: kpi.glowPos.includes('top') ? '-20%' : 'auto', 
                      bottom: kpi.glowPos.includes('bottom') ? '-20%' : 'auto', 
                      left: kpi.glowPos.includes('left') ? '-20%' : 'auto', 
                      right: kpi.glowPos.includes('right') ? '-20%' : 'auto', 
                      width: '60%', 
                      height: '60%', 
                      background: `radial-gradient(circle, ${kpi.color} 0%, transparent 70%)`, 
                      opacity: 0.15,
                      filter: 'blur(30px)',
                      pointerEvents: 'none'
                    }} />
                  )}
                  
                  {kpi.isOverall ? (
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', height: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>{kpi.title}</Text>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
                          <Title level={1} style={{ margin: 0, color: 'var(--text-primary)', fontSize: 40, fontWeight: 800 }}>{kpi.val}</Title>
                          <Text type="secondary" style={{ fontSize: 16, fontWeight: 500 }}>/100</Text>
                        </div>
                        <Text style={{ color: kpi.color, fontSize: 13, fontWeight: 600, marginTop: 8 }}>{kpi.sub}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', border: `4px solid ${kpi.color}`, color: kpi.color, fontSize: 24, fontWeight: 800 }}>
                        {kpi.val}
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ color: isActive ? kpi.color : 'var(--text-tertiary)', background: isActive ? `${kpi.color}15` : 'var(--bg-tertiary)', padding: 12, borderRadius: 12, transition: 'all 0.3s ease' }}>
                          {kpi.icon}
                        </div>
                        <div>
                          <Text style={{ fontSize: 16, fontWeight: 800, color: isActive ? kpi.color : 'var(--text-primary)' }}>{kpi.label}</Text>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{kpi.subText}</Text>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Title level={2} style={{ margin: 0, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 28, fontWeight: 800 }}>{kpi.val}</Title>
                        <Text type="secondary" style={{ fontSize: 11 }}>/100</Text>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

    </motion.div>
  );
};

export default SEO;
