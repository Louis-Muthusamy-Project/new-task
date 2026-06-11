import React from 'react';
import { Typography, Row, Col, Card, Button, Table, Tag, Avatar, Progress, Select } from 'antd';
import { motion } from 'framer-motion';
import { Calendar, Plus, Users, Clock, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { teamAllocationData } from '../../data/mock';

const { Title, Text } = Typography;

const Resources = () => {
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

  const allocationCols = [
    { title: 'Team', dataIndex: 'name', key: 'name', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'Prestige', dataIndex: 'prestige', key: 'prestige', render: val => val ? <span style={{ fontWeight: 500 }}>{val}h</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span> },
    { title: 'boAt', dataIndex: 'boat', key: 'boat', render: val => val ? <span style={{ fontWeight: 500 }}>{val}h</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span> },
    { title: 'Rapido', dataIndex: 'rapido', key: 'rapido', render: val => val ? <span style={{ fontWeight: 500 }}>{val}h</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span> },
    { title: 'Nykaa', dataIndex: 'nykaa', key: 'nykaa', render: val => val ? <span style={{ fontWeight: 500 }}>{val}h</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span> },
    { title: 'CRED', dataIndex: 'cred', key: 'cred', render: val => val ? <span style={{ fontWeight: 500 }}>{val}h</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span> },
    { title: 'Meesho', dataIndex: 'meesho', key: 'meesho', render: val => val ? <span style={{ fontWeight: 500 }}>{val}h</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span> },
    { title: 'Others', dataIndex: 'others', key: 'others', render: val => val ? <span style={{ fontWeight: 500 }}>{val}h</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span> },
    { title: 'Total', dataIndex: 'total', key: 'total', render: val => <strong style={{ color: 'var(--text-primary)' }}>{val}h</strong> },
  ];

  const utilBars = [
    { name: 'Arjun Sharma', role: 'Account Director', util: 91, bill: 132, nonBill: 14, free: 14, cap: 160 },
    { name: 'Priya Nair', role: 'Strategy Lead', util: 96, bill: 136, nonBill: 18, free: 6, cap: 160 },
    { name: 'Karan Mehta', role: 'Performance Lead', util: 73, bill: 104, nonBill: 12, free: 44, cap: 160 },
    { name: 'Divya Rao', role: 'Content Lead', util: 74, bill: 106, nonBill: 12, free: 42, cap: 160 },
    { name: 'Rahul Singh', role: 'Design Lead', util: 74, bill: 102, nonBill: 16, free: 42, cap: 160 },
  ];

  const calDotColors = ['var(--accent-info)', 'var(--accent-info)', 'var(--accent-info)', 'var(--accent-warning)', 'var(--accent-danger)'];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>AGENCY OPS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Resource Management</Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>Capacity planning, workload balancing, and team availability.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Calendar size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>June 2026 <ChevronDown size={14}/></Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', height: 40, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-md)' }}>Add Resource</Button>
        </div>
      </motion.div>

      {/* NEW VERTICAL SPLIT-PANE CARDS */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          {[
            { label: 'TOTAL CAPACITY', val: '800h', sub: '5 members × 40h × 4 wks', icon: <Users size={24} />, color: 'var(--text-primary)', bg: 'rgba(59, 130, 246, 0.15)', iconColor: 'var(--accent-primary)' },
            { label: 'ALLOCATED', val: '652h', sub: '81.5%', icon: <Clock size={24} />, color: 'var(--text-primary)', bg: 'rgba(139, 92, 246, 0.15)', iconColor: 'var(--accent-info)' },
            { label: 'AVAILABLE', val: '148h', sub: '18.5%', icon: <Clock size={24} />, color: 'var(--accent-primary)', bg: 'rgba(16, 185, 129, 0.15)', iconColor: 'var(--accent-primary)' },
            { label: 'OVERALLOCATED', val: '0 members', sub: 'All within capacity', icon: <AlertTriangle size={24} />, color: 'var(--accent-primary)', bg: 'rgba(16, 185, 129, 0.15)', iconColor: 'var(--accent-primary)' },
          ].map((kpi, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <Card 
                  style={{ 
                    borderRadius: 16, 
                    border: '1px solid var(--border-color)', 
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-sm)',
                    height: '100%',
                    overflow: 'hidden'
                  }} 
                  bodyStyle={{ padding: 0, display: 'flex', height: '100%' }}
                >
                  {/* Left Pane */}
                  <div style={{ width: '35%', background: kpi.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px 12px', borderRight: '1px solid var(--border-color)' }}>
                    <div style={{ color: kpi.iconColor, marginBottom: 8 }}>{kpi.icon}</div>
                    <Text style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textAlign: 'center', color: kpi.iconColor, textTransform: 'uppercase' }}>{kpi.label}</Text>
                  </div>
                  
                  {/* Right Pane */}
                  <div style={{ width: '65%', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Title level={2} style={{ margin: '0 0 4px 0', color: kpi.color, fontWeight: 800, lineHeight: 1.2 }}>{kpi.val}</Title>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>{kpi.sub}</Text>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Team Utilisation</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Hours allocated this month — target 80%</Text></div>} 
          extra={<div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-secondary)' }}/> Billable</span><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(13, 148, 136, 0.4)' }}/> Non-billable</span><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}/> Available</span></div>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {utilBars.map((u, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <div><strong style={{ color: 'var(--text-primary)' }}>{u.name}</strong> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{u.role}</Text></div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>{u.util}%</strong> <span style={{ color: 'var(--text-secondary)' }}>utilised ·</span> <Text type="secondary" style={{ fontWeight: 600 }}>{u.bill + u.nonBill} / {u.cap}h</Text></div>
                </div>
                <div style={{ height: 28, display: 'flex', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: `${(u.bill/u.cap)*100}%`, background: 'var(--accent-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{u.bill}h</div>
                  <div style={{ width: `${(u.nonBill/u.cap)*100}%`, background: 'rgba(13, 148, 136, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-primary)', fontSize: 11, fontWeight: 700 }}>{u.nonBill}h</div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 12, color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 600 }}>{u.free}h free</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Client Allocation — This Month</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Hours each team member is committed to per client. Amber cells = {'>'}30% to one client.</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={allocationCols} dataSource={teamAllocationData} pagination={false} rowKey="name" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Availability Calendar — June 2026</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Green = available · Amber = partial · Red = fully booked</Text></div>} 
          extra={<div style={{ display: 'flex', gap: 12 }}><Select defaultValue="All team members" style={{ width: 180, fontWeight: 500 }}><Select.Option value="All team members">All team members</Select.Option></Select><div style={{ display: 'flex', gap: 8 }}><Button size="middle" icon={<ChevronLeft size={16}/>} style={{ borderRadius: 8 }}/><Button size="middle" icon={<ChevronRight size={16}/>} style={{ borderRadius: 8 }}/></div></div>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 40, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 16 }}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-tertiary)', letterSpacing: 1.5, marginBottom: 8 }}>{d}</div>)}
            
            <div style={{ minHeight: 100, border: '1px solid transparent' }} />
            {[...Array(30)].map((_, i) => (
              <div key={i} style={{ minHeight: 100, border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, background: 'var(--bg-secondary)', position: 'relative', boxShadow: 'var(--shadow-sm)' }}>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{i+1}</strong>
                <div style={{ display: 'flex', gap: 6, position: 'absolute', bottom: 12, left: 12, flexWrap: 'wrap', width: 'calc(100% - 24px)' }}>
                  {[...Array(5)].map((_, j) => {
                    return <div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: calDotColors[Math.floor(Math.random() * calDotColors.length)] }} />
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default Resources;
