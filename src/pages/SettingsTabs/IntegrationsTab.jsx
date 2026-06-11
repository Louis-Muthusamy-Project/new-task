import React from 'react';
import { Typography, Card, Button, Table, Tag, Row, Col, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { Plus, Eye, RefreshCw, Play, Edit2, Trash2, CheckCircle2, AlertTriangle, AlertCircle, Link } from 'lucide-react';

const { Title, Text } = Typography;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  }
};

const SummaryCard = ({ title, value, subtext, subtextColor }) => (
  <Card style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{title}</Text>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
    </div>
    <Text style={{ fontSize: 13, fontWeight: 500, color: subtextColor || 'var(--text-secondary)' }}>{subtext}</Text>
  </Card>
);

const IntegrationsTab = () => {

  const connections = [
    { id: '1', source: 'Google Analytics 4', category: 'Analytics', status: 'Healthy', clients: 8, lastSync: '2m ago' },
    { id: '2', source: 'Google Search Console', category: 'SEO', status: 'Healthy', clients: 8, lastSync: '5m ago' },
    { id: '3', source: 'Google Ads', category: 'Paid', status: 'Healthy', clients: 6, lastSync: '1m ago' },
    { id: '4', source: 'Meta Business Suite', category: 'Paid / Social', status: 'Degraded', clients: 7, lastSync: '1h ago' },
    { id: '5', source: 'WhatsApp Business API', category: 'Messaging', status: 'Healthy', clients: 5, lastSync: 'just now' },
    { id: '6', source: 'GoHighLevel CRM', category: 'CRM', status: 'Healthy', clients: 4, lastSync: '12m ago' },
    { id: '7', source: 'HubSpot', category: 'CRM', status: 'Error', clients: 2, lastSync: '3h ago' },
    { id: '8', source: 'Cloud Telephony / IVR', category: 'Calls', status: 'Healthy', clients: 3, lastSync: '8m ago' },
    { id: '9', source: 'LinkedIn Ads', category: 'Paid', status: 'Degraded', clients: 2, lastSync: '45m ago' },
  ];

  const getStatusTag = (status) => {
    if (status === 'Healthy') return <Tag style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 700, border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)' }}><CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: '-2px' }}/> {status}</Tag>;
    if (status === 'Degraded') return <Tag style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 700, border: 'none', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}><AlertTriangle size={12} style={{ marginRight: 4, verticalAlign: '-2px' }}/> {status}</Tag>;
    if (status === 'Error') return <Tag style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 700, border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}><AlertCircle size={12} style={{ marginRight: 4, verticalAlign: '-2px' }}/> {status}</Tag>;
    return <Tag>{status}</Tag>;
  };

  const connCols = [
    { title: 'SOURCE', dataIndex: 'source', key: 'source', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: 'CATEGORY', dataIndex: 'category', key: 'category', render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: s => getStatusTag(s) },
    { title: 'CLIENTS', dataIndex: 'clients', key: 'clients', render: t => <Text style={{ fontWeight: 600 }}>{t}</Text> },
    { title: 'LAST SYNC', dataIndex: 'lastSync', key: 'lastSync', render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
    { title: '', key: 'actions', align: 'right', render: () => <a style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Manage</a> },
  ];

  const apiKeys = [
    { id: '1', service: 'Claude (Anthropic) API', key: 'sk-ant-···············-ab', status: 'Active', lastUsed: '2 min ago' },
    { id: '2', service: 'OpenAI (GPT-4o) API', key: 'sk-proj-···············-1234', status: 'Active', lastUsed: '1 hr ago' },
    { id: '3', service: 'Razorpay Key ID', key: 'rzp_live_·······-4d', status: 'Active', lastUsed: '5 min ago' },
    { id: '4', service: 'Razorpay Secret', key: '••••••••••••••••••', status: 'Active', lastUsed: '—' },
    { id: '5', service: 'Stripe Publishable', key: 'pk_live_····-····', status: 'Active', lastUsed: '1 day ago' },
    { id: '6', service: 'Stripe Secret', key: '••••••••••••••••••', status: 'Active', lastUsed: '—' },
  ];

  const apiCols = [
    { title: 'SERVICE', dataIndex: 'service', key: 'service', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: 'KEY', dataIndex: 'key', key: 'key', render: t => <code style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{t}</code> },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: () => <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14} style={{ color: 'var(--accent-primary)' }}/> Active</span> },
    { title: 'LAST USED', dataIndex: 'lastUsed', key: 'lastUsed', render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
    { title: 'ACTIONS', key: 'actions', align: 'right', render: () => (
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
        <a style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 600, fontSize: 12 }}><Eye size={14}/> Reveal</a>
        <a style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 600, fontSize: 12 }}><RefreshCw size={14}/> Rotate</a>
        <a style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 600, fontSize: 12 }}><Play size={14}/> Test</a>
      </div>
    )},
  ];

  const webhooks = [
    { id: '1', url: 'https://hooks.slack.com/services/T0.../B0.../xy...', events: 'MOS drop, SLA breach', status: 'Active', lastTriggered: '2 min ago' },
    { id: '2', url: 'https://n8n.bccmartech.com/webhook/m1-events', events: 'All events', status: 'Active', lastTriggered: '5 min ago' },
  ];

  const webhookCols = [
    { title: 'ENDPOINT URL', dataIndex: 'url', key: 'url', render: t => <code style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</code> },
    { title: 'EVENTS', dataIndex: 'events', key: 'events', render: t => <Text style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t}</Text> },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: () => <Tag style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 700, border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--text-primary)' }}><CheckCircle2 size={12} style={{ color: 'var(--accent-primary)', marginRight: 4, verticalAlign: '-2px' }}/> Active</Tag> },
    { title: 'LAST TRIGGERED', dataIndex: 'lastTriggered', key: 'lastTriggered', render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
    { title: 'ACTIONS', key: 'actions', align: 'right', render: () => (
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
        <a style={{ color: 'var(--text-primary)' }}><Edit2 size={16}/></a>
        <a style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 600, fontSize: 12 }}>Test</a>
        <a style={{ color: 'var(--accent-danger)' }}><Trash2 size={16}/></a>
      </div>
    )},
  ];

  return (
    <>
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Row gutter={24}>
          <Col span={6}>
            <SummaryCard title="CONNECTED SOURCES" value="9" subtext="Across all clients" />
          </Col>
          <Col span={6}>
            <SummaryCard title="HEALTHY" value="6" subtext="+1" subtextColor="var(--accent-primary)" />
          </Col>
          <Col span={6}>
            <SummaryCard title="DEGRADED" value="2" subtext="Need attention" subtextColor="var(--accent-warning)" />
          </Col>
          <Col span={6}>
            <SummaryCard title="ERRORS" value="1" subtext="-1" subtextColor="var(--accent-danger)" />
          </Col>
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>Connections</strong>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>API health monitored every 60 seconds.</Text>
            </div>
            <Button type="primary" style={{ background: 'var(--accent-primary)', fontWeight: 700, borderRadius: 8 }} icon={<Link size={16} />}>Connect source</Button>
          </div>
          <Table columns={connCols} dataSource={connections} pagination={false} size="middle" rowClassName={() => 'hover-bg'} />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
              <Link size={18}/> API Keys & Credentials
            </strong>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Keys used by M1 to power AI features. Keep these secret.</Text>
          </div>
          <Table columns={apiCols} dataSource={apiKeys} pagination={false} size="middle" rowClassName={() => 'hover-bg'} />
          <div style={{ padding: '16px 32px' }}>
            <Button style={{ fontWeight: 600, borderRadius: 8 }} icon={<Plus size={16} />}>Add API Key</Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 48 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
              <RefreshCw size={18}/> Webhook Endpoints
            </strong>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Send M1 events to external tools — Slack, n8n, Zapier, custom.</Text>
          </div>
          <Table columns={webhookCols} dataSource={webhooks} pagination={false} size="middle" rowClassName={() => 'hover-bg'} />
          
          <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Button style={{ fontWeight: 600, borderRadius: 8 }} icon={<Plus size={16} />}>Add Webhook</Button>
            
            <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: 16, borderRadius: 8, maxWidth: 300 }}>
              <strong style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--text-primary)' }}>Available events</strong>
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5, fontWeight: 500, display: 'block' }}>
                MOS score drops &gt;5 pts • SLA breach • New lead synced • Invoice paid • Invoice overdue • Content approved • AI agent alert • New client added • Team member logged in
              </Text>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default IntegrationsTab;
