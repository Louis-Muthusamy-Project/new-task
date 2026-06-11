import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Tag, Avatar, Input, Tabs } from 'antd';
import { motion } from 'framer-motion';
import { UserPlus, Download, Search, LayoutGrid, List, CheckCircle2, AlertCircle, Calendar, IndianRupee, Star, Briefcase, FileText, BarChart2 } from 'lucide-react';

const { Title, Text } = Typography;

const HRMSTab = () => {
  const [view, setView] = useState('cards');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const teamMembers = [
    { name: 'Arjun Sharma', role: 'Senior SEO Lead', id: 'EMP-001', initials: 'AS', color: 'var(--accent-warning)', joined: '1 Mar 2023', dept: 'SEO & Content', ctc: '₹18,00,000/yr', rating: 4.6, leave: '12d', tasks: 28, util: '90%', tags: [{label: 'FULL-TIME', color: 'blue'}, {label: 'SENIOR', color: 'purple'}, {label: 'ACTIVE', color: 'green'}] },
    { name: 'Priya Nair', role: 'Paid Media Specialist', id: 'EMP-002', initials: 'PN', color: 'var(--accent-primary)', joined: '15 Jun 2023', dept: 'Performance Ads', ctc: '₹14,00,000/yr', rating: 4.4, leave: '8d', tasks: 22, util: '78%', tags: [{label: 'FULL-TIME', color: 'blue'}, {label: 'MID-LEVEL', color: 'purple'}, {label: 'ACTIVE', color: 'green'}] },
    { name: 'Karan Mehta', role: 'Content Strategist', id: 'EMP-003', initials: 'KM', color: 'var(--accent-info)', joined: '1 Sep 2023', dept: 'Content & SEO', ctc: '₹12,00,000/yr', rating: 4.1, leave: '14d', tasks: 18, util: '68%', tags: [{label: 'FULL-TIME', color: 'blue'}, {label: 'MID-LEVEL', color: 'purple'}, {label: 'ACTIVE', color: 'green'}] },
    { name: 'Divya Rao', role: 'Creative Designer', id: 'EMP-004', initials: 'DR', color: 'var(--accent-secondary)', joined: '15 Jan 2024', dept: 'Design', ctc: '₹11,00,000/yr', rating: 4.3, leave: '16d', tasks: 14, util: '83%', tags: [{label: 'FULL-TIME', color: 'blue'}, {label: 'MID-LEVEL', color: 'purple'}, {label: 'ACTIVE', color: 'green'}] },
    { name: 'Rahul Singh', role: 'Account Manager', id: 'EMP-005', initials: 'RS', color: 'var(--accent-danger)', joined: '1 Apr 2022', dept: 'Client Success', ctc: '₹15,00,000/yr', rating: 4.5, leave: '6d', tasks: 24, util: '88%', tags: [{label: 'FULL-TIME', color: 'blue'}, {label: 'SENIOR', color: 'purple'}, {label: 'ACTIVE', color: 'green'}] },
  ];

  const getTagColor = (colorType) => {
    switch(colorType) {
      case 'blue': return { bg: 'rgba(56, 189, 248, 0.15)', text: 'var(--accent-info)' };
      case 'purple': return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' };
      case 'green': return { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--accent-primary)' };
      default: return { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 04 · AGENCY OPS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>HRMS</Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>People operations for BCC Martech — hire, manage, develop, retain.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Tag style={{ borderRadius: 16, padding: '8px 16px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>BCC Martech · 5 employees</Tag>
          <Button icon={<UserPlus size={16} />} style={{ borderRadius: 8, fontWeight: 600, border: 'none', color: '#fff', background: 'var(--accent-warning)', height: 40, boxShadow: 'var(--shadow-sm)' }}>Add Employee</Button>
          <Button icon={<IndianRupee size={16} />} style={{ borderRadius: 8, fontWeight: 600, border: 'none', color: '#fff', background: 'var(--accent-primary)', height: 40, boxShadow: 'var(--shadow-sm)' }}>Run Payroll</Button>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Export</Button>
        </div>
      </motion.div>

      {/* Summary Metrics */}
      <motion.div variants={itemVariants}>
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          {[
            { label: 'TOTAL EMPLOYEES', val: '5', sub: '4 full-time · 1 contractor', tag: null },
            { label: 'ON LEAVE TODAY', val: '0', sub: 'All team present ✓', tag: { text: 'ALL IN', color: 'rgba(16, 185, 129, 0.15)', tc: 'var(--accent-primary)' } },
            { label: 'PENDING APPROVALS', val: '3', sub: '2 leave · 1 expense', tag: { text: 'ACTION', color: 'rgba(245, 158, 11, 0.15)', tc: 'var(--accent-warning)' } },
            { label: 'PAYROLL THIS MONTH', val: '₹4,80,000', sub: 'Next run: 30 Jun 2026', tag: null, pos: '+₹20,000 vs last month' },
            { label: 'AVG PERFORMANCE', val: '4.2/5', sub: '★★★★☆', tag: null, isStars: true },
            { label: 'OPEN POSITIONS', val: '2', sub: '1 urgent · 1 planned', tag: { text: 'HIRING', color: 'rgba(245, 158, 11, 0.15)', tc: 'var(--accent-warning)' } },
          ].map((metric, i) => (
            <Col xs={24} sm={12} lg={4} key={i}>
              <Card className="glassmorphism hover-bg" style={{ borderRadius: 16, border: '1px solid var(--border-color)', height: '100%' }} bodyStyle={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{metric.label}</Text>
                  {metric.tag && <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: metric.tag.color, color: metric.tag.tc, fontWeight: 800, fontSize: 10 }}>{metric.tag.text}</Tag>}
                </div>
                <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>{metric.val}</Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text style={{ color: metric.isStars ? 'var(--accent-warning)' : 'var(--text-secondary)', fontSize: 13, fontWeight: metric.isStars ? 800 : 500 }}>{metric.sub}</Text>
                  {metric.pos && <Text style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700 }}>▲ {metric.pos}</Text>}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Inner Tabs Navigation */}
      <motion.div variants={itemVariants} style={{ marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', minWidth: 800 }}>
          {[
            { id: 'people', label: 'People', icon: <UserPlus size={16} /> },
            { id: 'attendance', label: 'Attendance', icon: <Calendar size={16} /> },
            { id: 'leave', label: 'Leave', icon: <CheckCircle2 size={16} /> },
            { id: 'payroll', label: 'Payroll', icon: <IndianRupee size={16} /> },
            { id: 'performance', label: 'Performance', icon: <Star size={16} /> },
            { id: 'recruitment', label: 'Recruitment', icon: <Briefcase size={16} /> },
            { id: 'training', label: 'Training', icon: <FileText size={16} /> },
            { id: 'analytics', label: 'HR Analytics', icon: <BarChart2 size={16} /> },
          ].map(tab => {
            const isActive = tab.id === 'people';
            return (
              <div key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16, borderBottom: isActive ? '2px solid var(--accent-warning)' : '2px solid transparent', color: isActive ? 'var(--accent-warning)' : 'var(--text-secondary)', fontWeight: isActive ? 700 : 600, cursor: 'pointer' }}>
                <span style={{ color: isActive ? 'inherit' : 'var(--text-tertiary)' }}>{tab.icon}</span>
                {tab.label}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Directory Section Header */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'var(--text-primary)' }}>Employee Directory</Title>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>5 active employees · 1 contractor</Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 8, padding: 4, border: '1px solid var(--border-color)' }}>
            <Button type={view === 'cards' ? 'primary' : 'text'} onClick={() => setView('cards')} icon={<LayoutGrid size={16} />} style={{ borderRadius: 6, height: 32, padding: '0 12px', background: view === 'cards' ? 'var(--bg-tertiary)' : 'transparent', color: view === 'cards' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: 600, border: 'none', boxShadow: 'none' }}>Cards</Button>
            <Button type={view === 'list' ? 'primary' : 'text'} onClick={() => setView('list')} icon={<List size={16} />} style={{ borderRadius: 6, height: 32, padding: '0 12px', background: view === 'list' ? 'var(--bg-tertiary)' : 'transparent', color: view === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: 600, border: 'none', boxShadow: 'none' }}>List</Button>
          </div>
          <Input prefix={<Search size={16} color="var(--text-tertiary)" />} placeholder="Search employees..." style={{ width: 250, borderRadius: 8, background: 'var(--bg-primary)', borderColor: 'var(--border-color)' }} />
        </div>
      </motion.div>

      {/* Directory Grid */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]}>
          {teamMembers.map((member, i) => (
            <Col xs={24} md={12} xl={8} key={i}>
              <Card 
                className="glassmorphism hover-bg" 
                style={{ borderRadius: 16, border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}
                bodyStyle={{ padding: 24 }}
              >
                {/* Top Border Accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: member.color }} />
                
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <Avatar size={56} style={{ background: member.color, fontSize: 20, fontWeight: 800, flexShrink: 0 }}>{member.initials}</Avatar>
                  <div>
                    <Title level={5} style={{ margin: '0 0 2px 0', fontWeight: 800 }}>{member.name}</Title>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 2 }}>{member.role}</Text>
                    <Text type="tertiary" style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>{member.id}</Text>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {member.tags.map((tag, tIdx) => {
                    const c = getTagColor(tag.color);
                    return (
                      <Tag key={tIdx} style={{ margin: 0, borderRadius: 12, border: 'none', background: c.bg, color: c.text, fontWeight: 800, fontSize: 10, padding: '2px 8px' }}>{tag.label}</Tag>
                    );
                  })}
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Calendar size={14} color="var(--text-tertiary)" style={{ marginTop: 2 }} />
                    <div>
                      <Text style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Joined: {member.joined}</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Briefcase size={14} color="var(--text-tertiary)" style={{ marginTop: 2 }} />
                    <div>
                      <Text style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>{member.dept}</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <IndianRupee size={14} color="var(--text-warning)" style={{ marginTop: 2 }} />
                    <div>
                      <strong style={{ fontSize: 12, color: 'var(--text-primary)', display: 'block' }}>{member.ctc}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Star size={14} color="var(--accent-primary)" style={{ marginTop: 2 }} />
                    <div>
                      <strong style={{ fontSize: 12, color: 'var(--text-primary)', display: 'block' }}>{member.rating}/5 <span style={{ color: 'var(--accent-warning)' }}>★★★★☆</span></strong>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '12px 0', marginBottom: 16, fontSize: 12 }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Leave: <strong style={{ color: 'var(--text-primary)' }}>{member.leave}</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Tasks: <strong style={{ color: 'var(--text-primary)' }}>{member.tasks}</strong></div>
                  <div style={{ color: 'var(--text-secondary)' }}>Util: <strong style={{ color: 'var(--text-primary)' }}>{member.util}</strong></div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button type="text" style={{ padding: '0 8px', fontWeight: 600, color: 'var(--text-secondary)' }}>View Profile</Button>
                  <Button type="text" style={{ padding: '0 8px', fontWeight: 600, color: 'var(--text-secondary)' }}>Assign Task</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>
    </motion.div>
  );
};

export default HRMSTab;
