import React, { useState } from 'react';
import { Typography, Table, Tag, Input, Select, Button, DatePicker } from 'antd';
import { motion } from 'framer-motion';
import { Search, Zap, RefreshCw, Pin, Clock, FileText, Users, Eye } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const LOGS = [
  { id: 1, scheduledAt: "03 Jun 2026, 06:04 pm", workflowName: "new-camp-int-21", workflowType: "Broadcast campaign", campaignId: "new-camp-int-21", templateName: "wewer", templateBadge: "MARKETING", messages: "2 / 2", source: "Group" },
  { id: 2, scheduledAt: "02 Jun 2026, 10:42 am", workflowName: "new-camp-int-20", workflowType: "Broadcast campaign", campaignId: "new-camp-int-20", templateName: "wewer", templateBadge: "MARKETING", messages: "2 / 2", source: "Group" },
  { id: 3, scheduledAt: "01 Jun 2026, 07:16 pm", workflowName: "new-camp-int-19", workflowType: "Broadcast campaign", campaignId: "new-camp-int-19", templateName: "wewer", templateBadge: "MARKETING", messages: "2 / 2", source: "Group" },
  { id: 4, scheduledAt: "01 Jun 2026, 04:39 pm", workflowName: "new-camp-int-18", workflowType: "Broadcast campaign", campaignId: "new-camp-int-18", templateName: "wewer", templateBadge: "MARKETING", messages: "2 / 2", source: "Group" },
  { id: 5, scheduledAt: "01 Jun 2026, 03:42 pm", workflowName: "new-camp-int-17", workflowType: "Broadcast campaign", campaignId: "new-camp-int-17", templateName: "wewer", templateBadge: "MARKETING", messages: "2 / 2", source: "Group" },
  { id: 6, scheduledAt: "30 May 2026, 08:15 pm", workflowName: "new-camp-int-16", workflowType: "Broadcast campaign", campaignId: "new-camp-int-16", templateName: "wewer", templateBadge: "MARKETING", messages: "1 / 1", source: "Group" },
];

const EventLogsTab = ({ itemVariants }) => {
  const [workflows, setWorkflows] = useState(LOGS);

  const columns = [
    { 
      title: 'SCHEDULED AT', 
      key: 'scheduledAt', 
      render: (_, record) => <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><Clock size={14}/> {record.scheduledAt}</Text> 
    },
    { 
      title: 'WORKFLOW NAME', 
      key: 'workflowName', 
      render: (_, record) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 2 }}>{record.workflowName}</strong>
          <Text style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-info)', fontWeight: 600 }}><Zap size={12}/> {record.workflowType}</Text>
        </div>
      ) 
    },
    { 
      title: 'CAMPAIGN ID', 
      dataIndex: 'campaignId', 
      key: 'campaignId', 
      render: text => <Tag style={{ borderRadius: 12, background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-secondary)', fontWeight: 600 }}>{text}</Tag> 
    },
    { 
      title: 'TEMPLATE', 
      key: 'template', 
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 500 }}><FileText size={14} color="var(--text-tertiary)"/> {record.templateName}</span>
          <div style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#fff', width: 'fit-content' }}>{record.templateBadge}</div>
        </div>
      )
    },
    { title: 'MESSAGES', dataIndex: 'messages', key: 'messages', render: text => <strong style={{ color: 'var(--text-primary)', fontSize: 16 }}>{text}</strong> },
    { 
      title: 'SOURCE', 
      dataIndex: 'source', 
      key: 'source', 
      render: text => <Tag style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'transparent', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', width: 'fit-content', padding: '2px 8px' }}><Users size={12}/> {text}</Tag> 
    },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      align: 'right', 
      render: () => <Button type="primary" icon={<Eye size={14} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', fontWeight: 600 }}>View</Button> 
    }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 24, padding: '16px 0' }}>
        <Tag style={{ borderRadius: 12, border: 'none', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-info)', fontWeight: 700, padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}><Zap size={14}/> AUTOMATION CAMPAIGN MONITOR</Tag>
        <Title level={2} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Campaign Event Logs</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>Monitor all Automation campaigns — 197 of 203 campaigns</Text>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select defaultValue="All Status" style={{ width: 140 }} size="large"><Option value="All Status">All Status</Option></Select>
        <Select defaultValue="All Workflows" style={{ width: 160 }} size="large"><Option value="All Workflows">All Workflows</Option></Select>
        <RangePicker size="large" style={{ borderRadius: 8 }} />
        <Input prefix={<Search size={16} color="var(--text-tertiary)" />} placeholder="Search campaign..." style={{ width: '100%', maxWidth: 220, borderRadius: 8, height: 40 }} />
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <Button icon={<RefreshCw size={14} />} style={{ borderRadius: 8, height: 40, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Refresh</Button>
          <Button icon={<Pin size={14} />} style={{ borderRadius: 8, height: 40, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Pin Active Catalog</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <Table 
              columns={columns} 
              dataSource={workflows} 
              pagination={false} 
              rowKey="id" 
              size="middle" 
              scroll={{ x: 1000 }} 
              style={{ minWidth: 1000 }} 
              rowClassName={() => 'hover-bg'}
            />
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default EventLogsTab;
