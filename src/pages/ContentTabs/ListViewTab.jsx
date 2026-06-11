import React, { useState } from 'react';
import { Typography, Card, Table, Tag, Input, Select, Avatar, Button } from 'antd';
import { motion } from 'framer-motion';
import { Search, CheckCircle2 } from 'lucide-react';

const { Title, Text } = Typography;

const pipelineData = [
  { id: 1, title: 'Top 10 Luxury Projects Bangalore 2026', type: 'Blog', status: 'Published', assignee: 'Karan Mehta', initial: 'KM', color: '#3b82f6', due: '1 Jun', approved: true, action: 'View' },
  { id: 2, title: 'Prestige Somerville — Full Overview', type: 'Landing Page', status: 'In Review', assignee: 'Divya Rao', initial: 'DR', color: '#ec4899', due: '10 Jun', approved: 'Pending', action: 'Review' },
  { id: 3, title: 'June Instagram Grid (6 posts)', type: 'Social', status: 'Approved', assignee: 'Divya Rao', initial: 'DR', color: '#ec4899', due: '8 Jun', approved: true, action: 'View' },
  { id: 4, title: 'Investment Guide: Bangalore Real Estate', type: 'Blog', status: 'Draft', assignee: 'Karan Mehta', initial: 'KM', color: '#3b82f6', due: '20 Jun', approved: false, action: 'Edit' },
  { id: 5, title: 'Google Ads Copy — Summer Q2', type: 'Ad Copy', status: 'Pending Approval', assignee: 'Priya Nair', initial: 'PN', color: '#10b981', due: '12 Jun', approved: 'Pending', action: 'Review' },
  { id: 6, title: 'Whitefield Property Price Report', type: 'Blog', status: 'Scheduled', assignee: 'Karan Mehta', initial: 'KM', color: '#3b82f6', due: '25 Jun', approved: true, action: 'View' },
  { id: 7, title: 'July Instagram Grid', type: 'Social', status: 'Draft', assignee: 'Divya Rao', initial: 'DR', color: '#ec4899', due: '30 Jun', approved: false, action: 'Edit' },
  { id: 8, title: 'Luxury Living Guide 2026', type: 'Blog', status: 'In Review', assignee: 'Karan Mehta', initial: 'KM', color: '#3b82f6', due: '18 Jun', approved: 'Pending', action: 'Review' },
  { id: 9, title: 'Meta Ad Creatives — July', type: 'Ad Copy', status: 'Draft', assignee: 'Priya Nair', initial: 'PN', color: '#10b981', due: '28 Jun', approved: false, action: 'Edit' },
  { id: 10, title: 'Prestige Primrose Hills', type: 'Landing Page', status: 'Published', assignee: 'Divya Rao', initial: 'DR', color: '#ec4899', due: '15 May', approved: true, action: 'View' },
  { id: 11, title: 'June Email Newsletter', type: 'Email', status: 'Scheduled', assignee: 'Karan Mehta', initial: 'KM', color: '#3b82f6', due: '20 Jun', approved: true, action: 'View' },
  { id: 12, title: 'NRI Investment Guide', type: 'Blog', status: 'Draft', assignee: 'Karan Mehta', initial: 'KM', color: '#3b82f6', due: '15 Jul', approved: false, action: 'Edit' },
];

const ListViewTab = ({ itemVariants }) => {
  const columns = [
    { title: 'TITLE', dataIndex: 'title', key: 'title', render: text => <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{text}</strong> },
    { 
      title: 'TYPE', 
      dataIndex: 'type', 
      key: 'type', 
      render: val => {
        let color = 'processing';
        if (val === 'Landing Page') color = 'magenta';
        if (val === 'Social') color = 'cyan';
        if (val === 'Ad Copy') color = 'gold';
        if (val === 'Email') color = 'purple';
        return <Tag color={color} style={{ borderRadius: 12, fontWeight: 600 }}>{val}</Tag>;
      } 
    },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: val => {
        let color = 'default';
        if (val === 'Published' || val === 'Approved') color = 'success';
        if (val === 'In Review' || val === 'Pending Approval') color = 'warning';
        if (val === 'Scheduled') color = 'processing';
        return <Tag color={color} style={{ borderRadius: 12, fontWeight: 600 }}>{val}</Tag>;
      } 
    },
    { 
      title: 'ASSIGNED TO', 
      dataIndex: 'assignee', 
      key: 'assignee', 
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" style={{ background: record.color, fontWeight: 700, fontSize: 12 }}>{record.initial}</Avatar>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{text}</span>
        </div>
      )
    },
    { title: 'DUE DATE', dataIndex: 'due', key: 'due', render: text => <Text type="secondary">{text}</Text> },
    { 
      title: 'APPROVED', 
      dataIndex: 'approved', 
      key: 'approved', 
      render: val => {
        if (val === true) return <CheckCircle2 size={16} color="var(--accent-secondary)" />;
        if (val === 'Pending') return <Tag color="warning" style={{ borderRadius: 12, fontWeight: 600, margin: 0 }}>Pending</Tag>;
        return <Text type="secondary">—</Text>;
      } 
    },
    { 
      title: 'ACTIONS', 
      key: 'action', 
      render: (_, record) => <Button type="link" style={{ fontWeight: 600, color: 'var(--text-primary)', padding: 0 }}>{record.action}</Button> 
    }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants}>
        <Card className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}>
          <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Content pipeline</Title>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24 }}>All pieces across types and statuses</Text>

          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <Input prefix={<Search size={16} color="var(--text-secondary)" />} placeholder="Search content..." style={{ borderRadius: 8, flex: 1, minWidth: 200, height: 40 }} />
            <Select defaultValue="All type" style={{ width: 150, height: 40 }}><Select.Option value="All type">All type</Select.Option></Select>
            <Select defaultValue="All status" style={{ width: 150, height: 40 }}><Select.Option value="All status">All status</Select.Option></Select>
            <Select defaultValue="All assignee" style={{ width: 150, height: 40 }}><Select.Option value="All assignee">All assignee</Select.Option></Select>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px 20px', borderRadius: 12, marginBottom: 24 }}>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 4, color: 'var(--accent-secondary)' }}>RECENT CLIENT RESPONSES</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <strong style={{ color: 'var(--text-primary)' }}>June Instagram Grid (6 posts)</strong>
              <Tag color="success" style={{ borderRadius: 12, fontWeight: 600, margin: 0 }}>Approved ✓</Tag>
              <Text type="secondary" style={{ fontSize: 13 }}>Client approved Jun 4, 3:12 PM</Text>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <Table columns={columns} dataSource={pipelineData} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} style={{ minWidth: 1000 }} />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ListViewTab;
