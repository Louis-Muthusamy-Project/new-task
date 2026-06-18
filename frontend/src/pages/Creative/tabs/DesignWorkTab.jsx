import React from 'react';
import { Typography, Table, Tag, Button, Input, Select, Avatar } from 'antd';
import { Search, Check, Clock } from 'lucide-react';
import { creativeProjects } from '../../../data/mock';

const { Text } = Typography;
const { Option } = Select;

const DesignWorkTab = () => {
  const columns = [
    { title: 'PROJECT', dataIndex: 'project', key: 'project', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'TYPE', dataIndex: 'type', key: 'type', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'BRIEF', dataIndex: 'brief', key: 'brief', align: 'center', render: val => val ? <Check size={18} color="var(--accent-primary)" style={{ strokeWidth: 3 }} /> : <Text type="secondary">—</Text> },
    { title: 'ASSIGNED', dataIndex: 'assigned', key: 'assigned', align: 'center', render: text => <Avatar size="small" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 700, border: '1px solid var(--border-color)' }}>{text}</Avatar> },
    { title: 'DUE', dataIndex: 'due', key: 'due', render: text => <span style={{ color: 'var(--text-primary)' }}>{text}</span> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: text => {
        let bg, color, border;
        if (text === 'Approved') { bg = 'rgba(16, 185, 129, 0.1)'; color = 'var(--accent-primary)'; border = 'rgba(16, 185, 129, 0.2)'; }
        else if (text.includes('Design')) { bg = 'rgba(59, 130, 246, 0.1)'; color = 'var(--accent-info)'; border = 'rgba(59, 130, 246, 0.2)'; }
        else if (text.includes('Review')) { bg = 'rgba(245, 158, 11, 0.1)'; color = 'var(--accent-warning)'; border = 'rgba(245, 158, 11, 0.2)'; }
        else { bg = 'var(--bg-tertiary)'; color = 'var(--text-secondary)'; border = 'var(--border-color)'; }
        
        return <Tag style={{ borderRadius: 12, background: bg, color: color, border: `1px solid ${border}`, fontWeight: 600, padding: '2px 10px' }}>{text}</Tag>;
      } 
    },
    { 
      title: 'APPROVAL', 
      dataIndex: 'approval', 
      key: 'approval', 
      render: text => {
        if (text === '-') return <Text type="secondary">—</Text>;
        if (text === 'Pending') return <strong style={{ color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14}/>Pending</strong>;
        if (text.includes('Approved')) return <Tag style={{ borderRadius: 12, border: 'none', background: 'transparent', color: 'var(--accent-primary)', fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} style={{ strokeWidth: 3 }}/>{text}</Tag>;
        return <Text type="secondary">{text}</Text>;
      } 
    },
    { title: 'ACTIONS', key: 'actions', align: 'right', render: () => <Button type="link" style={{ color: 'var(--accent-secondary)', fontWeight: 600, padding: 0 }}>Open</Button> }
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <Input prefix={<Search size={16} color="var(--text-tertiary)" />} placeholder="Search projects..." style={{ width: '100%', maxWidth: 300, borderRadius: 8, padding: '6px 12px' }} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select defaultValue="All Types" style={{ width: 150 }} size="middle"><Option value="All Types">All Types</Option></Select>
          <Select defaultValue="All Status" style={{ width: 150 }} size="middle"><Option value="All Status">All Status</Option></Select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table 
          columns={columns} 
          dataSource={creativeProjects} 
          pagination={false} 
          rowKey="id" 
          size="middle" 
          scroll={{ x: 1000 }} 
          style={{ minWidth: 1000 }} 
          rowClassName={() => 'hover-bg'}
        />
      </div>
    </div>
  );
};

export default DesignWorkTab;
