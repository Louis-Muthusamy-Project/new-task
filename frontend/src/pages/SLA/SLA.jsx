import React from 'react';
import { Typography, Row, Col, Card, Table, Tag, Button, Input, Progress, Avatar } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Download, Settings, Search, AlertCircle, Target, CheckCircle, AlertOctagon, AlertTriangle } from 'lucide-react';
import { agencyClients, slaTrendData } from '../../data/mock';

const { Title, Text } = Typography;

const SLA = () => {
  const breachedClients = agencyClients.filter(c => c.completed < c.due && c.sla < 85);

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
    { 
      title: 'CLIENT', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ backgroundColor: record.mos > 70 ? 'var(--accent-secondary)' : record.mos > 60 ? 'var(--accent-primary)' : record.mos > 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>{record.id}</Avatar>
          <strong style={{ color: 'var(--text-primary)' }}>{text}</strong>
        </div>
      )
    },
    { 
      title: 'OVERALL SLA', 
      dataIndex: 'sla', 
      key: 'sla', 
      render: val => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ minWidth: 32, color: val > 90 ? 'var(--accent-secondary)' : val > 80 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>{val}%</strong>
          <Progress percent={val} showInfo={false} size="small" strokeColor={val > 90 ? 'var(--accent-secondary)' : val > 80 ? 'var(--accent-warning)' : 'var(--accent-danger)'} trailColor="var(--bg-tertiary)" style={{ width: 80 }} />
        </div>
      )
    },
    { title: 'DUE', dataIndex: 'due', key: 'due', render: text => <span style={{ color: 'var(--text-secondary)' }}>{text}</span> },
    { title: 'COMPLETED', key: 'completed', render: (_, r) => <strong style={{ color: 'var(--text-primary)' }}>{r.completed} / {r.due}</strong> },
    { title: 'OVERDUE', key: 'overdue', render: (_, r) => <strong style={{ color: r.due - r.completed > 0 ? 'var(--accent-danger)' : 'var(--text-tertiary)' }}>{r.due - r.completed}</strong> },
    { title: 'AVG RESPONSE', dataIndex: 'avgResponse', key: 'avgResponse', render: text => <span style={{ color: 'var(--text-secondary)' }}>{text}</span> },
    { 
      title: 'STATUS', 
      key: 'status', 
      render: (_, r) => {
        const val = r.sla;
        let color = val > 90 ? 'success' : val > 80 ? 'warning' : 'error';
        let label = val > 90 ? 'Compliant' : val > 80 ? 'At Risk' : 'Breached';
        return <Tag color={color} style={{ borderRadius: 12, background: 'transparent', border: `1px solid var(--accent-${color === 'success' ? 'secondary' : color === 'error' ? 'danger' : 'warning'})`, color: `var(--accent-${color === 'success' ? 'secondary' : color === 'error' ? 'danger' : 'warning'})` }}>{label}</Tag>
      } 
    },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      render: () => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="text" size="small" style={{ color: 'var(--text-primary)' }}>View</Button>
          <Button type="text" size="small" danger>Escalate</Button>
        </div>
      ) 
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 01 · CLIENTS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>SLA Dashboard</Title>
          <Text type="secondary">Service level compliance across all active clients.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Settings size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Configure SLA Templates</Button>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Export Report</Button>
        </div>
      </motion.div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'OVERALL SLA COMPLIANCE', val: '85%', sub: 'Target 95%', color: 'var(--text-primary)', icon: <Target size={20} />, iconColor: 'var(--accent-primary)', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 100%)' },
          { label: 'CLIENTS FULLY COMPLIANT', val: '3 of 12', sub: 'Met every metric', color: 'var(--text-primary)', icon: <CheckCircle size={20} />, iconColor: 'var(--accent-secondary)', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, transparent 100%)' },
          { label: 'ACTIVE BREACHES', val: '3', sub: 'Needs immediate action', color: 'var(--accent-danger)', isAlert: true, icon: <AlertOctagon size={20} />, iconColor: 'var(--accent-danger)', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, transparent 100%)' },
          { label: 'AT RISK', val: '6', sub: '>80% of deadline used', color: 'var(--accent-warning)', icon: <AlertTriangle size={20} />, iconColor: 'var(--accent-warning)', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, transparent 100%)' }
        ].map((kpi, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                className="glassmorphism" 
                bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }} 
                style={{ 
                  borderRadius: 16, 
                  height: '100%', 
                  border: '1px solid var(--border-color)', 
                  boxShadow: 'var(--shadow-md)',
                  background: `var(--glass-bg)`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: kpi.gradient, pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, position: 'relative', zIndex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>{kpi.label}</Text>
                  <div style={{ padding: 8, borderRadius: 10, backgroundColor: 'var(--bg-secondary)', color: kpi.iconColor, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    {kpi.icon}
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Title level={2} style={{ margin: '0 0 4px', fontSize: 36, fontWeight: 800, color: kpi.color }}>{kpi.val}</Title>
                  {kpi.isAlert && <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ color: 'var(--accent-danger)', fontSize: 24, lineHeight: 1 }}>●</motion.span>}
                </div>
                <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>{kpi.sub}</Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={24} xl={24} xxl={17}>
          <motion.div variants={itemVariants} className="glassmorphism" style={{ padding: '20px 24px', borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
              <Input.Search placeholder="Search clients..." style={{ width: '100%', maxWidth: 360 }} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['All', 'Compliant', 'At Risk', 'Breached'].map(f => (
                  <Button 
                    key={f} 
                    type={f === 'All' ? 'primary' : 'default'} 
                    style={{ 
                      borderRadius: 20, 
                      background: f === 'All' ? 'var(--text-primary)' : 'transparent',
                      color: f === 'All' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      borderColor: f === 'All' ? 'var(--text-primary)' : 'var(--border-color)',
                      fontWeight: 600
                    }}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <Table columns={columns} dataSource={agencyClients} rowKey="id" pagination={false} size="middle" scroll={{ x: 900 }} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card 
              title={<div style={{ paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Agency-wide SLA trend</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Last 6 months · target 95%</Text></div>
                <Tag style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 600, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Target 95%</Tag>
              </div>} 
              className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ height: 300, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={slaTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                    <YAxis domain={[80, 100]} stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }} 
                      itemStyle={{ color: 'var(--accent-secondary)', fontWeight: 600 }} 
                    />
                    <ReferenceLine y={95} stroke="var(--accent-danger)" strokeDasharray="3 3" />
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <Line type="monotone" dataKey="val" stroke="url(#colorTrend)" strokeWidth={4} dot={{ r: 5, fill: 'var(--bg-secondary)', stroke: 'var(--accent-primary)', strokeWidth: 2 }} activeDot={{ r: 7, fill: 'var(--accent-primary)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={24} xl={24} xxl={7}>
          <motion.div variants={itemVariants} className="glassmorphism" style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle red glow in the background for "Needs Action" */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(180deg, rgba(239,68,68,0.1) 0%, transparent 100%)', pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-danger)', marginBottom: 8, position: 'relative', zIndex: 1 }}>
              <AlertCircle size={22} strokeWidth={2.5} />
              <strong style={{ fontSize: 18, fontWeight: 800 }}>Needs Immediate Action</strong>
            </div>
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24, fontWeight: 500, position: 'relative', zIndex: 1 }}>3 clients in active breach</Text>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
              {breachedClients.map(c => (
                <motion.div key={c.id} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                  <Card 
                    bodyStyle={{ padding: 20 }} 
                    style={{ 
                      borderRadius: 16, 
                      border: '1px solid var(--border-color)', 
                      background: 'var(--bg-secondary)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar shape="square" size="large" style={{ backgroundColor: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700, border: '1px solid var(--border-color)' }}>{c.id}</Avatar>
                        <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>{c.name}</strong>
                      </div>
                      <Tag color="error" style={{ margin: 0, borderRadius: 12, padding: '2px 10px', fontWeight: 700, border: 'none', background: 'var(--accent-danger)', color: '#fff' }}>BREACHED</Tag>
                    </div>
                    <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                      <li>Content deliverables overdue</li>
                      <li>Monthly report delayed</li>
                    </ul>
                    <Text strong style={{ color: 'var(--accent-danger)', display: 'block', marginBottom: 20, fontSize: 15, fontWeight: 700 }}>{c.due - c.completed} days overdue</Text>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Button type="primary" danger style={{ flex: 1, borderRadius: 8, height: 40, fontWeight: 600 }}>Escalate</Button>
                      <Button danger style={{ flex: 1, borderRadius: 8, height: 40, fontWeight: 600, background: 'transparent', borderColor: 'var(--border-color)' }}>Resolve</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default SLA;
