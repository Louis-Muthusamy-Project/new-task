import React from 'react';
import { Typography, Row, Col, Card, Button, Table, Tag, Select, Alert } from 'antd';
import { motion } from 'framer-motion';
import { Download, Calendar, TrendingUp, AlertTriangle, ChevronDown, Edit3, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { clientProfitabilityData } from '../../data/mock';

const { Title, Text } = Typography;

const Profitability = () => {
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

  const revCostData = clientProfitabilityData.map(d => ({
    name: d.client.split(' ')[0], // short name
    Revenue: parseFloat(d.revenue.replace(/[^0-9.-]+/g,"")) / 100000,
    Cost: parseFloat(d.totalCost.replace(/[^0-9.-]+/g,"")) / 100000
  }));

  const marginData = clientProfitabilityData.map(d => ({
    name: d.client.split(' ')[0],
    Margin: d.margin
  })).sort((a,b) => b.Margin - a.Margin);

  const getMarginColor = (val) => {
    if (val >= 30) return 'var(--accent-primary)'; 
    if (val >= 15) return 'var(--accent-warning)'; 
    return 'var(--accent-danger)'; 
  };

  const profCols = [
    { title: 'CLIENT', dataIndex: 'client', key: 'client', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'RETAINER MRR', dataIndex: 'revenue', key: 'revenue', render: text => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: 'TEAM COST', dataIndex: 'teamCost', key: 'teamCost', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'VENDOR / TOOLS', dataIndex: 'vendorCost', key: 'vendorCost', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'TOTAL COST', dataIndex: 'totalCost', key: 'totalCost', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'GROSS PROFIT', dataIndex: 'grossProfit', key: 'grossProfit', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'MARGIN', dataIndex: 'margin', key: 'margin', render: val => <span style={{ color: getMarginColor(val), fontWeight: 800 }}>{val}%</span> },
    { title: 'HOURS', dataIndex: 'hours', key: 'hours', render: val => <span style={{ fontWeight: 600 }}>{val}h</span> },
    { title: 'EFF. ₹/H', dataIndex: 'effRate', key: 'effRate', render: text => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: 'TREND', dataIndex: 'trend', key: 'trend', render: val => val === 'up' ? <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>↑</span> : val === 'down' ? <span style={{ color: 'var(--accent-danger)', fontWeight: 800 }}>↓</span> : <span style={{ color: 'var(--text-tertiary)', fontWeight: 800 }}>→</span> },
  ];

  const alerts = [
    { client: 'Lenskart', margin: '14.4%', rate: '₹351/h' },
    { client: 'BharatPe', margin: '3.6%', rate: '₹118/h' },
    { client: 'Wakefit', margin: '6.3%', rate: '₹192/h' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 04 · AGENCY OPS</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Profitability Engine</Title>
          <Text type="secondary" style={{ fontWeight: 500 }}>Real-time margin analysis across clients, campaigns and team.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Text type="secondary" style={{ fontWeight: 600 }}>Range:</Text>
          <Select defaultValue="This month" style={{ width: 140, fontWeight: 500 }}><Select.Option value="This month">This month</Select.Option></Select>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Export P&L</Button>
        </div>
      </motion.div>

      {/* NEW DOT-MATRIX TERMINAL BLOCK */}
      <motion.div variants={itemVariants}>
        <Card 
          style={{ 
            borderRadius: 16, 
            marginBottom: 32, 
            background: 'var(--bg-tertiary)', 
            backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            border: '1px solid var(--border-color)', 
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.1), var(--shadow-md)',
            position: 'relative'
          }} 
          bodyStyle={{ padding: '32px 40px' }}
        >
          {/* Subtle overlay to soften the dots behind text */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-secondary)', opacity: 0.4, borderRadius: 16, pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, position: 'relative', zIndex: 1 }}>
            <div>
              <Text style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-secondary)' }}>AGENCY P&L · THIS MONTH</Text>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 600 }}>All clients · live calculation</div>
            </div>
            <Tag style={{ borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 700, margin: 0, padding: '4px 12px', height: 'fit-content' }}><TrendingUp size={14} style={{ marginRight: 6, position: 'relative', top: 2 }}/> Gross margin improving</Tag>
          </div>

          <Row gutter={[48, 32]} style={{ position: 'relative', zIndex: 1 }}>
            <Col xs={24} sm={12} lg={6}>
              <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>TOTAL REVENUE (MRR)</Text>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: -1 }}>₹15.80L</div>
              <span style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700 }}>+8.2% MoM</span>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>TOTAL COST</Text>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: -1 }}>₹11.48L</div>
              <span style={{ color: 'var(--accent-danger)', fontSize: 13, fontWeight: 700 }}>+4.1% MoM</span>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>GROSS PROFIT</Text>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: 'var(--accent-primary)', marginBottom: 12, letterSpacing: -1 }}>₹4.32L</div>
              <span style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700 }}>+12.4% MoM</span>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Text style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>GROSS MARGIN</Text>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: 'var(--accent-primary)', marginBottom: 12, letterSpacing: -1 }}>27.3%</div>
              <span style={{ color: 'var(--accent-primary)', fontSize: 13, fontWeight: 700 }}>+1.6pp MoM</span>
            </Col>
          </Row>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        {alerts.map((a, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--accent-danger)', borderRadius: 12, padding: '16px 24px', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: '50%', display: 'flex' }}>
                <AlertTriangle size={24} color="var(--accent-danger)" />
              </div>
              <div>
                <strong style={{ color: 'var(--accent-danger)', fontSize: 15 }}>{a.client} is below minimum margin threshold ({a.margin}).</strong>
                <div style={{ fontSize: 13, color: 'var(--accent-danger)', opacity: 0.9, marginTop: 4, fontWeight: 500 }}>Recommend scope review or rate revision. Effective hourly rate is <strong style={{ fontWeight: 700 }}>{a.rate}</strong> vs target ₹900/h.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Button size="middle" style={{ borderRadius: 8, color: 'var(--text-primary)', borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', fontWeight: 600 }} icon={<Calendar size={14}/>}>Schedule review</Button>
              <Button size="middle" style={{ borderRadius: 8, color: 'var(--text-primary)', borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', fontWeight: 600 }} icon={<Edit3 size={14}/>}>Adjust scope</Button>
              <a style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', padding: 4 }}><X size={18}/></a>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Client profitability</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Margin = (Revenue - Team cost - Vendor cost) / Revenue · blended rate ₹1,200/h</Text></div>} 
          extra={<Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>6 active clients</Text>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 40, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={profCols} dataSource={clientProfitabilityData} pagination={false} rowKey="client" size="middle" scroll={{ x: 1200 }} rowClassName={() => 'hover-bg'}
                 summary={() => (
                   <Table.Summary fixed>
                     <Table.Summary.Row style={{ background: 'var(--bg-tertiary)', fontWeight: 700 }}>
                       <Table.Summary.Cell index={0}><strong style={{ color: 'var(--text-primary)' }}>Total</strong></Table.Summary.Cell>
                       <Table.Summary.Cell index={1}>₹15,80,000</Table.Summary.Cell>
                       <Table.Summary.Cell index={2}>₹10,18,000</Table.Summary.Cell>
                       <Table.Summary.Cell index={3}>₹1,30,000</Table.Summary.Cell>
                       <Table.Summary.Cell index={4}>₹11,48,000</Table.Summary.Cell>
                       <Table.Summary.Cell index={5}><span style={{ color: 'var(--accent-primary)' }}>₹4,32,000</span></Table.Summary.Cell>
                       <Table.Summary.Cell index={6}><Tag style={{ borderRadius: 12, background: 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: 800, margin: 0 }}>27.3%</Tag></Table.Summary.Cell>
                       <Table.Summary.Cell index={7}>502h</Table.Summary.Cell>
                       <Table.Summary.Cell index={8}>₹861</Table.Summary.Cell>
                       <Table.Summary.Cell index={9}><span style={{ color: 'var(--accent-primary)', fontSize: 16 }}>↑</span></Table.Summary.Cell>
                     </Table.Summary.Row>
                   </Table.Summary>
                 )}
          />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[32, 32]} style={{ marginBottom: 40 }}>
          <Col xs={24} lg={12}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Revenue vs cost</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Per client · current period</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revCostData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <YAxis stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} tickFormatter={val => `${val}L`} />
                    <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} formatter={(val) => `₹${val}L`} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }} />
                    <Bar dataKey="Revenue" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={28} />
                    <Bar dataKey="Cost" fill="var(--accent-danger)" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Margin by client</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Color-coded · target ≥ 30%</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marginData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                    <XAxis type="number" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tickFormatter={val => `${val}%`} domain={[0, 60]} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 13, fontWeight: 600 }} />
                    <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} formatter={(val) => `${val}%`} />
                    <Bar dataKey="Margin" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {marginData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getMarginColor(entry.Margin)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginTop: 24 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-primary)' }}/> ≥30%</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-warning)' }}/> 15-29%</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-danger)' }}/> {'<15%'}</span>
              </div>
            </Card>
          </Col>
        </Row>
      </motion.div>

    </motion.div>
  );
};

export default Profitability;
