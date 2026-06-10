import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Select, Table, Tag, Avatar, Progress } from 'antd';
import { motion } from 'framer-motion';
import { UserPlus, Download, Search, LayoutGrid, List } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { teamAllocationData } from '../data/mock';

const { Title, Text } = Typography;

const Teams = () => {
  const [view, setView] = useState('cards');

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

  const teamMembers = [
    { name: 'Arjun Sharma', role: 'SEO Lead', level: 'Senior', email: 'arjun@bccmartech.com', initials: 'AS', color: 'var(--accent-warning)', util: 90, totalHours: 144, capacity: 160, clients: ['Prestige Estates', 'Rapido', 'Meesho'], tasks: 28, avgHrs: 1.2, numClients: 7 },
    { name: 'Priya Nair', role: 'Paid Media', level: 'Senior', email: 'priya@bccmartech.com', initials: 'PN', color: 'var(--accent-primary)', util: 78, totalHours: 124, capacity: 160, clients: ['Prestige Estates', 'boAt', 'Nykaa'], tasks: 22, avgHrs: 1.8, numClients: 6 },
    { name: 'Karan Mehta', role: 'Content', level: 'Mid-level', email: 'karan@bccmartech.com', initials: 'KM', color: 'var(--accent-info)', util: 66, totalHours: 106, capacity: 160, clients: ['Prestige Estates', 'Rapido', 'Lenskart'], tasks: 18, avgHrs: 2.4, numClients: 6 },
    { name: 'Divya Rao', role: 'Design', level: 'Mid-level', email: 'divya@bccmartech.com', initials: 'DR', color: 'var(--accent-secondary)', util: 83, totalHours: 132, capacity: 160, clients: ['Prestige Estates', 'boAt', 'Nykaa'], tasks: 14, avgHrs: 3.1, numClients: 5 },
    { name: 'Rahul Singh', role: 'Account Mgr', level: 'Senior', email: 'rahul@bccmartech.com', initials: 'RS', color: 'var(--accent-danger)', util: 88, totalHours: 140, capacity: 160, clients: ['Lenskart', 'BharatPe', 'Wakefit'], tasks: 24, avgHrs: 0.8, numClients: 8 },
  ];

  const utilChartData = [
    { name: 'Arjun', billable: 144, nonBillable: 16 },
    { name: 'Priya', billable: 124, nonBillable: 36 },
    { name: 'Karan', billable: 106, nonBillable: 54 },
    { name: 'Divya', billable: 132, nonBillable: 28 },
    { name: 'Rahul', billable: 140, nonBillable: 20 },
  ];

  // Helper function to render heatmap cell
  const renderHeatmapCell = (val) => {
    if (val === 0 || !val) return <span style={{ color: 'var(--text-tertiary)' }}>—</span>;
    // Map value to dynamic opacity but using solid theme background to ensure text legibility
    let bg = 'var(--bg-tertiary)';
    let color = 'var(--text-primary)';
    if (val >= 25) { bg = 'var(--accent-secondary)'; color = '#fff'; }
    else if (val >= 18) { bg = 'rgba(139, 92, 246, 0.6)'; color = '#fff'; }
    else if (val >= 12) { bg = 'rgba(139, 92, 246, 0.3)'; color = 'var(--text-primary)'; }
    else { bg = 'rgba(139, 92, 246, 0.15)'; color = 'var(--text-secondary)'; }

    return <div style={{ background: bg, color: color, padding: '6px', textAlign: 'center', borderRadius: 6, fontWeight: 600, border: '1px solid var(--border-color)' }}>{val}h</div>;
  };

  const allocationCols = [
    { title: 'MEMBER', dataIndex: 'name', key: 'name', render: (text) => <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar size="small" style={{ backgroundColor: teamMembers.find(t=>t.name.includes(text))?.color, fontSize: 10, fontWeight: 700 }}>{teamMembers.find(t=>t.name.includes(text))?.initials}</Avatar> <strong style={{ color: 'var(--text-primary)' }}>{text}</strong></div> },
    { title: 'PRESTIGE', dataIndex: 'prestige', key: 'prestige', render: renderHeatmapCell },
    { title: 'BOAT', dataIndex: 'boat', key: 'boat', render: renderHeatmapCell },
    { title: 'RAPIDO', dataIndex: 'rapido', key: 'rapido', render: renderHeatmapCell },
    { title: 'NYKAA', dataIndex: 'nykaa', key: 'nykaa', render: renderHeatmapCell },
    { title: 'CRED', dataIndex: 'cred', key: 'cred', render: renderHeatmapCell },
    { title: 'MEESHO', dataIndex: 'meesho', key: 'meesho', render: renderHeatmapCell },
    { title: 'LENSKART', dataIndex: 'lenskart', key: 'lenskart', render: renderHeatmapCell },
    { title: 'BHARATPE', dataIndex: 'bharatpe', key: 'bharatpe', render: renderHeatmapCell },
    { title: 'OTHERS', dataIndex: 'others', key: 'others', render: renderHeatmapCell },
    { title: 'TOTAL', dataIndex: 'total', key: 'total', render: val => <strong style={{ color: 'var(--text-primary)' }}>{val}h</strong> },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        <div style={{ paddingBottom: 12, borderBottom: '2px solid var(--accent-secondary)', fontWeight: 700, color: 'var(--accent-secondary)' }}>Team Overview</div>
        <div style={{ paddingBottom: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>HRMS</div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 04 · AGENCY OPS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Teams</Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>Your people, roles, capacity and performance — all in one place.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Tag style={{ borderRadius: 16, padding: '8px 16px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>BCC Martech - 5 team members</Tag>
          <Button icon={<UserPlus size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Invite Member</Button>
          <Button type="primary" icon={<Download size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', height: 40, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-md)' }}>Export</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
          {[
            { label: 'TEAM SIZE', val: '5', sub: 'Active members', showIcon: true },
            { label: 'AVG UTILISATION', val: '81%', sub: 'Billable hours this month', pos: '+2% vs last month' },
            { label: 'TOTAL HOURS (MTD)', val: '648h', sub: 'of 800h capacity', pos: '+42h vs last month' },
            { label: 'OPEN TASKS', val: '47', alert: '12 urgent · 35 normal' },
          ].map((kpi, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card className="glassmorphism" bodyStyle={{ padding: '24px' }} style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>{kpi.label}</Text>
                  {kpi.showIcon && <Tag style={{ borderRadius: '50%', width: 28, height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, border: 'none', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)', margin: 0 }}><UserPlus size={14} /></Tag>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <Title level={2} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1 }}>{kpi.val}</Title>
                  {kpi.pos && <Text style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700 }}>▲ {kpi.pos}</Text>}
                </div>
                <Text style={{ fontSize: 13, color: kpi.alert ? 'var(--accent-danger)' : 'var(--text-secondary)', display: 'block', marginTop: 12, fontWeight: 500 }}>
                  {kpi.alert ? <span><strong style={{ color: 'var(--accent-danger)' }}>12 urgent</strong> <span style={{ color: 'var(--text-secondary)' }}>· 35 normal</span></span> : kpi.sub}
                </Text>
                {kpi.label === 'AVG UTILISATION' && <Progress percent={81} showInfo={false} strokeColor="var(--accent-primary)" trailColor="var(--bg-tertiary)" size="small" style={{ marginTop: 12 }} />}
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Team Members</Title>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 8, padding: 4, border: '1px solid var(--border-color)' }}>
            <Button type={view === 'cards' ? 'primary' : 'text'} size="small" style={{ borderRadius: 6, height: 32, fontWeight: 600, background: view === 'cards' ? 'var(--bg-tertiary)' : 'transparent', color: view === 'cards' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: view === 'cards' ? 'var(--shadow-sm)' : 'none' }} onClick={() => setView('cards')}><LayoutGrid size={14} style={{ marginRight: 6 }}/> Cards</Button>
            <Button type={view === 'list' ? 'primary' : 'text'} size="small" style={{ borderRadius: 6, height: 32, fontWeight: 600, background: view === 'list' ? 'var(--bg-tertiary)' : 'transparent', color: view === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: view === 'list' ? 'var(--shadow-sm)' : 'none' }} onClick={() => setView('list')}><List size={14} style={{ marginRight: 6 }}/> List</Button>
          </div>
        </div>

        {/* NEW PILLARED PROFILE ARCH CARDS */}
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          {teamMembers.map((member, i) => (
            <Col xs={24} lg={8} key={i}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <Card 
                  style={{ 
                    borderRadius: '160px 160px 16px 16px', // Arch shape
                    border: '1px solid var(--border-color)', 
                    height: '100%',
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden'
                  }} 
                  bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  {/* Top Arch Section */}
                  <div style={{ 
                    background: `radial-gradient(circle at top, ${member.color}25 0%, var(--bg-secondary) 70%)`,
                    padding: '32px 24px 24px',
                    textAlign: 'center',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <Avatar size={96} style={{ backgroundColor: member.color, fontSize: 32, fontWeight: 800, border: '4px solid var(--bg-primary)', boxShadow: 'var(--shadow-md)', marginBottom: 16 }}>{member.initials}</Avatar>
                    <strong style={{ fontSize: 20, display: 'block', color: 'var(--text-primary)', marginBottom: 4 }}>{member.name}</strong>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{member.role} · BCC Martech</Text>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
                      <Tag style={{ margin: 0, borderRadius: 12, border: `1px solid ${member.color}`, color: member.color, background: 'transparent', fontWeight: 700, padding: '2px 10px' }}>{member.role}</Tag>
                      <Tag style={{ margin: 0, borderRadius: 12, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight: 600, padding: '2px 10px' }}>{member.level}</Tag>
                    </div>
                  </div>

                  {/* Body Section */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                        <Text type="secondary" style={{ fontWeight: 600 }}>Utilisation — June 2026</Text>
                        <strong><span style={{ color: member.color, fontWeight: 800 }}>{member.util}%</span> <span style={{ color: 'var(--text-secondary)' }}>· {member.totalHours}h / {member.capacity}h</span></strong>
                      </div>
                      <Progress percent={member.util} showInfo={false} strokeColor={member.color} trailColor="var(--bg-tertiary)" size="small" />
                    </div>

                    <div style={{ flex: 1, marginBottom: 24 }}>
                      <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>ASSIGNED CLIENTS</Text>
                      {member.clients.map(c => (
                        <div key={c} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>• {c}</span>
                          <Text type="secondary" style={{ fontWeight: 600 }}>{Math.floor(Math.random() * 20 + 10)}h</Text>
                        </div>
                      ))}
                      <a style={{ fontSize: 13, color: 'var(--accent-secondary)', fontWeight: 700, display: 'block', marginTop: 8 }}>+ {member.numClients - 3} more</a>
                    </div>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24, background: 'var(--bg-primary)', padding: '16px 0', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                      <Col span={8} style={{ textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>Tasks</Text>
                        <strong style={{ display: 'block', fontSize: 18, color: 'var(--text-primary)' }}>{member.tasks}</strong>
                      </Col>
                      <Col span={8} style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>Avg resp.</Text>
                        <strong style={{ display: 'block', fontSize: 18, color: 'var(--text-primary)' }}>{member.avgHrs}h</strong>
                      </Col>
                      <Col span={8} style={{ textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>Clients</Text>
                        <strong style={{ display: 'block', fontSize: 18, color: 'var(--text-primary)' }}>{member.numClients}</strong>
                      </Col>
                    </Row>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <Button style={{ flex: 1, borderRadius: 8, height: 40, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>View Profile</Button>
                      <Button type="primary" style={{ flex: 1, borderRadius: 8, height: 40, fontWeight: 600, background: 'var(--accent-secondary)', border: 'none' }}>Assign Task</Button>
                    </div>
                  </div>

                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Team Utilisation — This Month</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Billable vs non-billable hours per team member</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilChartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 13, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ paddingTop: 20, fontWeight: 500, color: 'var(--text-secondary)' }} />
                <Bar dataKey="billable" name="Billable" stackId="a" fill="var(--accent-secondary)" radius={[0, 0, 0, 0]} maxBarSize={32} />
                <Bar dataKey="nonBillable" name="Non-billable" stackId="a" fill="var(--bg-tertiary)" radius={[0, 4, 4, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Who Works on Which Clients</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Hours allocated this month — hover any cell to see details.</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginBottom: 40 }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={allocationCols} dataSource={teamAllocationData} pagination={false} rowKey="name" size="middle" scroll={{ x: 1200 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default Teams;
