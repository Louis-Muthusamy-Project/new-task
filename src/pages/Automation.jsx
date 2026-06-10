import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Select, Table, Tag, Switch, Input } from 'antd';
import { motion } from 'framer-motion';
import { Info, Play, Edit3, Eye, Zap, AlertTriangle, ArrowRight, ChevronDown, CheckCircle2, List, Plus, Activity, CheckSquare } from 'lucide-react';
import { activeAutomations, automationLogs } from '../data/mock';

const { Title, Text } = Typography;
const { Option } = Select;

const Automation = () => {
  const [mode, setMode] = useState('agency');

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

  const automationCols = [
    { title: 'AUTOMATION', dataIndex: 'name', key: 'name', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'TRIGGER', dataIndex: 'trigger', key: 'trigger', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'ACTION', dataIndex: 'action', key: 'action', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: text => {
        const isActive = text === 'Active';
        return <Tag style={{ borderRadius: 12, border: 'none', background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: isActive ? 'var(--accent-primary)' : 'var(--accent-warning)', fontWeight: 700, padding: '2px 8px' }}>{text}</Tag>;
      } 
    },
    { title: 'RUNS (MTD)', dataIndex: 'runs', key: 'runs', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'LAST RUN', dataIndex: 'lastRun', key: 'lastRun', render: text => <Text type="secondary">{text}</Text> },
    { title: 'ON', dataIndex: 'on', key: 'on', render: val => <Switch defaultChecked={val} size="small" style={{ background: val ? 'var(--accent-secondary)' : 'var(--bg-tertiary)' }} /> },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      render: () => (
        <div style={{ display: 'flex', gap: 12 }}>
          <a style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}><Edit3 size={14} /> Edit</a>
          <a style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}><Eye size={14} /> View</a>
        </div>
      ) 
    }
  ];

  const logCols = [
    { title: 'AUTOMATION', dataIndex: 'name', key: 'name', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'TRIGGERED BY', dataIndex: 'trigger', key: 'trigger', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'RUN TIME', dataIndex: 'time', key: 'time', render: text => <Text type="secondary">{text}</Text> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: text => {
        let color = text === 'Success' ? 'var(--accent-primary)' : text === 'Failed' ? 'var(--accent-danger)' : 'var(--accent-warning)';
        let bg = text === 'Success' ? 'rgba(16, 185, 129, 0.15)' : text === 'Failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
        return <Tag style={{ color, background: bg, border: 'none', borderRadius: 12, fontWeight: 700, padding: '2px 8px' }}>{text}</Tag>;
      } 
    },
    { title: 'RECORDS', dataIndex: 'records', key: 'records', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'DETAILS', dataIndex: 'details', key: 'details', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Marketing Automation</Title>
          <Text type="secondary">Build, manage, and monitor automated workflows across the client lifecycle.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select defaultValue="Prestige Estates" style={{ width: 200, fontWeight: 600 }} size="large"><Option value="Prestige Estates">Prestige Estates</Option></Select>
          <Button icon={<List size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>View Logs</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>New Automation</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Info size={18} color="var(--accent-secondary)" />
              <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>Automation modes</strong>
            </div>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              Current mode: 
              <Tag style={{ borderRadius: 12, margin: 0, background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent-secondary)', border: 'none', fontWeight: 700, padding: '2px 8px' }}>Agency-Guided Mode</Tag> 
              <a style={{ color: 'var(--accent-secondary)', fontWeight: 600, marginLeft: 4 }}>Change</a>
            </Text>
          </div>

          <Row gutter={[20, 20]}>
            <Col xs={24} md={12}>
              <motion.div whileHover={{ y: mode === 'agency' ? 0 : -2, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <div 
                  onClick={() => setMode('agency')}
                  style={{ 
                    padding: 20, 
                    borderRadius: 12, 
                    border: mode === 'agency' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)', 
                    background: mode === 'agency' ? 'rgba(13, 148, 136, 0.05)' : 'var(--bg-primary)', 
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.2s',
                    boxShadow: mode === 'agency' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                    <strong style={{ fontSize: 15, color: mode === 'agency' ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>Agency-Guided Mode</strong>
                    {mode === 'agency' && <Tag style={{ borderRadius: 12, border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', background: 'var(--bg-primary)', fontWeight: 700, margin: 0 }}>Current</Tag>}
                  </div>
                  <Text type="secondary" style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 12 }}>DEFAULT FOR ALL CLIENTS</Text>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Agency builds and owns automations. Client can activate or deactivate only — no editing without approval.</Text>
                </div>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div whileHover={{ y: mode === 'self' ? 0 : -2, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <div 
                  onClick={() => setMode('self')}
                  style={{ 
                    padding: 20, 
                    borderRadius: 12, 
                    border: mode === 'self' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)', 
                    background: mode === 'self' ? 'rgba(13, 148, 136, 0.05)' : 'var(--bg-primary)', 
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'all 0.2s',
                    boxShadow: mode === 'self' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <strong style={{ fontSize: 15, display: 'block', marginBottom: 8, color: mode === 'self' ? 'var(--accent-secondary)' : 'var(--text-primary)' }}>Self-Operate Mode</strong>
                  <Text type="secondary" style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 12 }}>UNLOCKED PER AGENCY PERMISSION</Text>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Client can build their own automations using a curated set of approved triggers and actions.</Text>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* NEW FLOATING MESH GRADIENT CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {[
          { label: 'ACTIVE AUTOMATIONS', val: '5', sub: 'Running now', color: 'var(--accent-secondary)', icon: <Activity size={32} /> },
          { label: 'RUNS (MTD)', val: '183', sub: 'Across all flows', color: 'var(--accent-info)', icon: <Zap size={32} /> },
          { label: 'SUCCESS RATE', val: '98.4%', sub: '+0.6%', color: 'var(--accent-primary)', icon: <CheckSquare size={32} /> },
          { label: 'PAUSED / ERROR', val: '1', sub: 'Needs attention', alert: true, color: 'var(--accent-danger)', icon: <AlertTriangle size={32} /> },
        ].map((kpi, i) => (
          <Col xs={24} sm={12} lg={6} style={{ flex: '1 1 200px', minWidth: 200}} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 2 }} 
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
                {/* Floating Mesh Gradient */}
                <div style={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  background: kpi.color, 
                  opacity: 0.15, 
                  filter: 'blur(30px)', 
                  zIndex: 1,
                  pointerEvents: 'none'
                }} />

                <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, position: 'relative', zIndex: 2 }}>{kpi.label}</Text>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 16, position: 'relative', zIndex: 2 }}>
                  <Title level={2} style={{ margin: 0, color: 'var(--text-primary)', fontSize: 40, fontWeight: 800 }}>{kpi.val}</Title>
                  {!kpi.alert && kpi.sub.includes('+') && <Text style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700 }}>{kpi.sub}</Text>}
                </div>
                <Text style={{ fontSize: 13, color: kpi.alert ? 'var(--accent-danger)' : 'var(--text-secondary)', display: 'block', marginTop: 8, fontWeight: 600, position: 'relative', zIndex: 2 }}>{kpi.alert ? kpi.sub : (!kpi.sub.includes('+') ? kpi.sub : '')}</Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Active automations</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>All workflows configured for this client</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={automationCols} dataSource={activeAutomations} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Build new automation</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>3-step visual flow · trigger → condition → action</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
        >
          {/* VISUAL FLOW BUILDER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, overflowX: 'auto', paddingBottom: 16 }}>
            
            <motion.div whileHover={{ y: -4 }} style={{ flex: 1, minWidth: 280, border: '2px solid var(--accent-secondary)', borderRadius: 16, padding: 20, background: 'var(--bg-primary)', boxShadow: '0 8px 24px rgba(13, 148, 136, 0.08)' }}>
              <Tag style={{ borderRadius: 16, color: 'var(--bg-primary)', background: 'var(--accent-secondary)', border: 'none', display: 'flex', alignItems: 'center', width: 'fit-content', gap: 6, marginBottom: 16, padding: '4px 12px', fontWeight: 600 }}><Zap size={14}/> Step 1 - Trigger</Tag>
              <strong style={{ fontSize: 14, display: 'block', marginBottom: 10, color: 'var(--text-primary)' }}>Select trigger</strong>
              <Input suffix={<ChevronDown size={16} color="var(--text-tertiary)"/>} placeholder="Pick a trigger..." style={{ borderRadius: 8, marginBottom: 10, height: 44 }} />
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>5 options available</Text>
            </motion.div>

            <ArrowRight size={24} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />

            <motion.div whileHover={{ y: -4 }} style={{ flex: 1, minWidth: 280, border: '1px solid var(--accent-warning)', borderRadius: 16, padding: 20, background: 'var(--bg-primary)' }}>
              <Tag style={{ borderRadius: 16, color: 'var(--accent-warning)', background: 'rgba(245, 158, 11, 0.1)', border: 'none', display: 'flex', alignItems: 'center', width: 'fit-content', gap: 6, marginBottom: 16, padding: '4px 12px', fontWeight: 700 }}><Edit3 size={14}/> Step 2 - Condition (optional)</Tag>
              <strong style={{ fontSize: 14, display: 'block', marginBottom: 10, color: 'var(--text-primary)' }}>Select condition</strong>
              <Input suffix={<ChevronDown size={16} color="var(--text-tertiary)"/>} placeholder="Pick a condition (optional)..." style={{ borderRadius: 8, marginBottom: 10, height: 44 }} />
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>3 options available</Text>
            </motion.div>

            <ArrowRight size={24} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />

            <motion.div whileHover={{ y: -4 }} style={{ flex: 1, minWidth: 280, border: '1px solid var(--accent-primary)', borderRadius: 16, padding: 20, background: 'var(--bg-primary)' }}>
              <Tag style={{ borderRadius: 16, color: 'var(--accent-primary)', background: 'rgba(16, 185, 129, 0.1)', border: 'none', display: 'flex', alignItems: 'center', width: 'fit-content', gap: 6, marginBottom: 16, padding: '4px 12px', fontWeight: 700 }}><Play size={14}/> Step 3 - Action</Tag>
              <strong style={{ fontSize: 14, display: 'block', marginBottom: 10, color: 'var(--text-primary)' }}>Select action</strong>
              <Input suffix={<ChevronDown size={16} color="var(--text-tertiary)"/>} placeholder="Pick an action..." style={{ borderRadius: 8, marginBottom: 10, height: 44 }} />
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>5 options available</Text>
            </motion.div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <Button icon={<Play size={16} />} style={{ borderRadius: 8, height: 40, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Test Automation</Button>
            <Button icon={<Edit3 size={16} />} style={{ borderRadius: 8, height: 40, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Save as Draft</Button>
            <Button type="primary" icon={<CheckCircle2 size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>Activate</Button>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Automation logs</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Last 20 runs - refreshed continuously</Text></div>} 
          extra={<ChevronDown size={20} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />}
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={logCols} dataSource={automationLogs} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default Automation;
