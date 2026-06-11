import React from 'react';
import { Typography, Row, Col, Table, Button, Tag } from 'antd';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SlabCard from '../../../components/SlabCard';

const { Title, Text } = Typography;

const SupportTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const escalations = [
    { client: 'Wakefit', level: 'Critical', text: 'MOS dropped 12 pts in 7 days. Client demands emergency call.', color: 'var(--accent-danger)' },
    { client: 'Lenskart', level: 'High', text: '3 deliverables overdue - client formally raised SLA breach.', color: 'var(--accent-danger)' },
    { client: 'BharatPe', level: 'High', text: 'Ad spend 40% over June budget without approval.', color: 'var(--accent-warning)' },
  ];

  const tickets = [
    { id: 1, client: 'Prestige Estates', subject: 'June Instagram for approval', type: 'Content', priority: 'Urgent', am: 'KM', opened: '2 days', status: 'In Progress', action: 'View' },
    { id: 2, client: 'Prestige Estates', subject: 'Q2 board presentation', type: 'Report', priority: 'Normal', am: 'KM', opened: '4 days', status: 'Open', action: 'View' },
    { id: 3, client: 'Prestige Estates', subject: 'Google Ads not working', type: 'Technical', priority: 'Critical', am: 'PN', opened: '1 hr', status: 'Open', action: 'Resolve' },
    { id: 4, client: 'boAt', subject: 'Refresh creative templates', type: 'Creative', priority: 'Normal', am: 'PN', opened: '1 day', status: 'In Progress', action: 'View' },
    { id: 5, client: 'Nykaa', subject: 'Reduce CAC on Meta', type: 'Strategy', priority: 'High', am: 'PN', opened: '3 days', status: 'Open', action: 'View' },
    { id: 6, client: 'Zepto', subject: 'Local SEO push for 5 cities', type: 'SEO', priority: 'High', am: 'RS', opened: '2 days', status: 'In Progress', action: 'View' },
    { id: 7, client: 'BharatPe', subject: 'Q2 billing reconciliation', type: 'Billing', priority: 'Urgent', am: 'PN', opened: '6 hrs', status: 'Open', action: 'View' },
    { id: 8, client: 'Wakefit', subject: 'Crisis war-room setup', type: 'Strategy', priority: 'Critical', am: 'AS', opened: '1 hr', status: 'Open', action: 'Resolve' },
  ];

  const getPriorityColor = (priority) => {
    if (priority === 'Critical' || priority === 'Urgent') return 'var(--accent-danger)';
    if (priority === 'High') return 'var(--accent-warning)';
    return 'var(--text-secondary)';
  };

  const columns = [
    { title: 'CLIENT', dataIndex: 'client', key: 'client', render: (val) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</span> },
    { title: 'SUBJECT', dataIndex: 'subject', key: 'subject', render: (val) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{val}</span> },
    { title: 'TYPE', dataIndex: 'type', key: 'type', render: (val) => <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{val}</span> },
    { title: 'PRIORITY', dataIndex: 'priority', key: 'priority', render: (val) => <span style={{ color: getPriorityColor(val), fontWeight: 800 }}>{val}</span> },
    { title: 'AM', dataIndex: 'am', key: 'am', render: (val) => <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{val}</span> },
    { title: 'OPENED', dataIndex: 'opened', key: 'opened', render: (val) => <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{val}</span> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: (val) => (
        <Tag style={{ 
          margin: 0, 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-tertiary)', 
          color: 'var(--text-secondary)', 
          fontWeight: 700, 
          borderRadius: 12, 
          padding: '2px 10px' 
        }}>
          {val}
        </Tag>
      ) 
    },
    { 
      title: 'ACTION', 
      key: 'action', 
      render: (_, record) => (
        <Button type="text" style={{ color: 'var(--accent-secondary)', fontWeight: 700, padding: 0 }}>
          {record.action}
        </Button>
      ) 
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Client Support</Title>
        <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>All open support tickets and escalations across all clients</Text>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-danger)', display: 'block', marginBottom: 24 }}>Active Escalations (3)</Text>
        
        <Row gutter={[24, 24]}>
          {escalations.map((esc, idx) => (
            <Col xs={24} md={8} key={idx}>
              <div style={{ 
                background: esc.color === 'var(--accent-danger)' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)', 
                border: `1px solid ${esc.color}40`, 
                borderRadius: 16, 
                padding: 24,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{esc.client}</Text>
                  <Tag style={{ background: esc.color, color: '#fff', border: 'none', borderRadius: 12, padding: '2px 12px', fontWeight: 800, margin: 0 }}>
                    {esc.level}
                  </Tag>
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 24, flex: 1, lineHeight: 1.6 }}>
                  {esc.text}
                </Text>
                <Button type="primary" style={{ background: esc.color, fontWeight: 800, borderRadius: 8, height: 40, border: 'none', width: 'fit-content', padding: '0 24px' }}>
                  Resolve
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <SlabCard bodyStyle={{ padding: 0 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)' }}>
            <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Open Support Tickets</Text>
          </div>
          <Table 
            dataSource={tickets} 
            columns={columns} 
            pagination={false} 
            rowKey="id"
            style={{ width: '100%' }}
            className="custom-table"
          />
        </SlabCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="link" style={{ padding: 0, fontWeight: 800, fontSize: 14, color: 'var(--accent-secondary)' }}>
          Open Client Support <ArrowUpRight size={16} style={{ marginLeft: 4 }} />
        </Button>
      </motion.div>

    </motion.div>
  );
};

export default SupportTab;
