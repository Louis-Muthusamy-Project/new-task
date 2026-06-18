import React from 'react';
import { Typography, Button, Table, Tag, Switch, Select, Divider } from 'antd';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, XCircle, Shield, Check, X, ArrowRight } from 'lucide-react';

const { Title, Text } = Typography;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  }
};

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const TeamAccessTab = () => {

  const teamMembers = [
    { id: '1', name: 'Arjun Sharma', role: 'Admin', status: 'Active', lastLogin: 'Just now', twoFa: true },
    { id: '2', name: 'Priya Nair', role: 'Manager', status: 'Active', lastLogin: '2 hrs ago', twoFa: true },
    { id: '3', name: 'Karan Mehta', role: 'Executive', status: 'Active', lastLogin: 'Yesterday', twoFa: false },
    { id: '4', name: 'Divya Rao', role: 'Executive', status: 'Active', lastLogin: '3 hrs ago', twoFa: true },
    { id: '5', name: 'Rahul Singh', role: 'Manager', status: 'Active', lastLogin: '1 hr ago', twoFa: true },
  ];

  const teamCols = [
    { 
      title: 'MEMBER', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>
            {getInitials(text)}
          </div>
          <strong style={{ color: 'var(--text-primary)' }}>{text}</strong>
        </div>
      ) 
    },
    { title: 'ROLE', dataIndex: 'role', key: 'role', render: t => <Text style={{ fontWeight: 600 }}>{t}</Text> },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: () => <Tag style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 700, border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--text-primary)' }}><CheckCircle2 size={12} style={{ color: 'var(--accent-primary)', marginRight: 4, verticalAlign: '-2px' }}/> Active</Tag> },
    { title: 'LAST LOGIN', dataIndex: 'lastLogin', key: 'lastLogin', render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
    { title: '2FA', dataIndex: 'twoFa', key: 'twoFa', render: val => (
      val 
      ? <Tag style={{ borderRadius: 4, border: 'none', background: 'rgba(16, 185, 129, 1)', color: '#fff', fontWeight: 700, padding: '2px 8px' }}><Check size={12} style={{ marginRight: 4, verticalAlign: '-1px' }}/> Enabled</Tag> 
      : <Tag style={{ borderRadius: 4, border: 'none', background: 'rgba(239, 68, 68, 1)', color: '#fff', fontWeight: 700, padding: '2px 8px' }}><X size={12} style={{ marginRight: 4, verticalAlign: '-1px' }}/> Disabled</Tag>
    ) },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      align: 'right', 
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <a style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Edit</a>
          {record.twoFa ? (
            <a style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Remove</a>
          ) : (
            <a style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Enable 2FA</a>
          )}
        </div>
      ) 
    },
  ];

  const permissions = [
    { feature: 'All client data', admin: true, manager: true, executive: true, view: true },
    { feature: 'Edit client settings', admin: true, manager: true, executive: false, view: false },
    { feature: 'Profitability & finance', admin: true, manager: true, executive: false, view: false },
    { feature: 'Team management', admin: true, manager: false, executive: false, view: false },
    { feature: 'Integration management', admin: true, manager: true, executive: false, view: false },
    { feature: 'Run payroll', admin: true, manager: false, executive: false, view: false },
    { feature: 'Delete clients', admin: true, manager: false, executive: false, view: false },
    { feature: 'AI agents configure', admin: true, manager: true, executive: false, view: false },
    { feature: 'Export reports', admin: true, manager: true, executive: true, view: true },
    { feature: 'Settings & billing', admin: true, manager: false, executive: false, view: false },
  ];

  const renderIcon = (val) => val ? <Check size={16} color="var(--accent-primary)"/> : <XCircle size={16} color="var(--text-tertiary)" opacity={0.5}/>;

  const permCols = [
    { title: 'FEATURE', dataIndex: 'feature', key: 'feature', render: t => <strong style={{ color: 'var(--text-primary)' }}>{t}</strong> },
    { title: 'ADMIN', dataIndex: 'admin', key: 'admin', align: 'center', render: renderIcon },
    { title: 'MANAGER', dataIndex: 'manager', key: 'manager', align: 'center', render: renderIcon },
    { title: 'EXECUTIVE', dataIndex: 'executive', key: 'executive', align: 'center', render: renderIcon },
    { title: 'VIEW ONLY', dataIndex: 'view', key: 'view', align: 'center', render: renderIcon },
  ];

  return (
    <>
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Team & Access Control</Title>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Who can access M1 and what they can do.</Text>
        </div>
        <Button type="primary" icon={<Plus size={16}/>} style={{ background: 'var(--accent-primary)', fontWeight: 700, borderRadius: 8 }}>Invite Team Member</Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>Team Members</strong>
          </div>
          <Table columns={teamCols} dataSource={teamMembers} pagination={false} size="middle" rowClassName={() => 'hover-bg'} />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>Role Permissions</strong>
          </div>
          <Table columns={permCols} dataSource={permissions} pagination={false} size="middle" rowClassName={() => 'hover-bg'} />
          <div style={{ padding: '16px 32px' }}>
            <a style={{ color: 'var(--accent-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>Customise Roles <ArrowRight size={14}/></a>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', marginBottom: 48 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>Security</strong>
          </div>
          
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>Two-Factor Authentication</strong>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>3 of 5 team members have 2FA enabled</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Switch />
                <Button style={{ color: 'var(--accent-warning)', borderColor: 'var(--accent-warning)', fontWeight: 600, borderRadius: 8 }}>Send 2FA setup reminder</Button>
              </div>
            </div>

            <Divider style={{ margin: 0, borderColor: 'var(--border-color)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>Session Timeout</strong>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Auto-logout after period of inactivity</Text>
              </div>
              <Select defaultValue="8" style={{ width: 140 }}>
                <Select.Option value="8">8 hours</Select.Option>
              </Select>
            </div>

            <Divider style={{ margin: 0, borderColor: 'var(--border-color)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>Allowed IP addresses</strong>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Restrict login to specific IPs (office network)</Text>
              </div>
              <Switch />
            </div>

            <Divider style={{ margin: 0, borderColor: 'var(--border-color)' }} />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>Audit Log</strong>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Last 5 events shown — full log in drawer</Text>
                </div>
                <a style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>View full audit log</a>
              </div>
              <pre style={{ 
                margin: 0, 
                padding: 16, 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 8, 
                color: 'var(--text-secondary)', 
                fontSize: 12, 
                fontFamily: 'monospace',
                lineHeight: 1.6
              }}>
Jun 9 10:42 - Arjun Sharma logged in
Jun 9 09:15 - Priya Nair updated Meta Ads integration
Jun 8 17:30 - Arjun Sharma generated invoice INV 2026 062
Jun 8 14:22 - Karan Mehta published blog post
Jun 7 11:00 - Arjun Sharma added new client: Wakefit
              </pre>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TeamAccessTab;
