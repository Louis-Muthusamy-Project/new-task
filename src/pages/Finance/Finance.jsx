import React from 'react';
import { Typography, Row, Col, Card, Button, Table, Tag, Progress, Select, Radio } from 'antd';
import { motion } from 'framer-motion';
import { Download, Calendar, Plus, Link as LinkIcon, QrCode, MoreHorizontal, Settings, FileText, CheckCircle2, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { invoicesList } from '../../data/mock';

const { Title, Text } = Typography;

const Finance = () => {
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

  const revData = [
    { month: 'Jan', val: 37.5, p: '+2.4%' },
    { month: 'Feb', val: 38.6, p: '+2.8%' },
    { month: 'Mar', val: 39.4, p: '+2.1%' },
    { month: 'Apr', val: 40.2, p: '+2.0%' },
    { month: 'May', val: 41.6, p: '+3.4%' },
    { month: 'Jun', val: 42.8, p: '+2.8%' },
  ];

  const pieData = [
    { name: 'Paid', value: 89.7, color: 'var(--accent-primary)' },
    { name: 'Pending', value: 7.5, color: 'var(--accent-warning)' },
    { name: 'Overdue', value: 0, color: 'var(--accent-danger)' },
    { name: 'Draft', value: 2.8, color: 'var(--text-tertiary)' },
  ];

  const invCols = [
    { title: 'Invoice #', dataIndex: 'id', key: 'id', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'Client', dataIndex: 'client', key: 'client', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'Due', dataIndex: 'due', key: 'due', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: val => <Tag style={{ borderRadius: 12, border: '1px solid', color: val === 'PAID' ? 'var(--accent-primary)' : 'var(--accent-warning)', borderColor: val === 'PAID' ? 'var(--accent-primary)' : 'var(--accent-warning)', background: 'transparent', fontWeight: 600 }}>{val}</Tag> },
    { title: 'Method', dataIndex: 'method', key: 'method', render: val => <Tag style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: 600 }}>{val}</Tag> },
    { title: 'Payment Link', dataIndex: 'link', key: 'link', render: val => val === 'Not sent' ? <Text style={{ fontSize: 12, color: 'var(--accent-warning)', fontWeight: 600 }}>Not sent</Text> : <Text type="secondary" style={{ fontWeight: 600 }}>—</Text> },
    { 
      title: 'Actions', 
      key: 'actions', 
      render: (_, r) => r.status === 'PAID' ? (
        <a style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Download size={14} /> Download PDF</a>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button type="primary" size="small" style={{ borderRadius: 6, background: 'var(--accent-secondary)', border: 'none', fontSize: 11, fontWeight: 600, height: 26 }} icon={<LinkIcon size={12}/>}>Send Link</Button>
          <Button size="small" style={{ borderRadius: 6, fontSize: 11, fontWeight: 600, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', height: 26 }} icon={<QrCode size={12}/>}>QR</Button>
          <a style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 8, fontWeight: 600 }}>Record</a>
          <MoreHorizontal size={16} color="var(--text-tertiary)" style={{ cursor: 'pointer', marginLeft: 8 }}/>
        </div>
      )
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>AGENCY OPS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Finance</Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>Invoicing, collections, and agency revenue management.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Calendar size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>This Month <ChevronDown size={14}/></Button>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Export</Button>
          <Button icon={<Settings size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Set Up Auto-Collection</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', height: 40, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-md)' }}>New Invoice</Button>
        </div>
      </motion.div>

      {/* NEW RING-BINDER LEDGER CARDS */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          {[
            { label: 'TOTAL MRR', val: '₹42.80L', sub: 'Monthly recurring', color: 'var(--text-primary)' },
            { label: 'COLLECTED THIS MONTH', val: '₹38.40L', sub: '89.7% collection rate', color: 'var(--accent-primary)' },
            { label: 'OUTSTANDING', val: '₹4.40L', sub: 'Pending + Draft', color: 'var(--accent-warning)' },
            { label: 'OVERDUE', val: '₹0', sub: 'No clients overdue', color: 'var(--accent-primary)' },
            { label: 'NEXT MONTH FORECAST', val: '₹44.20L', sub: '+3.3% MoM', color: 'var(--text-primary)' },
          ].map((kpi, i) => (
            <Col xs={24} sm={12} lg={4} style={{ flex: '1 1 200px', minWidth: 200}} key={i}>
              <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <Card 
                  style={{ 
                    borderRadius: 8, // Square-ish like a notebook page
                    border: '1px solid var(--border-color)', 
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-sm)',
                    height: '100%',
                    overflow: 'hidden'
                  }} 
                  bodyStyle={{ padding: 0, display: 'flex', height: '100%' }}
                >
                  {/* Ledger Binding (Far Left) */}
                  <div style={{ width: 28, background: 'var(--bg-tertiary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center' }}>
                    {[...Array(3)].map((_, holeIndex) => (
                      <div key={holeIndex} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bg-primary)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }} />
                    ))}
                  </div>

                  {/* Ledger Content */}
                  <div style={{ padding: '20px 24px', flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>{kpi.label}</Text>
                    <Title level={2} style={{ margin: '8px 0 4px', color: kpi.color, fontWeight: 800 }}>{kpi.val}</Title>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>{kpi.sub}</Text>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card style={{ borderRadius: 16, border: '1px solid var(--accent-secondary)', background: 'rgba(13, 148, 136, 0.05)', marginBottom: 40 }} bodyStyle={{ padding: '32px 40px' }}>
          <Title level={4} style={{ margin: 0, color: 'var(--accent-secondary)', fontWeight: 800 }}>Payment Collection</Title>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 32, fontWeight: 500 }}>Collect retainer payments automatically — no more chasing.</Text>

          <Row gutter={48}>
            <Col xs={24} lg={14}>
              <Card style={{ borderRadius: 12, marginBottom: 24, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <strong style={{ fontSize: 18, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>Razorpay <Tag style={{ margin: 0, borderRadius: 12, fontSize: 11, fontWeight: 700, border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)' }}><CheckCircle2 size={12} style={{ marginRight: 6, position: 'relative', top: 2 }}/> Connected</Tag></strong>
                  <a style={{ fontSize: 13, color: 'var(--accent-secondary)', fontWeight: 600 }}>Manage Razorpay Account ↗</a>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <Text type="secondary" style={{ fontWeight: 500 }}>Account:</Text> <strong style={{ color: 'var(--text-primary)' }}>BCC Martech</strong> <span style={{ color: 'var(--text-tertiary)' }}>·</span> <Text type="secondary" style={{ fontWeight: 500 }}>Merchant ID:</Text> rzp_live_8n2EqA29Mz<br/>
                  <Text type="secondary" style={{ fontWeight: 500 }}>Settlement: T+2 business days to</Text> <strong style={{ color: 'var(--text-primary)' }}>HDFC ····4821</strong>
                </div>
              </Card>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-primary)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                  <strong style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--text-secondary)' }}>COLLECTION MODE</strong>
                  <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)', fontWeight: 700 }}>Current: Manual — Switch to Auto-collect →</Tag>
                </div>
                <Radio.Group style={{ width: '100%' }} value="manual">
                  <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                    <Radio value="auto" style={{ alignItems: 'flex-start' }}>
                      <div style={{ marginLeft: 12 }}>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: 15, marginBottom: 4 }}>Auto-collect via mandate (recommended)</strong>
                        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.6, display: 'block' }}>Client authorises once. We charge automatically each month.<br/>Mandate types: UPI Autopay · Card mandate · eNACH (Netbanking)</Text>
                      </div>
                    </Radio>
                  </div>
                  <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                    <Radio value="link" style={{ alignItems: 'flex-start' }}>
                      <div style={{ marginLeft: 12 }}>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: 15, marginBottom: 4 }}>Send payment link each month</strong>
                        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block' }}>We send a link. Client pays manually each invoice.</Text>
                      </div>
                    </Radio>
                  </div>
                  <div style={{ padding: '24px', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid var(--accent-secondary)', borderRadius: 12, margin: 12 }}>
                    <Radio value="manual" style={{ alignItems: 'flex-start' }}>
                      <div style={{ marginLeft: 12 }}>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: 15, marginBottom: 4 }}>Manual (current)</strong>
                        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block' }}>You mark invoices paid manually. No auto-collection.</Text>
                      </div>
                    </Radio>
                  </div>
                </Radio.Group>
              </div>
            </Col>

            <Col xs={24} lg={10}>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 24 }}>COLLECTION STATS THIS MONTH</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontWeight: 500 }}>Collection rate</Text>
                  <span><strong style={{ color: 'var(--text-primary)' }}>89.7%</strong> <span style={{ color: 'var(--text-tertiary)' }}>·</span> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>12 of 12 invoices, 2 pending</Text></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontWeight: 500 }}>Avg days to payment</Text>
                  <strong style={{ color: 'var(--text-primary)' }}>4.2 days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontWeight: 500 }}>Automated collections</Text>
                  <span><strong style={{ color: 'var(--text-primary)' }}>0</strong> <span style={{ color: 'var(--text-tertiary)' }}>·</span> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>no mandate set up yet</Text></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontWeight: 500 }}>Payment link opens</Text>
                  <Text type="secondary" style={{ fontWeight: 600 }}>— not activated</Text>
                </div>
              </div>

              <Button type="primary" block icon={<LinkIcon size={18}/>} style={{ borderRadius: 8, background: 'var(--accent-secondary)', border: 'none', marginBottom: 16, height: 48, fontWeight: 700, fontSize: 14 }}>Send payment links to all pending</Button>
              <Button block icon={<Settings size={18}/>} style={{ borderRadius: 8, marginBottom: 16, height: 48, fontWeight: 600, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14 }}>Set up UPI Autopay mandates</Button>
              <Button block icon={<QrCode size={18}/>} style={{ borderRadius: 8, height: 48, fontWeight: 600, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14 }}>Generate UPI QR for outstanding</Button>
            </Col>
          </Row>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[32, 32]} style={{ marginBottom: 40 }}>
          <Col xs={24} lg={12}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Invoice Status — June 2026</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Breakdown of invoiced amounts</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', height: 280 }}>
                <div style={{ width: '50%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '50%', paddingLeft: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {pieData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }}/> <Text type="secondary" style={{ fontWeight: 600 }}>{d.name}</Text></span>
                        <span><strong style={{ color: 'var(--text-primary)' }}>{d.name === 'Paid' ? '₹38.4L' : d.name === 'Pending' ? '₹3.2L' : d.name === 'Draft' ? '₹1.2L' : '₹0'}</strong> <span style={{ color: 'var(--text-tertiary)' }}>·</span> <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{d.value}%</Text></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Revenue — Last 6 Months</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>In ₹ Lakhs · growth vs previous month</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="month" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                    <YAxis stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} domain={[0, 60]} />
                    <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                    <Bar dataKey="val" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} barSize={40}>
                      {revData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="var(--accent-secondary)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Invoices</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>12 of 12 invoices</Text></div>} 
          extra={<Radio.Group defaultValue="All" size="middle"><Radio.Button value="All">All</Radio.Button><Radio.Button value="Paid">Paid</Radio.Button><Radio.Button value="Pending">Pending</Radio.Button><Radio.Button value="Overdue">Overdue</Radio.Button><Radio.Button value="Draft">Draft</Radio.Button></Radio.Group>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 40, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={invCols} dataSource={invoicesList} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default Finance;
