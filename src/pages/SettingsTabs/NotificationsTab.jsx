import React from 'react';
import { Typography, Switch, Table, Button } from 'antd';
import { motion } from 'framer-motion';
import { Mail, Bell, Smartphone, Edit2, CheckSquare } from 'lucide-react';

const { Title, Text } = Typography;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  }
};

const NotificationsTab = () => {

  const alertsData = [
    { id: '1', event: 'MOS drops >5 pts', alert: true, email: true, inapp: true, push: true, who: 'Assigned AM' },
    { id: '2', event: 'SLA breach detected', alert: true, email: true, inapp: true, push: true, who: 'Admin + AM' },
    { id: '3', event: 'Invoice overdue >3 days', alert: true, email: true, inapp: true, push: false, who: 'Admin' },
    { id: '4', event: 'Ad spend >90% of budget', alert: true, email: true, inapp: true, push: false, who: 'Assigned AM' },
    { id: '5', event: 'Content approval pending >3 days', alert: true, email: true, inapp: false, push: false, who: 'Assigned AM' },
    { id: '6', event: 'New lead synced', alert: true, email: false, inapp: true, push: false, who: 'Assigned AM' },
    { id: '7', event: 'Client portal login', alert: false, email: false, inapp: false, push: false, who: '—' },
    { id: '8', event: 'AI agent error', alert: true, email: true, inapp: false, push: true, who: 'Admin' },
    { id: '9', event: 'Invoice paid by client', alert: true, email: true, inapp: false, push: true, who: 'Admin' },
  ];

  const renderCheckbox = (val) => val ? <div style={{ background: 'var(--accent-primary)', color: '#fff', width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckSquare size={12}/></div> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>;

  const alertsCols = [
    { title: 'EVENT', dataIndex: 'event', key: 'event', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: 'ALERT', dataIndex: 'alert', key: 'alert', render: val => <Switch defaultChecked={val} style={{ background: val ? 'var(--accent-info)' : 'var(--bg-tertiary)' }} /> },
    { title: <Mail size={16} color="var(--text-secondary)"/>, dataIndex: 'email', key: 'email', align: 'center', render: renderCheckbox },
    { title: <Bell size={16} color="var(--text-secondary)"/>, dataIndex: 'inapp', key: 'inapp', align: 'center', render: renderCheckbox },
    { title: <Smartphone size={16} color="var(--text-secondary)"/>, dataIndex: 'push', key: 'push', align: 'center', render: renderCheckbox },
    { title: 'WHO', dataIndex: 'who', key: 'who', render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
  ];

  const reportsData = [
    { id: '1', client: 'Prestige Estates', report: 'Monthly Report', freq: 'Monthly', day: '1st', channel: 'Email', lastSent: '1 Jun' },
    { id: '2', client: 'boAt', report: 'Monthly Report', freq: 'Monthly', day: '1st', channel: 'Email', lastSent: '1 Jun' },
    { id: '3', client: 'Rapido', report: 'Weekly Digest', freq: 'Weekly', day: 'Monday', channel: 'Email+WA', lastSent: '3 Jun' },
    { id: '4', client: 'Wakefit', report: 'Monthly Report', freq: 'Monthly', day: '1st', channel: 'Email', lastSent: '1 Jun' },
    { id: '5', client: 'Nykaa', report: 'Monthly Report', freq: 'Monthly', day: '1st', channel: 'Email', lastSent: '1 Jun' },
    { id: '6', client: 'Meesho', report: 'Weekly Digest', freq: 'Weekly', day: 'Monday', channel: 'Email', lastSent: '3 Jun' },
    { id: '7', client: 'Zomato', report: 'Monthly Report', freq: 'Monthly', day: '1st', channel: 'Email', lastSent: '1 Jun' },
    { id: '8', client: 'Licious', report: 'Monthly Report', freq: 'Monthly', day: '1st', channel: 'Email+WA', lastSent: '1 Jun' },
  ];

  const reportsCols = [
    { title: 'CLIENT', dataIndex: 'client', key: 'client', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: 'REPORT', dataIndex: 'report', key: 'report', render: t => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</Text> },
    { title: 'FREQUENCY', dataIndex: 'freq', key: 'freq', render: t => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</Text> },
    { title: 'DAY', dataIndex: 'day', key: 'day', render: t => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</Text> },
    { title: 'CHANNEL', dataIndex: 'channel', key: 'channel', render: t => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</Text> },
    { title: 'LAST SENT', dataIndex: 'lastSent', key: 'lastSent', render: t => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</Text> },
    { title: 'EDIT', key: 'edit', align: 'right', render: () => <a style={{ color: 'var(--text-primary)' }}><Edit2 size={16}/></a> },
  ];

  const agentData = [
    { id: '1', agent: 'MOS Guardian', threshold: 'Score drops >5 pts', channel: 'WhatsApp + Email' },
    { id: '2', agent: 'Lead Sync', threshold: 'Sync failure >1 hour', channel: 'Email' },
    { id: '3', agent: 'SLA Watchdog', threshold: 'Breach detected', channel: 'WhatsApp + Slack' },
    { id: '4', agent: 'Ad Budget Guard', threshold: 'Spend >90% of budget', channel: 'WhatsApp' },
    { id: '5', agent: 'Report Dispatch', threshold: 'Report not opened 48h', channel: 'Email' },
    { id: '6', agent: 'SEO Tracker', threshold: 'New citation detected', channel: 'In-app only' },
  ];

  const agentCols = [
    { title: 'AGENT', dataIndex: 'agent', key: 'agent', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: 'ALERT THRESHOLD', dataIndex: 'threshold', key: 'threshold', render: t => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</Text> },
    { title: 'ALERT CHANNEL', dataIndex: 'channel', key: 'channel', render: t => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</Text> },
  ];

  return (
    <>
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Notification & Alert Settings</Title>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Control when M1 alerts you, your team, and your clients.</Text>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ display: 'block', fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>Agency Alerts</strong>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>When should M1 alert the agency team?</Text>
          </div>
          <Table columns={alertsCols} dataSource={alertsData} pagination={false} size="middle" rowClassName={() => 'hover-bg'} />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ display: 'block', fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>Automated Report Delivery</strong>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>M1 auto-generates and sends reports to clients on schedule.</Text>
          </div>
          <Table columns={reportsCols} dataSource={reportsData} pagination={false} size="middle" rowClassName={() => 'hover-bg'} />
          <div style={{ padding: '24px 32px' }}>
            <Button style={{ fontWeight: 600, borderRadius: 8 }}>Apply to all clients</Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 48 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ display: 'block', fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>AI Agent Alert Thresholds</strong>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>When should agents trigger alerts vs act silently?</Text>
          </div>
          <Table columns={agentCols} dataSource={agentData} pagination={false} size="middle" rowClassName={() => 'hover-bg'} />
        </div>
      </motion.div>
    </>
  );
};

export default NotificationsTab;
