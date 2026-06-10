import React, { useState } from 'react';
import { Typography, Card, Select, Button, Switch, Input, Table, Tag, Avatar, ConfigProvider } from 'antd';
import { motion } from 'framer-motion';
import { ExternalLink, Upload, Pencil, Trash2, Plus, Palette, Layout, Database, Users, Bell } from 'lucide-react';
import { agencyClients } from '../data/mock';

const { Title, Text } = Typography;
const { Option } = Select;

const PortalSettings = () => {
  const [selectedClient, setSelectedClient] = useState('PE');

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

  const clientUsersCols = [
    { 
      title: 'USER', 
      key: 'user', 
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size="default" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600, border: '1px solid var(--border-color)' }}>{record.initials}</Avatar>
          <strong style={{ color: 'var(--text-primary)' }}>{record.name}</strong>
        </div>
      )
    },
    { title: 'ROLE', dataIndex: 'role', key: 'role', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'EMAIL', dataIndex: 'email', key: 'email', render: text => <Text type="secondary">{text}</Text> },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: text => <Tag style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'transparent', padding: '2px 10px', color: 'var(--text-primary)' }}><span style={{ color: 'var(--accent-secondary)' }}>●</span> {text}</Tag> },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      align: 'right',
      render: () => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="text" icon={<Pencil size={16} color="var(--text-secondary)" />} size="small" />
          <Button type="text" danger icon={<Trash2 size={16} />} size="small" />
        </div>
      ) 
    }
  ];

  const clientUsersData = [
    { key: '1', initials: 'RK', name: 'Rahul Kapoor', role: 'Admin', email: 'rahul@prestige.com', status: 'Active' },
    { key: '2', initials: 'SK', name: 'Sunita Kapoor', role: 'View Only', email: 'sunita@prestige.com', status: 'Active' },
  ];

  const SettingRow = ({ label, desc, action, borderBottom = true }) => (
    <motion.div 
      whileHover={{ backgroundColor: 'var(--bg-tertiary)', x: 4 }}
      transition={{ duration: 0.2 }}
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 20px', 
        borderBottom: borderBottom ? '1px solid var(--border-color)' : 'none',
        borderRadius: 8,
        flexWrap: 'wrap',
        gap: 16
      }}
    >
      <div style={{ flex: '1 1 250px' }}>
        <strong style={{ display: 'block', fontSize: 14, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</strong>
        {desc && <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>{desc}</Text>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>{action}</div>
    </motion.div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 01 · CLIENTS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Portal Settings</Title>
          <Text type="secondary">Per-client configuration for the white-label portal.</Text>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }} bodyStyle={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>CONFIGURING PORTAL FOR</Text>
            <Select value={selectedClient} onChange={setSelectedClient} style={{ width: 280, fontWeight: 600 }} size="large">
              {agencyClients.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </div>
          <Button icon={<ExternalLink size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Open Live Portal</Button>
        </Card>
      </motion.div>

      {/* Wrapping Switches inside ConfigProvider to allow native CSS variable overrides for checked state */}
      <ConfigProvider theme={{ components: { Switch: { colorPrimary: 'var(--accent-secondary)', colorPrimaryHover: 'var(--accent-secondary)' } } }}>
        <motion.div variants={itemVariants}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
                <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--accent-secondary)', border: '1px solid var(--border-color)' }}><Palette size={20} /></div>
                <div>
                  <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Portal Appearance — Prestige Estates</Title>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>These settings OVERRIDE agency defaults for this specific client.</Text>
                </div>
              </div>
            } 
            className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 8 }}
          >
            <SettingRow 
              label="Client Logo" 
              desc="Shown in client's portal header alongside your agency logo" 
              action={
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar style={{ backgroundColor: 'var(--accent-secondary)', fontWeight: 700, border: '1px solid var(--border-color)' }}>PE</Avatar>
                  <Button icon={<Upload size={14} />} style={{ borderRadius: 6, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>Upload</Button>
                </div>
              } 
            />
            <SettingRow 
              label="Client Primary Colour" 
              desc="Used for this client's portal accents" 
              action={
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--accent-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}></div>
                  <Input value="var(--accent-secondary)" style={{ width: 180, borderRadius: 6 }} />
                </div>
              } 
            />
            <SettingRow 
              label="Portal Title" 
              desc="Shown in browser tab and portal header" 
              action={<Input value="Prestige Estates Marketing OS" style={{ width: 280, borderRadius: 6 }} />} 
            />
            <SettingRow 
              label="Custom Domain (client-specific)" 
              desc={<span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><span style={{ color: 'var(--accent-secondary)' }}>●</span> Active</span>}
              borderBottom={false}
              action={
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Switch defaultChecked />
                  <Input value="prestige.portal.bccmartech.com" style={{ width: 280, borderRadius: 6 }} />
                </div>
              } 
            />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
                <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--accent-primary)', border: '1px solid var(--border-color)' }}><Layout size={20} /></div>
                <div>
                  <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Which portal tabs does this client see?</Title>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Turn off tabs that aren't relevant for this client.</Text>
                </div>
              </div>
            } 
            className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 8 }}
          >
            <SettingRow label="Dashboard" desc="always on — cannot toggle off" action={<Switch defaultChecked disabled />} />
            <SettingRow label="My Performance" action={<Switch defaultChecked />} />
            <SettingRow label="Leads" action={<Switch defaultChecked />} />
            <SettingRow label="Tasks" action={<Switch defaultChecked />} />
            <SettingRow label="Billing" action={<Switch defaultChecked />} />
            <SettingRow label="Support" action={<Switch defaultChecked />} />
            <SettingRow label="Store (Marketplace)" action={<Switch defaultChecked />} borderBottom={false} />
            <div style={{ padding: '16px 20px', background: 'var(--bg-tertiary)', borderRadius: 8, margin: 8, border: '1px solid var(--border-color)' }}>
              <Text type="secondary" style={{ fontSize: 13, fontStyle: 'italic', display: 'block' }}>For a client without lead tracking, turn off the Leads tab.</Text>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
                <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--accent-warning)', border: '1px solid var(--border-color)' }}><Database size={20} /></div>
                <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>What data can this client see?</Title>
              </div>
            } 
            className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 8 }}
          >
            <SettingRow label="Show MOS Score" action={<Switch defaultChecked />} />
            <SettingRow label="Show competitor benchmarks" action={<Switch defaultChecked />} />
            <SettingRow label="Show lead source breakdown" action={<Switch defaultChecked />} />
            <SettingRow label="Show ad spend amounts" action={<Switch defaultChecked />} />
            <SettingRow label="Show individual keyword rankings" action={<Switch defaultChecked />} />
            <SettingRow label="Show GEO / AI citations" action={<Switch defaultChecked />} />
            <SettingRow label="Show team member names" desc="client sees initials only" action={<Switch />} />
            <SettingRow label="Show agency cost data" desc="always off — cannot toggle on" action={<Switch disabled />} />
            <SettingRow label="Show other client data" desc="always off — cannot toggle on" action={<Switch disabled />} borderBottom={false} />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
                <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--accent-secondary)', border: '1px solid var(--border-color)' }}><Users size={20} /></div>
                <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Who has access to this client's portal?</Title>
              </div>
            } 
            className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0, overflow: 'hidden' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <Table columns={clientUsersCols} dataSource={clientUsersData} pagination={false} size="middle" scroll={{ x: 600 }} style={{ minWidth: 600 }} />
            </div>
            <div style={{ padding: 20, borderTop: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
              <Button type="primary" icon={<Plus size={16} />} style={{ background: 'var(--accent-secondary)', borderRadius: 8, border: 'none', height: 40, fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}>Invite Client User</Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8 }}>
                <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-tertiary)', color: 'var(--accent-danger)', border: '1px solid var(--border-color)' }}><Bell size={20} /></div>
                <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>What alerts does this client receive?</Title>
              </div>
            } 
            className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 8 }}
          >
            <SettingRow label="Monthly performance report" desc="1st of month · Email" action={<Switch defaultChecked />} />
            <SettingRow label="SLA breach notification" desc="Immediate · Email + WhatsApp" action={<Switch defaultChecked />} />
            <SettingRow label="Content approval reminder" desc="After 3 days pending · Email" action={<Switch defaultChecked />} />
            <SettingRow label="New lead notification" action={<Switch />} />
            <SettingRow label="Invoice due reminder" desc="7 days before due · Email" action={<Switch defaultChecked />} />
            <SettingRow label="MOS milestone (score improves)" desc="Email" action={<Switch defaultChecked />} />
            <SettingRow label="Approval needed alert" desc="Immediate · WhatsApp" action={<Switch defaultChecked />} borderBottom={false} />
          </Card>
        </motion.div>
      </ConfigProvider>
    </motion.div>
  );
};

export default PortalSettings;
