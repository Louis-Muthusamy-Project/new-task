import React from 'react';
import { Typography, Row, Col, Table, Button, Tag } from 'antd';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import SlabCard from '../../components/SlabCard';

const { Title, Text } = Typography;

const BillingTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const stats = [
    { label: 'TOTAL MRR', value: '₹42.8L', sub: 'June 2026', color: 'var(--text-secondary)' },
    { label: 'COLLECTED', value: '₹38.4L', sub: '89.7%', color: 'var(--accent-primary)' },
    { label: 'OUTSTANDING', value: '₹4.4L', sub: '2 invoices', color: 'var(--accent-warning)', subColor: 'var(--accent-warning)' },
    { label: 'OVERDUE', value: '₹0', sub: 'all current', color: 'var(--text-secondary)', subColor: 'var(--accent-primary)' },
  ];

  const invoices = [
    { id: '1', code: 'PE', name: 'Prestige Estates', invoice: 'INV-2026-06-01', amount: '₹3.8L', status: 'Paid', mos: 84 },
    { id: '2', code: 'BT', name: 'boAt', invoice: 'INV-2026-06-02', amount: '₹4.2L', status: 'Paid', mos: 81 },
    { id: '3', code: 'RP', name: 'Rapido', invoice: 'INV-2026-06-03', amount: '₹3.5L', status: 'Paid', mos: 78 },
    { id: '4', code: 'NY', name: 'Nykaa', invoice: 'INV-2026-06-04', amount: '₹4.0L', status: 'Paid', mos: 76 },
    { id: '5', code: 'CR', name: 'CRED', invoice: 'INV-2026-06-05', amount: '₹4.6L', status: 'Paid', mos: 73 },
    { id: '6', code: 'ME', name: 'Meesho', invoice: 'INV-2026-06-06', amount: '₹3.4L', status: 'Paid', mos: 71 },
    { id: '7', code: 'ZP', name: 'Zepto', invoice: 'INV-2026-06-07', amount: '₹3.0L', status: 'Paid', mos: 67 },
    { id: '8', code: 'LK', name: 'Lenskart', invoice: 'INV-2026-06-08', amount: '₹2.8L', status: 'Paid', mos: 63 },
    { id: '9', code: 'OY', name: 'OYO', invoice: 'INV-2026-06-09', amount: '₹3.2L', status: 'Paid', mos: 62 },
    { id: '10', code: 'BP', name: 'BharatPe', invoice: 'INV-2026-06-10', amount: '₹3.6L', status: 'Paid', mos: 58 },
    { id: '11', code: 'UC', name: 'Urban Company', invoice: 'INV-2026-06-11', amount: '₹2.6L', status: 'Pending', mos: 55 },
    { id: '12', code: 'WF', name: 'Wakefit', invoice: 'INV-2026-06-12', amount: '₹2.4L', status: 'Pending', mos: 49 },
  ];

  const getStatusColor = (val) => {
    if (val >= 70) return 'var(--accent-primary)';
    if (val >= 50) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  const columns = [
    { 
      title: 'CLIENT', 
      key: 'client', 
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: getStatusColor(record.mos), color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {record.code}
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{record.name}</span>
        </div>
      )
    },
    { title: 'INVOICE', dataIndex: 'invoice', key: 'invoice', render: (val) => <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{val}</span> },
    { title: 'AMOUNT', dataIndex: 'amount', key: 'amount', render: (val) => <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{val}</span> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: (val) => (
        <Tag style={{ 
          margin: 0, 
          border: 'none', 
          background: val === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
          color: val === 'Paid' ? 'var(--accent-primary)' : 'var(--accent-warning)', 
          fontWeight: 800, 
          borderRadius: 8, 
          padding: '4px 12px' 
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
          {record.status === 'Paid' ? 'Receipt' : 'Send Link'}
        </Button>
      ) 
    },
  ];

  const donutData = [
    { name: 'Paid', value: 38.4, color: 'var(--accent-primary)' },
    { name: 'Pending', value: 4.4, color: 'var(--accent-warning)' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Agency Billing</Title>
        <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>All client invoices and payments — June 2026</Text>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          {stats.map((stat, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <SlabCard bodyStyle={{ padding: '24px' }}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 16 }}>{stat.label}</Text>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: stat.subColor || stat.color }}>{stat.sub}</div>
              </SlabCard>
            </Col>
          ))}
        </Row>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <SlabCard style={{ flex: 1, display: 'flex', flexDirection: 'column' }} bodyStyle={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: 32 }}>Invoice Status</Text>
              
              <div style={{ position: 'relative', height: 280, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${value}L`}
                      contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>₹42.8L</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>total</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>Paid</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-warning)' }} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>Pending</span>
                </div>
              </div>
            </SlabCard>
            <div style={{ marginTop: 24 }}>
              <Button type="link" style={{ padding: 0, fontWeight: 800, fontSize: 14, color: 'var(--accent-secondary)' }}>
                Open Finance <ArrowUpRight size={16} style={{ marginLeft: 4 }} />
              </Button>
            </div>
          </motion.div>
        </Col>

        <Col xs={24} lg={16}>
          <motion.div variants={itemVariants}>
            <SlabCard bodyStyle={{ padding: 0 }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Invoices</Text>
                <Button type="primary" style={{ background: 'var(--accent-secondary)', fontWeight: 700, borderRadius: 8 }}>Send All Payment Links</Button>
              </div>
              <Table 
                dataSource={invoices} 
                columns={columns} 
                pagination={false} 
                rowKey="id"
                style={{ width: '100%' }}
                className="custom-table"
              />
            </SlabCard>
          </motion.div>
        </Col>
      </Row>

    </motion.div>
  );
};

export default BillingTab;
