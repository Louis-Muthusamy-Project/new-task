import React, { useState } from 'react';
import { Typography, Table, Switch, Tag, Input, Select, Pagination, Button } from 'antd';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Edit3, CheckSquare, Copy, BarChart2, Trash2, Clock, CheckCircle2, Circle } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const WORKFLOWS = [
  { id: 1,  name: "new-camp-int-22", enabled: false, status: "draft",     type: "New Campaign", age: null,    created: "03 Jun 2026, 06:38 pm", createdAgo: "6 days ago"  },
  { id: 2,  name: "new-camp-int-21", enabled: false, status: "completed", type: "New Campaign", age: "6 Days", created: "03 Jun 2026, 06:04 pm", createdAgo: "6 days ago"  },
  { id: 3,  name: "new-camp-int-20", enabled: false, status: "completed", type: "New Campaign", age: "7 Days", created: "02 Jun 2026, 10:42 am", createdAgo: "7 days ago"  },
  { id: 4,  name: "new-camp-int-19", enabled: false, status: "completed", type: "New Campaign", age: "8 Days", created: "01 Jun 2026, 07:16 pm", createdAgo: "8 days ago"  },
  { id: 5,  name: "new-camp-int-18", enabled: false, status: "completed", type: "New Campaign", age: "8 Days", created: "01 Jun 2026, 04:39 pm", createdAgo: "8 days ago"  },
  { id: 6,  name: "new-camp-int-17", enabled: false, status: "completed", type: "New Campaign", age: "8 Days", created: "01 Jun 2026, 03:41 pm", createdAgo: "8 days ago"  },
  { id: 7,  name: "new-camp-int-16", enabled: false, status: "completed", type: "New Campaign", age: "10 Days", created: "30 May 2026, 08:14 pm", createdAgo: "10 days ago" },
  { id: 8,  name: "new-camp-int-15", enabled: false, status: "completed", type: "New Campaign", age: "10 Days", created: "30 May 2026, 08:03 pm", createdAgo: "10 days ago" },
  { id: 9,  name: "new-camp-int-14", enabled: false, status: "completed", type: "New Campaign", age: "10 Days", created: "30 May 2026, 07:54 pm", createdAgo: "10 days ago" },
  { id: 10, name: "new-camp-int-13", enabled: false, status: "completed", type: "New Campaign", age: "11 Days", created: "29 May 2026, 05:30 pm", createdAgo: "11 days ago" },
];

const MyWorkflowsTab = ({ itemVariants, onOpenBuilder }) => {
  const [workflows, setWorkflows] = useState(WORKFLOWS);

  const toggleEnabled = (id) => {
    setWorkflows((prev) => prev.map((wf) => (wf.id === id ? { ...wf, enabled: !wf.enabled } : wf)));
  };

  const columns = [
    { title: '#', dataIndex: 'id', key: 'id', width: 60, render: text => <Text type="secondary" style={{ fontWeight: 600 }}>{text}</Text> },
    { title: 'WORKFLOW NAME', dataIndex: 'name', key: 'name', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { 
      title: 'STATUS', 
      key: 'status', 
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Switch 
            checked={record.enabled} 
            onChange={() => toggleEnabled(record.id)} 
            size="small" 
            style={{ background: record.enabled ? 'var(--accent-secondary)' : 'var(--bg-tertiary)' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: record.status === 'completed' ? 'var(--accent-secondary)' : 'var(--text-secondary)', fontWeight: 500 }}>
            {record.status === 'completed' ? <CheckCircle2 size={16}/> : <Circle size={16}/>} {record.status === 'completed' ? 'Completed' : 'Draft'}
          </span>
        </div>
      )
    },
    { 
      title: 'CAMPAIGN TYPE', 
      key: 'type', 
      render: (_, record) => (
        <div>
          <span style={{ color: 'var(--accent-info)', fontWeight: 600, display: 'block', marginBottom: 2 }}>{record.type}</span>
          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12}/> {record.createdAgo}</Text>
        </div>
      )
    },
    { 
      title: 'CAMPAIGN AGE', 
      key: 'age', 
      render: (_, record) => {
        if (!record.age) return <Text type="secondary">—</Text>;
        const days = parseInt(record.age);
        const pct = Math.min((days / 14) * 100, 100);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: 'var(--text-primary)', fontWeight: 600, minWidth: 50 }}>{record.age}</Text>
            <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, width: 60 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-info)', borderRadius: 2 }} />
            </div>
          </div>
        );
      }
    },
    { 
      title: 'CREATED', 
      key: 'created', 
      render: (_, record) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: 2 }}>{record.createdAgo}</strong>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.created}</Text>
        </div>
      )
    },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      align: 'right', 
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <Button type="text" icon={<Edit3 size={14} color="var(--text-secondary)" />} size="small" onClick={() => onOpenBuilder && onOpenBuilder(record)} />
          <Button type="text" icon={<CheckSquare size={14} color="var(--text-secondary)" />} size="small" />
          <Button type="text" icon={<Copy size={14} color="var(--text-secondary)" />} size="small" />
          <Button type="text" icon={<BarChart2 size={14} color="var(--text-secondary)" />} size="small" />
          <Button type="text" icon={<Trash2 size={14} color="var(--accent-danger)" />} size="small" />
        </div>
      ) 
    }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 24, padding: '16px 0' }}>
        <Title level={2} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>My Campaigns & Workflows</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>Create, monitor, and configure your Automation marketing automations.</Text>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input prefix={<Search size={16} color="var(--text-tertiary)" />} placeholder="Search campaigns..." style={{ width: '100%', maxWidth: 300, borderRadius: 8, height: 40 }} />
        <Select defaultValue="All Statuses" style={{ width: 160 }} size="large"><Option value="All Statuses">All Statuses</Option></Select>
        <Select defaultValue="All Types" style={{ width: 160 }} size="large"><Option value="All Types">All Types</Option></Select>
        <Text type="secondary" style={{ marginLeft: 'auto', fontWeight: 500 }}>Total: 235 workflow(s)</Text>
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
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Text type="secondary" style={{ fontWeight: 500 }}>Total 235 workflows</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Pagination defaultCurrent={1} total={235} showSizeChanger={false} />
              <Select defaultValue="10 / page" size="middle" style={{ width: 110 }}><Option value="10 / page">10 / page</Option><Option value="25 / page">25 / page</Option></Select>
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default MyWorkflowsTab;
