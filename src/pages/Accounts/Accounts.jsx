import React, { useState } from 'react';
import { Typography, Row, Col, Card, Table, Tag, Button, Input, Select, Progress, Avatar, Space } from 'antd';
import { motion } from 'framer-motion';
import { Download, Plus, LayoutGrid, List, ArrowUpRight, Users, CircleDollarSign, Activity, AlertTriangle } from 'lucide-react';
import { agencyClients } from '../../data/mock';

const { Title, Text } = Typography;
const { Option } = Select;

const Accounts = () => {
  const [filter, setFilter] = useState('All');

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
          <div>
            <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{text}</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginTop: 2 }}>
              <span style={{ color: record.status === 'Healthy' ? 'var(--accent-secondary)' : record.status.includes('risk') || record.status === 'Critical' ? 'var(--accent-danger)' : 'var(--accent-warning)', fontSize: 10 }}>●</span>
              <Text type="secondary">{record.status}</Text>
            </div>
          </div>
        </div>
      )
    },
    { 
      title: 'STAGE', 
      dataIndex: 'status', 
      key: 'stage', 
      render: text => {
        let color = text === 'Healthy' ? 'success' : text.includes('risk') ? 'error' : 'warning';
        let label = text === 'Healthy' ? 'Active' : text;
        return <Tag color={color} style={{ borderRadius: 12, background: 'transparent', border: `1px solid var(--accent-${color === 'success' ? 'secondary' : color === 'error' ? 'danger' : 'warning'})`, color: `var(--accent-${color === 'success' ? 'secondary' : color === 'error' ? 'danger' : 'warning'})` }}>{label}</Tag>
      } 
    },
    { title: 'INDUSTRY', dataIndex: 'industry', key: 'industry', render: text => <Text type="secondary">{text}</Text> },
    { 
      title: 'MOS ↑↓', 
      dataIndex: 'mos', 
      key: 'mos', 
      render: val => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ minWidth: 24, color: 'var(--text-primary)' }}>{val}</strong>
          <Progress percent={val} showInfo={false} size="small" strokeColor={val > 70 ? 'var(--accent-secondary)' : val > 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'} trailColor="var(--bg-tertiary)" style={{ width: 60 }} />
        </div>
      )
    },
    { title: 'SLA ↑↓', dataIndex: 'sla', key: 'sla', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}%</strong> },
    { title: 'MRR ↑↓', dataIndex: 'mrr', key: 'mrr', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { 
      title: 'Growth ↑↓', 
      dataIndex: 'growth', 
      key: 'growth', 
      render: text => <strong style={{ color: text.includes('+') ? 'var(--accent-secondary)' : 'var(--accent-danger)' }}>{text}</strong> 
    },
    { title: 'Leads 30d ↑↓', dataIndex: 'leads30d', key: 'leads30d', render: text => <span style={{ color: 'var(--text-primary)' }}>{text}</span> },
    { title: 'Contract ↑↓', dataIndex: 'contract', key: 'contract', render: text => <Text type="secondary">{text}</Text> },
    { title: 'OWNER', dataIndex: 'owner', key: 'owner', render: text => <Text type="secondary">{text}</Text> },
    { title: '', key: 'action', render: () => <ArrowUpRight size={16} color="var(--text-tertiary)" style={{ cursor: 'pointer' }} /> }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 01 · CLIENTS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Accounts</Title>
          <Text type="secondary">Every retainer, SLA, and conversation — from onboarding to renewal.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Export</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)' }}>New client</Button>
        </div>
      </motion.div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'ACCOUNTS IN VIEW', val: '12', sub: '12 total', icon: <Users size={20} />, color: 'var(--accent-primary)', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 100%)' },
          { label: 'MRR IN VIEW', val: '₹33.90 L', sub: 'Recurring revenue', icon: <CircleDollarSign size={20} />, color: 'var(--accent-secondary)', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, transparent 100%)' },
          { label: 'AVERAGE MOS', val: '68', sub: 'Marketing Op Score', icon: <Activity size={20} />, color: 'var(--accent-warning)', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, transparent 100%)' },
          { label: 'NEEDS ATTENTION', val: '3', sub: '1 critical · 2 churn-risk', icon: <AlertTriangle size={20} />, color: 'var(--accent-danger)', isAlert: true, gradient: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, transparent 100%)' }
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
                  <div style={{ padding: 8, borderRadius: 10, backgroundColor: 'var(--bg-secondary)', color: kpi.color, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    {kpi.icon}
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                  <Title level={2} style={{ margin: '0 0 4px', fontSize: 36, fontWeight: 800, color: kpi.isAlert ? 'var(--accent-danger)' : 'var(--text-primary)' }}>{kpi.val}</Title>
                  <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{kpi.sub}</Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants} className="glassmorphism" style={{ padding: '20px 24px', borderRadius: 16, marginBottom: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
          {[
            { label: 'All', count: 12 },
            { label: 'Healthy', count: 7 },
            { label: 'At-risk', count: 4 },
            { label: 'Critical', count: 1 },
            { label: 'Onboarding', count: 2 },
            { label: 'Churn risk', count: 2 }
          ].map(f => (
            <motion.div 
              key={f.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.label)}
              style={{ 
                padding: '6px 14px', 
                borderRadius: 20, 
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                background: filter === f.label ? 'var(--text-primary)' : 'transparent',
                color: filter === f.label ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: filter === f.label ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                fontWeight: filter === f.label ? 600 : 500,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {f.label} <Tag style={{ borderRadius: 12, margin: 0, background: filter === f.label ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)', border: 'none', color: 'inherit', fontWeight: 600 }}>{f.count}</Tag>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <Input.Search 
            placeholder="Search clients, industries, owners..." 
            style={{ width: '100%', maxWidth: 360 }} 
          />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Select defaultValue="All" style={{ width: 130 }} popupMatchSelectWidth={false}>
              <Option value="All">Industry: All</Option>
            </Select>
            <Select defaultValue="All" style={{ width: 130 }} popupMatchSelectWidth={false}>
              <Option value="All">Owner: All</Option>
            </Select>
            <Select defaultValue="All" style={{ width: 130 }} popupMatchSelectWidth={false}>
              <Option value="All">Group by: All</Option>
            </Select>
            <div style={{ display: 'flex', gap: 8, borderLeft: '1px solid var(--border-color)', paddingLeft: 12 }}>
              <Button icon={<LayoutGrid size={16} />} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }} />
              <Button icon={<List size={16} />} type="primary" style={{ background: 'var(--accent-primary)', border: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={agencyClients} 
            rowKey="id" 
            pagination={false} 
            rowSelection={{ type: 'checkbox' }}
            size="middle"
            scroll={{ x: 1000 }} 
            style={{ minWidth: 1000 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Accounts;
