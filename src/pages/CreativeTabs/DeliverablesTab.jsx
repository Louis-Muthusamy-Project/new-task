import React from 'react';
import { Typography, Table, Select, Avatar, Button } from 'antd';
import { motion } from 'framer-motion';
import { Check, Hourglass } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const deliverablesData = [
  { id: 1, item: 'June Instagram Grid (6 posts)', type: 'Social', delivered: 'Jun 8', by: 'DR', approvedDate: 'Jun 8', status: 'approved' },
  { id: 2, item: 'Meta Ads v2 (8 creatives)', type: 'Ad Creative', delivered: 'Jun 6', by: 'DR', approvedDate: 'Jun 9', status: 'approved' },
  { id: 3, item: 'Somerville Launch Reel', type: 'Video', delivered: 'Jun 5', by: 'DR', approvedDate: 'Jun 6', status: 'approved' },
  { id: 4, item: 'Q1 Report Design', type: 'Presentation', delivered: 'May 30', by: 'DR', approvedDate: 'May 30', status: 'approved' },
  { id: 5, item: 'May Email Header Set', type: 'Email Design', delivered: 'May 28', by: 'DR', approvedDate: 'May 28', status: 'approved' },
  { id: 6, item: 'Whitefield Brochure v1', type: 'Print/PDF', delivered: 'May 24', by: 'DR', approvedDate: 'Pending', status: 'pending' },
  { id: 7, item: 'Google Display Banners (12)', type: 'Ad Creative', delivered: 'May 22', by: 'DR', approvedDate: 'May 23', status: 'approved' },
  { id: 8, item: 'Sales Deck Refresh', type: 'Presentation', delivered: 'May 20', by: 'DR', approvedDate: 'May 20', status: 'approved' },
  { id: 9, item: 'Hero Photography Edit (24)', type: 'Image', delivered: 'May 18', by: 'DR', approvedDate: 'May 19', status: 'approved' },
  { id: 10, item: 'Logo Animation — Stinger', type: 'Video', delivered: 'May 14', by: 'DR', approvedDate: 'Pending', status: 'pending' },
  { id: 11, item: 'Microsite — Primrose Hills', type: 'Web Design', delivered: 'May 10', by: 'DR', approvedDate: 'May 11', status: 'approved' },
  { id: 12, item: 'NRI Investor Flyer', type: 'Print/PDF', delivered: 'May 6', by: 'DR', approvedDate: 'Pending', status: 'pending' },
];

const DeliverablesTab = ({ itemVariants }) => {
  const columns = [
    { title: 'ITEM', dataIndex: 'item', key: 'item', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'TYPE', dataIndex: 'type', key: 'type', render: text => <Text type="secondary">{text}</Text> },
    { title: 'DELIVERED', dataIndex: 'delivered', key: 'delivered', render: text => <span style={{ color: 'var(--text-primary)' }}>{text}</span> },
    { 
      title: 'BY', 
      dataIndex: 'by', 
      key: 'by', 
      render: text => <Avatar size="small" style={{ backgroundColor: '#ec4899', color: '#fff', fontWeight: 700, fontSize: 12 }}>{text}</Avatar> 
    },
    { 
      title: 'CLIENT APPROVED', 
      dataIndex: 'approvedDate', 
      key: 'approvedDate', 
      render: (text, record) => {
        if (record.status === 'approved') {
          return <span style={{ color: 'var(--accent-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ background: 'var(--accent-secondary)', color: '#fff', borderRadius: 4, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12}/></div>{text}</span>;
        } else {
          return <span style={{ color: 'var(--accent-warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Hourglass size={14}/>{text}</span>;
        }
      } 
    },
    { title: 'LINK', key: 'link', align: 'right', render: () => <Button type="link" style={{ color: 'var(--text-secondary)', fontWeight: 600, padding: 0 }}>View</Button> }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <strong style={{ fontSize: 16, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Creative Deliverables — June 2026</strong>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>All creative work delivered to Prestige Estates this month</Text>
        
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Select defaultValue="June 2026" style={{ width: 150 }} size="middle"><Option value="June 2026">June 2026</Option></Select>
          <Select defaultValue="All Types" style={{ width: 150 }} size="middle"><Option value="All Types">All Types</Option></Select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <Table 
            columns={columns} 
            dataSource={deliverablesData} 
            pagination={false} 
            rowKey="id" 
            size="middle" 
            scroll={{ x: 800 }} 
            style={{ minWidth: 800 }} 
            rowClassName={() => 'hover-bg'}
          />
        </div>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
            <strong style={{ color: 'var(--text-primary)' }}>12 assets delivered this month</strong> · 9 approved (75%) · 3 pending
          </Text>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeliverablesTab;
