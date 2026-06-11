import React from 'react';
import { Typography, Row, Col, Card, Table, Tag, Button } from 'antd';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { websiteTrafficAnalytics, topPagesAnalytics, clientPerformanceAnalytics } from '../../data/mock';

const { Title, Text } = Typography;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  }
};

const topPagesCols = [
  { title: 'Page URL', dataIndex: 'url', key: 'url', render: text => <a style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</a> },
  { title: 'Client', dataIndex: 'client', key: 'client', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
  { title: 'Sessions', dataIndex: 'sessions', key: 'sessions', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
  { title: 'Bounce', dataIndex: 'bounce', key: 'bounce', render: text => <Text style={{ color: parseInt(text) > 40 ? 'var(--accent-danger)' : 'var(--accent-warning)', fontWeight: 600 }}>{text}</Text> },
  { title: 'Avg Time', dataIndex: 'avgTime', key: 'avgTime', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
  { title: 'Conversions', dataIndex: 'conv', key: 'conv', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
  { title: 'Conv. Rate', dataIndex: 'convRate', key: 'convRate', render: text => <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontWeight: 700, padding: '2px 8px' }}>{text}</Tag> },
];

const pieData = [
  { name: 'Google Ads', value: 34, fill: 'var(--accent-info)' },
  { name: 'Meta Ads', value: 27, fill: 'var(--accent-secondary)' },
  { name: 'Organic', value: 18, fill: 'var(--accent-primary)' },
  { name: 'WhatsApp', value: 13, fill: 'var(--accent-warning)' },
  { name: 'Referral', value: 8, fill: 'var(--text-tertiary)' },
];

const barData = [
  { name: 'Google Ads', val: 28.4, fill: 'var(--accent-info)' },
  { name: 'Meta Ads', val: 19.2, fill: 'var(--accent-secondary)' },
  { name: 'Organic', val: 14.8, fill: 'var(--accent-primary)' },
  { name: 'WhatsApp', val: 9.4, fill: 'var(--accent-warning)' },
];

const AnalyticsTab = () => {
  return (
    <>
      {/* NEW ANALYTICAL VIEWFINDER HUD CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {[
          { label: 'TOTAL WEBSITE SESSIONS', val: '4,82,000', sub: '▲ +14%', color: 'var(--accent-primary)' },
          { label: 'TOTAL LEADS GENERATED', val: '1,840', sub: '▲ +18%', color: 'var(--accent-secondary)' },
          { label: 'BLENDED ROAS', val: '3.8x', sub: '▲ +0.4', color: 'var(--accent-info)' },
          { label: 'ORGANIC TRAFFIC SHARE', val: '54%', sub: '▲ +3%', color: 'var(--accent-warning)' },
          { label: 'TOTAL AD SPEND', val: '₹84.2L', sub: '▼ -2%', down: true, color: 'var(--text-tertiary)' },
        ].map((kpi, i) => (
          <Col xs={24} sm={12} lg={4} style={{ flex: '1 1 200px', minWidth: 200}} key={i}>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }} 
                style={{ 
                  borderRadius: 0, // completely sharp 
                  height: '100%', 
                  background: 'var(--bg-secondary)',
                  border: 'none', // no full border
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Viewfinder Corners */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: `2px solid ${kpi.color}`, borderLeft: `2px solid ${kpi.color}` }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: `2px solid ${kpi.color}`, borderRight: `2px solid ${kpi.color}` }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderBottom: `2px solid ${kpi.color}`, borderLeft: `2px solid ${kpi.color}` }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderBottom: `2px solid ${kpi.color}`, borderRight: `2px solid ${kpi.color}` }} />

                <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textAlign: 'center', marginBottom: 16 }}>{kpi.label}</Text>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Title level={2} style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800, fontSize: 32 }}>{kpi.val}</Title>
                  <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: kpi.down ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: kpi.down ? 'var(--accent-danger)' : 'var(--accent-primary)', fontWeight: 700, padding: '2px 8px' }}>{kpi.sub}</Tag>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Website Traffic — All Clients</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Daily sessions split by source · last 30 days</Text></div>} 
          extra={<div style={{ textAlign: 'right' }}><Title level={3} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>4,82,000</Title><Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>TOTAL SESSIONS</Text></div>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
        >
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={websiteTrafficAnalytics} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} dy={10} />
                <YAxis stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} dx={-10} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 13, fontWeight: 500 }} />
                <Area type="monotone" dataKey="referral" stackId="1" stroke="var(--text-tertiary)" fill="var(--text-tertiary)" name="Referral" />
                <Area type="monotone" dataKey="direct" stackId="1" stroke="var(--accent-warning)" fill="var(--accent-warning)" name="Direct" />
                <Area type="monotone" dataKey="paid" stackId="1" stroke="var(--accent-info)" fill="var(--accent-info)" name="Paid" />
                <Area type="monotone" dataKey="organic" stackId="1" stroke="var(--accent-primary)" fill="var(--accent-primary)" name="Organic" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={10}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Leads by Channel</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Source mix · this month</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
            >
              <div style={{ height: 250, position: 'relative', marginBottom: 24 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="var(--bg-secondary)" strokeWidth={2}>
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Title level={3} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>1,840</Title>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>TOTAL LEADS</Text>
                </div>
              </div>
              
              <Row gutter={[16, 24]}>
                {pieData.map(d => (
                  <Col span={12} key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
                        <Text type="secondary" style={{ fontWeight: 600 }}>{d.name}</Text>
                      </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{d.value}%</strong>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={14}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Attribution</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Attributed revenue by channel (₹ lakh)</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
            >
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} dx={-10} />
                    <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                    <Bar dataKey="val" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <Row style={{ marginTop: 24 }}>
                {barData.map(d => (
                  <Col span={6} key={d.name} style={{ textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>₹{d.val}L</strong>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{d.name}</Text>
                  </Col>
                ))}
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Client Performance — This Month vs Last Month</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Compare every client side by side · toggle metric</Text></div>} 
          extra={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Button size="middle" type="primary" style={{ background: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 600, border: 'none' }}>Sessions</Button><Button size="middle" style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}>Leads</Button><Button size="middle" style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}>ROAS</Button><Button size="middle" style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}>Spend</Button></div>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 32, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
        >
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientPerformanceAnalytics} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, angle: -45, textAnchor: 'end' }} height={80} dy={10} />
                <YAxis stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500 }} dx={-10} />
                <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontSize: 13, fontWeight: 500 }} />
                <Bar dataKey="lastMonth" name="Last Month" fill="var(--text-tertiary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Bar dataKey="thisMonth" name="This Month" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Top Pages by Traffic — Across All Clients</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Top 10 ranked by sessions this month</Text></div>} 
          extra={<Button size="middle" icon={<Filter size={14}/>} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>June 2026</Button>}
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginBottom: 40 }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={topPagesCols} dataSource={topPagesAnalytics} pagination={false} rowKey="url" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

    </>
  );
};

export default AnalyticsTab;
