import React, { useState } from 'react';
import { Typography, Row, Col, Card, Table, Tag, Button } from 'antd';
import { motion } from 'framer-motion';
import { Zap, Users, Send, TrendingUp, CheckCircle2, Circle, BarChart2, Eye, LayoutDashboard, Activity } from 'lucide-react';

const { Title, Text } = Typography;

const overviewWorkflows = [
  { id: 1, name: "new-camp-int-21", type: "Broadcast", status: "completed", messages: 2, contacts: 1, delivered: 2, pct: 100 },
  { id: 2, name: "new-camp-int-20", type: "Broadcast", status: "completed", messages: 2, contacts: 1, delivered: 2, pct: 100 },
  { id: 3, name: "new-camp-int-22", type: "Broadcast", status: "draft",     messages: 0, contacts: 0, delivered: 0, pct: 0   },
  { id: 4, name: "new-camp-int-19", type: "Broadcast", status: "completed", messages: 2, contacts: 1, delivered: 2, pct: 100 },
];

const barData = [
  { label: "Jun 3", value: 2, max: 2 },
  { label: "Jun 4", value: 0, max: 2 },
  { label: "Jun 5", value: 0, max: 2 },
  { label: "Jun 6", value: 0, max: 2 },
  { label: "Jun 7", value: 0, max: 2 },
  { label: "Jun 8", value: 0, max: 2 },
  { label: "Jun 9", value: 0, max: 2 },
];

const campaignPerf = [
  { name: "new-camp-int-21", info: "Delivered · 2 dispatched", pct: 100, color: "var(--accent-warning)" },
  { name: "new-camp-int-20", info: "Delivered · 2 dispatched", pct: 100, color: "var(--accent-danger)" },
  { name: "new-camp-int-22", info: "No Data · 0 dispatched",  pct: 0,   color: "var(--border-color)" },
  { name: "new-camp-int-19", info: "Delivered · 2 dispatched", pct: 100, color: "var(--accent-primary)" },
];

const OverviewTab = ({ itemVariants, onOpenBuilder }) => {
  const [sectionTab, setSectionTab] = useState("active");

  const columns = [
    { title: 'WORKFLOW NAME', dataIndex: 'name', key: 'name', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'TYPE', dataIndex: 'type', key: 'type', render: text => <Tag style={{ borderRadius: 12, border: 'none', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-info)', fontWeight: 600, padding: '2px 8px', display: 'flex', alignItems: 'center', width: 'fit-content', gap: 4 }}><Zap size={12}/> {text}</Tag> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: text => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: text === 'completed' ? 'var(--accent-secondary)' : 'var(--text-secondary)', fontWeight: 500 }}>
          {text === 'completed' ? <CheckCircle2 size={16}/> : <Circle size={16}/>} {text === 'completed' ? 'Completed' : 'Draft'}
        </span>
      )
    },
    { 
      title: 'MESSAGES SENT', 
      key: 'messages', 
      render: (_, record) => (
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>{record.messages}</strong>
          {record.contacts > 0 && <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>of {record.contacts} contact</Text>}
        </div>
      )
    },
    { 
      title: 'DELIVERED', 
      key: 'delivered', 
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 120 }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{record.delivered > 0 ? `${record.delivered} (${record.pct}%)` : "0"}</span>
          <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${record.pct}%`, background: 'var(--accent-secondary)', borderRadius: 2 }} />
          </div>
        </div>
      )
    },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      align: 'right', 
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button icon={<BarChart2 size={14} />} size="small" style={{ borderRadius: 6, borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }} onClick={() => onOpenBuilder(record)} />
          <Button icon={<Eye size={14} />} size="small" style={{ borderRadius: 6, borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }} />
        </div>
      ) 
    }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      
      {/* Page Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 24, padding: '16px 0' }}>
        <Tag style={{ borderRadius: 12, border: 'none', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-info)', fontWeight: 700, padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><Zap size={14}/> AUTOMATION MARKETING SUITE</Tag>
        <Title level={2} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Automation Dashboard</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>Monitor and manage your automated marketing campaigns, subscriber flows, and message delivery rates</Text>
      </motion.div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'TOTAL WORKFLOWS', val: '235', sub: 'All time', color: 'var(--accent-secondary)', icon: <LayoutDashboard size={24} color="var(--accent-secondary)" style={{ opacity: 0.4 }} /> },
          { label: 'ACTIVE FLOWS', val: '9', sub: 'Currently running', color: 'var(--accent-info)', icon: <Users size={24} color="var(--accent-info)" style={{ opacity: 0.4 }} /> },
          { label: 'DISPATCHED', val: '2', sub: 'Last 7 Days', color: 'var(--accent-warning)', icon: <Send size={24} color="var(--accent-warning)" style={{ opacity: 0.4 }} /> },
          { label: 'DELIVERY RATE', val: '100%', sub: '2 of 2 delivered', color: '#8b5cf6', icon: <TrendingUp size={24} color="#8b5cf6" style={{ opacity: 0.4 }} /> },
        ].map((kpi, i) => (
          <Col xs={24} sm={12} lg={6} style={{ flex: '1 1 200px', minWidth: 200}} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }} 
                style={{ 
                  borderRadius: 16, 
                  height: '100%', 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderTop: `4px solid ${kpi.color}`,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{kpi.label}</Text>
                  {kpi.icon}
                </div>
                <Title level={2} style={{ margin: 0, color: kpi.color, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{kpi.val}</Title>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{kpi.sub}</Text>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, height: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                <Activity size={18} color="var(--text-secondary)" />
                <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>Messages Sent (Selected Period)</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingBottom: 10 }}>
                {barData.map((d) => (
                  <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '12%', height: '100%' }}>
                    <div style={{ 
                      width: '100%', 
                      maxWidth: 40,
                      background: d.value > 0 ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
                      borderRadius: '4px 4px 0 0',
                      height: d.value > 0 ? `${(d.value / d.max) * 100}%` : '4%',
                      marginTop: 'auto'
                    }} />
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>{d.label}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }} style={{ borderRadius: 16, height: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <TrendingUp size={18} color="var(--text-secondary)" />
                <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>Campaign Performance (latest 4 workflows)</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'center' }}>
                {campaignPerf.map((c) => (
                  <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.pct > 0 ? c.color : 'var(--border-color)' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>{c.info}</Text>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, flex: 1 }}>
                        <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: c.pct > 0 ? c.color : 'var(--text-secondary)', minWidth: 36, textAlign: 'right' }}>{c.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Table Section */}
      <motion.div variants={itemVariants}>
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 24 }}>
            <div 
              style={{ padding: '16px 0', borderBottom: sectionTab === 'active' ? '2px solid var(--accent-secondary)' : '2px solid transparent', color: sectionTab === 'active' ? 'var(--accent-secondary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              onClick={() => setSectionTab('active')}
            >Active Workflows</div>
            <div 
              style={{ padding: '16px 0', borderBottom: sectionTab === 'executions' ? '2px solid var(--accent-secondary)' : '2px solid transparent', color: sectionTab === 'executions' ? 'var(--accent-secondary)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              onClick={() => setSectionTab('executions')}
            >User Executions</div>
          </div>
          <div style={{ padding: 24, overflowX: 'auto' }}>
            <Table 
              columns={columns} 
              dataSource={overviewWorkflows} 
              pagination={false} 
              rowKey="id" 
              size="middle" 
              scroll={{ x: 800 }} 
              style={{ minWidth: 800 }} 
              rowClassName={() => 'hover-bg'}
            />
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default OverviewTab;
