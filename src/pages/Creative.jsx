import React, { useState } from 'react';
import { Typography, Row, Col, Card, Table, Tag, Button, Input, Select, Avatar } from 'antd';
import { motion } from 'framer-motion';
import { Upload, Plus, Search, Palette, Video, FolderOpen, BookOpen, Check, LayoutGrid, Clock, AlertCircle, Image as ImageIcon, Briefcase } from 'lucide-react';
import { creativeProjects } from '../data/mock';

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

  const columns = [
    { title: 'PROJECT', dataIndex: 'project', key: 'project', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'TYPE', dataIndex: 'type', key: 'type', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'BRIEF', dataIndex: 'brief', key: 'brief', align: 'center', render: val => val ? <Check size={18} color="var(--accent-primary)" style={{ strokeWidth: 3 }} /> : <Text type="secondary">—</Text> },
    { title: 'ASSIGNED', dataIndex: 'assigned', key: 'assigned', align: 'center', render: text => <Avatar size="small" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 700, border: '1px solid var(--border-color)' }}>{text}</Avatar> },
    { title: 'DUE', dataIndex: 'due', key: 'due', render: text => <span style={{ color: 'var(--text-primary)' }}>{text}</span> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: text => {
        let bg, color, border;
        if (text === 'Approved') { bg = 'rgba(16, 185, 129, 0.1)'; color = 'var(--accent-primary)'; border = 'rgba(16, 185, 129, 0.2)'; }
        else if (text.includes('Design')) { bg = 'rgba(59, 130, 246, 0.1)'; color = 'var(--accent-info)'; border = 'rgba(59, 130, 246, 0.2)'; }
        else if (text.includes('Review')) { bg = 'rgba(245, 158, 11, 0.1)'; color = 'var(--accent-warning)'; border = 'rgba(245, 158, 11, 0.2)'; }
        else { bg = 'var(--bg-tertiary)'; color = 'var(--text-secondary)'; border = 'var(--border-color)'; }
        
        return <Tag style={{ borderRadius: 12, background: bg, color: color, border: `1px solid ${border}`, fontWeight: 600, padding: '2px 10px' }}>{text}</Tag>;
      } 
    },
    { 
      title: 'APPROVAL', 
      dataIndex: 'approval', 
      key: 'approval', 
      render: text => {
        if (text === '-') return <Text type="secondary">—</Text>;
        if (text === 'Pending') return <strong style={{ color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14}/>Pending</strong>;
        if (text.includes('Approved')) return <Tag style={{ borderRadius: 12, border: 'none', background: 'transparent', color: 'var(--accent-primary)', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} style={{ strokeWidth: 3 }}/>{text}</Tag>;
        return <Text type="secondary">{text}</Text>;
      } 
    },
    { title: 'ACTIONS', key: 'actions', align: 'right', render: () => <Button type="link" style={{ color: 'var(--accent-secondary)', fontWeight: 600, padding: 0 }}>Open</Button> }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>AI Studio</Title>
          <Text type="secondary">Generate copy, design assets, and creative briefs using custom-trained AI agents.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select defaultValue="Prestige Estates" style={{ width: 200, fontWeight: 600 }} size="large"><Option value="Prestige Estates">Prestige Estates</Option></Select>
          <Button icon={<Upload size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Upload Asset</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>New Generation</Button>
        </div>
      </motion.div>

      {/* NEW ICON WATERMARK & ACCENT PILL CARDS */}
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

          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <Input prefix={<Search size={16} color="var(--text-tertiary)" />} placeholder="Search projects..." style={{ width: '100%', maxWidth: 300, borderRadius: 8, padding: '6px 12px' }} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Select defaultValue="All Types" style={{ width: 150 }} size="middle"><Option value="All Types">All Types</Option></Select>
              <Select defaultValue="All Status" style={{ width: 150 }} size="middle"><Option value="All Status">All Status</Option></Select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <Table 
              columns={columns} 
              dataSource={creativeProjects} 
              pagination={false} 
              rowKey="id" 
              size="middle" 
              scroll={{ x: 1000 }} 
              style={{ minWidth: 1000 }} 
              rowClassName={() => 'hover-bg'}
            />
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default Creative;
