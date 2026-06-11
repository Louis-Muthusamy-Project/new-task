import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Select } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, Palette, Video, FolderOpen, BookOpen, LayoutGrid, Clock, AlertCircle, Image as ImageIcon, Briefcase } from 'lucide-react';
import DesignWorkTab from './tabs/DesignWorkTab';
import VideoTab from './tabs/VideoTab';
import AssetLibraryTab from './tabs/AssetLibraryTab';
import BrandGuidelinesTab from './tabs/BrandGuidelinesTab';
import DeliverablesTab from './tabs/DeliverablesTab';

const { Title, Text } = Typography;
const { Option } = Select;

const Creative = () => {
  const [activeTab, setActiveTab] = useState('Design Work');

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
      case 'Design Work': return <DesignWorkTab itemVariants={itemVariants} />;
      case 'Video': return <VideoTab itemVariants={itemVariants} />;
      case 'Asset Library': return <AssetLibraryTab itemVariants={itemVariants} />;
      case 'Brand Guidelines': return <BrandGuidelinesTab itemVariants={itemVariants} />;
      case 'Deliverables': return <DeliverablesTab itemVariants={itemVariants} />;
      default: return <DesignWorkTab itemVariants={itemVariants} />;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Creative</Title>
          <Text type="secondary">Design, video, and visual assets — every deliverable for every client.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select defaultValue="Prestige Estates" style={{ width: 200, fontWeight: 600 }} size="large"><Option value="Prestige Estates">Prestige Estates</Option></Select>
          <Button icon={<Upload size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Upload Asset</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>New Creative Brief</Button>
        </div>
      </motion.div>

      {/* ICON WATERMARK & ACCENT PILL CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'ACTIVE PROJECTS', val: '8', sub: 'Across all clients', color: 'var(--accent-secondary)', icon: <Briefcase size={80} /> },
          { label: 'ASSETS THIS MONTH', val: '42', sub: 'Delivered to clients', color: 'var(--accent-info)', icon: <ImageIcon size={80} /> },
          { label: 'PENDING APPROVAL', val: '6', sub: 'With client', subColor: 'var(--accent-danger)', isAlert: true, color: 'var(--accent-danger)', icon: <AlertCircle size={80} /> },
          { label: 'VIDEOS IN PRODUCTION', val: '3', sub: 'Active shoots/edits', color: 'var(--accent-warning)', icon: <Video size={80} /> },
          { label: 'BRAND ASSETS', val: '124', sub: 'Total in library', color: 'var(--accent-primary)', icon: <FolderOpen size={80} /> }
        ].map((kpi, i) => (
          <Col xs={24} sm={12} xl={kpi.label === 'BRAND ASSETS' ? 8 : 4} lg={8} style={{ flex: '1 1 200px', minWidth: 200}} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 2 }} 
                style={{ 
                  borderRadius: 16, 
                  height: '100%', 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Icon Watermark */}
                <div style={{ position: 'absolute', bottom: -10, right: -10, color: kpi.color, opacity: 0.08, zIndex: 1, transform: 'rotate(-10deg)' }}>
                  {kpi.icon}
                </div>

                {/* Accent Pill Label */}
                <div style={{ display: 'flex', marginBottom: 16 }}>
                  <div style={{ background: kpi.color, padding: '4px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <Text style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#fff', textTransform: 'uppercase' }}>{kpi.label}</Text>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto', zIndex: 2, position: 'relative' }}>
                  <Title level={2} style={{ margin: 0, color: 'var(--text-primary)', fontSize: 40, fontWeight: 800 }}>{kpi.val}</Title>
                  {kpi.isAlert && <Text style={{ color: 'var(--bg-primary)', background: 'var(--accent-danger)', padding: '2px 8px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>-2</Text>}
                </div>
                <Text style={{ fontSize: 13, fontWeight: 500, color: kpi.subColor || 'var(--text-secondary)', zIndex: 2, position: 'relative', marginTop: 4 }}>{kpi.sub}</Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants}>
        <div className="glassmorphism" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          {/* Interactive Tabs */}
          <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', marginBottom: 24, overflowX: 'auto' }}>
            {[
              { id: 'Design Work', icon: <Palette size={16}/> },
              { id: 'Video', icon: <Video size={16}/> },
              { id: 'Asset Library', icon: <FolderOpen size={16}/> },
              { id: 'Brand Guidelines', icon: <BookOpen size={16}/> },
              { id: 'Deliverables', icon: <LayoutGrid size={16}/> }
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

    </motion.div>
  );
};

export default Creative;
