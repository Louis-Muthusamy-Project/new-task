import React from 'react';
import { Typography, Row, Col, Table, Button, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Download, CreditCard, Landmark, Wallet, ArrowUpRight, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import BubbleCard from '../../components/BubbleCard';

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

  const historyData = [
    { name: 'Jul 2025', value: 2.8 },
    { name: 'Aug 2025', value: 2.8 },
    { name: 'Sep 2025', value: 2.8 },
    { name: 'Oct 2025', value: 2.8 },
    { name: 'Nov 2025', value: 2.8 },
    { name: 'Dec 2025', value: 3.0 },
    { name: 'Jan 2026', value: 3.0 },
    { name: 'Feb 2026', value: 3.0 },
    { name: 'Mar 2026', value: 3.0 },
    { name: 'Apr 2026', value: 3.2 },
    { name: 'May 2026', value: 3.2 },
    { name: 'Jun 2026', value: 3.2 },
  ];

  const invoices = [
    { id: '1', invoice: 'INV-2026-06', period: 'June 2026', amount: '₹3,20,000', dueDate: '1 Jul 2026', status: 'Upcoming' },
    { id: '2', invoice: 'INV-2026-05', period: 'May 2026', amount: '₹3,20,000', dueDate: '1 Jun 2026', status: 'Paid' },
    { id: '3', invoice: 'INV-2026-04', period: 'April 2026', amount: '₹3,20,000', dueDate: '1 May 2026', status: 'Paid' },
    { id: '4', invoice: 'INV-2026-03', period: 'March 2026', amount: '₹3,00,000', dueDate: '1 Apr 2026', status: 'Paid' },
    { id: '5', invoice: 'INV-2026-02', period: 'February 2026', amount: '₹3,00,000', dueDate: '1 Mar 2026', status: 'Paid' },
    { id: '6', invoice: 'INV-2026-01', period: 'January 2026', amount: '₹3,00,000', dueDate: '1 Feb 2026', status: 'Paid' },
    { id: '7', invoice: 'INV-2025-12', period: 'December 2025', amount: '₹3,00,000', dueDate: '1 Jan 2026', status: 'Paid' },
    { id: '8', invoice: 'INV-2025-11', period: 'November 2025', amount: '₹2,80,000', dueDate: '1 Dec 2025', status: 'Paid' },
    { id: '9', invoice: 'INV-2025-10', period: 'October 2025', amount: '₹2,80,000', dueDate: '1 Nov 2025', status: 'Paid' },
    { id: '10', invoice: 'INV-2025-09', period: 'September 2025', amount: '₹2,80,000', dueDate: '1 Oct 2025', status: 'Paid' },
  ];

  const columns = [
    { title: 'INVOICE #', dataIndex: 'invoice', key: 'invoice', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{val}</span> },
    { title: 'PERIOD', dataIndex: 'period', key: 'period', render: (val) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{val}</span> },
    { title: 'AMOUNT', dataIndex: 'amount', key: 'amount', render: (val) => <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{val}</span> },
    { title: 'DUE DATE', dataIndex: 'dueDate', key: 'dueDate', render: (val) => <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{val}</span> },
    { 
      title: 'STATUS', 
      dataIndex: 'status', 
      key: 'status', 
      render: (val) => (
        <Tag style={{ 
          margin: 0, 
          border: '1px solid ' + (val === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'), 
          background: val === 'Paid' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)', 
          color: val === 'Paid' ? 'var(--accent-primary)' : 'var(--accent-warning)', 
          fontWeight: 800, 
          borderRadius: 8, 
          padding: '2px 10px' 
        }}>
          {val}
        </Tag>
      ) 
    },
    { 
      title: 'ACTIONS', 
      key: 'actions', 
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {record.status === 'Upcoming' && (
            <Button type="primary" size="small" style={{ background: 'var(--accent-secondary)', fontWeight: 700, borderRadius: 6 }}>Pay Now</Button>
          )}
          <Button type="default" size="small" icon={<Download size={12} />} style={{ fontWeight: 600, borderRadius: 6, color: 'var(--text-secondary)' }}>PDF</Button>
          {record.status === 'Paid' && (
            <Button type="default" size="small" style={{ fontWeight: 600, borderRadius: 6, color: 'var(--text-secondary)' }}>GST</Button>
          )}
        </div>
      ) 
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 4 }}>BILLING & INVOICES</Text>
        <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Billing</Title>
        <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Your retainer history with BCC Martech.</Text>
      </motion.div>

      {/* Top Cards */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={24} xl={24} xxl={10}>
            <BubbleCard bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 1 }}>CURRENT RETAINER</Text>
                <Tag style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, fontWeight: 800, padding: '2px 12px', margin: 0 }}>
                  Paid
                </Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>₹3,20,000</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>/mo</span>
              </div>
              <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Active since Aug 2024 · 12-month contract</Text>
            </BubbleCard>
          </Col>
          <Col xs={24} lg={24} xl={24} xxl={14}>
            <BubbleCard bodyStyle={{ padding: 32, display: 'flex', height: '100%', gap: 32 }}>
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 1, display: 'block', marginBottom: 16 }}>NEXT INVOICE</Text>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, display: 'block', marginBottom: 8 }}>₹3,20,000</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="var(--text-secondary)" />
                  <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Due 1 Jul 2026</Text>
                </div>
              </div>
              <div style={{ width: 1, background: 'var(--border-color)' }} />
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 1, display: 'block', marginBottom: 16 }}>PAYMENT METHODS</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: '#1a1f36', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>VISA</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>•••• 4821</Text>
                        <Tag style={{ background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent-secondary)', border: 'none', borderRadius: 8, fontSize: 10, fontWeight: 700, padding: '0 6px', margin: 0 }}>Primary</Tag>
                      </div>
                      <Text style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>HDFC - Exp 08/27</Text>
                    </div>
                  </div>
                  <Button type="text" size="small" style={{ color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 600 }}>Remove</Button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button icon={<CreditCard size={14} />} style={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}>+ Card</Button>
                  <Button icon={<Wallet size={14} />} style={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}>UPI Autopay</Button>
                  <Button icon={<Landmark size={14} />} style={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}>NetBanking</Button>
                </div>
              </div>
            </BubbleCard>
          </Col>
        </Row>
      </motion.div>

      {/* Warning Banner */}
      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 16, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-warning)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>NEXT INVOICE</Text>
            <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>INV-2026-06 · June 2026 · ₹3,20,000</Text>
            <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Due 1 Jul 2026 · <span style={{ color: 'var(--accent-warning)' }}>32 days away</span></Text>
            <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Payment method: Visa •••• 4821</Text>
          </div>
          <Button type="primary" style={{ background: 'var(--accent-secondary)', fontWeight: 800, borderRadius: 8, height: 44, padding: '0 24px', fontSize: 15 }}>
            Pay Now
          </Button>
        </div>
      </motion.div>

      {/* Retainer History Chart */}
      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <BubbleCard bodyStyle={{ padding: 32 }}>
          <Title level={5} style={{ margin: '0 0 4px 0', fontWeight: 800, fontSize: 16 }}>Retainer History</Title>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 32 }}>Your investment with BCC Martech over time</Text>
          
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tickFormatter={(val) => `₹${val}L`} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)' }} formatter={(value) => `₹${value}L`} />
                <Area type="stepAfter" dataKey="value" stroke="var(--accent-secondary)" strokeWidth={2} fill="rgba(13, 148, 136, 0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>₹2.8L</Text>
            <Text style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>₹3.2L</Text>
          </div>
          <Text style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700, display: 'block', marginTop: 8 }}>↑ +14.3% increase over 12 months</Text>
        </BubbleCard>
      </motion.div>

      {/* Invoice Table */}
      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <BubbleCard bodyStyle={{ padding: 0 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={5} style={{ margin: '0 0 4px 0', fontWeight: 800, fontSize: 16 }}>Invoice history</Title>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Last 12 months · all invoices reconciled</Text>
            </div>
            <Button icon={<Download size={14} />} style={{ fontWeight: 600, borderRadius: 8, color: 'var(--text-secondary)' }}>Export all</Button>
          </div>
          <Table 
            dataSource={invoices} 
            columns={columns} 
            pagination={false} 
            rowKey="id"
            style={{ width: '100%' }}
            className="custom-table"
          />
        </BubbleCard>
      </motion.div>

      {/* Upcoming */}
      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <BubbleCard bodyStyle={{ padding: 32 }}>
          <Title level={5} style={{ margin: '0 0 24px 0', fontWeight: 800, fontSize: 16 }}>Upcoming</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Calendar size={20} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <div>
                  <Text style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Jul 2026</Text>
                  <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Due 1 Aug 2026</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>₹3,20,000</Text>
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Upcoming</Text>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Calendar size={20} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                <div>
                  <Text style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Aug 2026</Text>
                  <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Due 1 Sep 2026</Text>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>₹3,20,000</Text>
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Upcoming</Text>
              </div>
            </div>
          </div>
          <Text style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-secondary)', fontWeight: 500 }}>Invoices auto-generate on the 1st of each month.</Text>
        </BubbleCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Text style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
            Outstanding balance: <strong style={{ color: 'var(--accent-secondary)' }}>₹0</strong> · For any billing queries, contact <a href="mailto:finance@bccmartech.com" style={{ color: 'var(--accent-secondary)' }}>finance@bccmartech.com</a>
          </Text>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default BillingTab;
