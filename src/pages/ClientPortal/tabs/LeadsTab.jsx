import React from 'react';
import { Typography, Row, Col, Input, Button, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Search, Calendar, Lock, Lightbulb, TrendingUp, ArrowRight, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import BubbleCard from '../../../components/BubbleCard';

const { Title, Text } = Typography;

const LeadsTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const stats = [
    { label: 'TOTAL LEADS', value: '142', trend: '↑ +23%', sub: 'this month', color: 'var(--text-primary)' },
    { label: 'QUALIFIED', value: '67', percent: '47.2%', sub: 'of total leads', color: 'var(--accent-primary)' },
    { label: 'SITE VISITS', value: '28', percent: '19.7%', sub: 'of total leads', color: 'var(--accent-primary)' },
    { label: 'BOOKINGS', value: '14', percent: '10%', sub: 'lead-to-booking rate', color: 'var(--accent-primary)', badge: 'Above industry avg ✓' },
  ];

  const pipeline = [
    { step: 'NEW', count: 142, pct: '100%', color: '#3b82f6', drop: null },
    { step: 'CONTACTED', count: 104, pct: '73%', color: '#8b5cf6', drop: '↓ 27% lost' },
    { step: 'QUALIFIED', count: 67, pct: '47%', color: '#f59e0b', drop: '↓ 26% lost' },
    { step: 'SITE VISIT', count: 28, pct: '20%', color: '#10b981', drop: '↓ 27% lost' },
    { step: 'BOOKING', count: 14, pct: '10%', color: '#047857', drop: '↓ 10% lost' },
  ];

  const sourceData = [
    { name: 'Google Ads', value: 48, percent: '34%', color: '#3b82f6' },
    { name: 'Meta Ads', value: 38, percent: '27%', color: '#8b5cf6' },
    { name: 'WhatsApp', value: 22, percent: '15%', color: '#10b981' },
    { name: 'Organic', value: 18, percent: '13%', color: '#1e3a8a' },
    { name: 'Referral', value: 16, percent: '11%', color: '#f59e0b' },
  ];

  const trendData = [
    { name: 'Jan', leads: 68, qual: 28 },
    { name: 'Feb', leads: 74, qual: 32 },
    { name: 'Mar', leads: 82, qual: 38 },
    { name: 'Apr', leads: 96, qual: 44 },
    { name: 'May', leads: 115, qual: 55 },
    { name: 'Jun', leads: 142, qual: 67 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>JUNE 2026</Text>
          <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>My Leads</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>123 active leads across your campaigns this month.</Text>
        </div>
        <Button icon={<Lock size={14} />} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, borderRadius: 8 }}>
          Read-only · contact your AM to edit
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          {stats.map((stat, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <BubbleCard bodyStyle={{ padding: '24px' }}>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 16 }}>{stat.label}</Text>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</span>
                  {stat.trend && <span style={{ color: 'var(--accent-primary)', fontSize: 14, fontWeight: 700 }}>{stat.trend}</span>}
                  {stat.percent && <span style={{ color: 'var(--accent-primary)', fontSize: 14, fontWeight: 700 }}>{stat.percent}</span>}
                </div>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block' }}>{stat.sub}</Text>
                {stat.badge && (
                  <Tag style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, fontWeight: 700, padding: '2px 10px', marginTop: 12 }}>
                    {stat.badge}
                  </Tag>
                )}
              </BubbleCard>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <Input 
          prefix={<Search size={16} color="var(--text-secondary)" />} 
          placeholder="Search leads..." 
          style={{ width: 250, borderRadius: 8, padding: '8px 12px' }} 
        />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {['All', 'Google Ads', 'Meta Ads', 'WhatsApp', 'Organic', 'Referral'].map((filter, idx) => (
            <Button key={filter} type={idx === 0 ? 'primary' : 'default'} style={{ background: idx === 0 ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: idx === 0 ? '#fff' : 'var(--text-secondary)', borderColor: idx === 0 ? 'var(--accent-primary)' : 'var(--border-color)', fontWeight: 600, borderRadius: 20, padding: '4px 16px' }}>
              {filter}
            </Button>
          ))}
        </div>
        <Button icon={<Calendar size={16} />} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600, borderRadius: 8 }}>
          This Month
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <BubbleCard bodyStyle={{ padding: '32px' }}>
          <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Your Lead Journey This Month</Title>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 32 }}>How leads move from first contact to booking</Text>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', paddingBottom: 16, minWidth: 800 }}>
            {pipeline.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>
                    <ArrowRight size={20} color="var(--border-color)" style={{ marginBottom: 4 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-warning)' }}>{item.drop}</span>
                  </div>
                )}
                <div style={{ 
                  flex: 1, 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 16, 
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderTop: `4px solid ${item.color}`,
                  minWidth: 140
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: 1 }}>{item.step}</span>
                  <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>{item.count}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{item.pct}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <Lightbulb size={20} color="var(--accent-primary)" />
            <Text style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: 14 }}>Your 10% booking rate beats the 6.8% industry average by 47%.</Text>
          </div>
        </BubbleCard>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <BubbleCard style={{ height: '100%' }} bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Leads by Source</Title>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 32 }}>Where your June leads came from</Text>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', marginBottom: 32 }}>
                <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 32 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>142</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700, marginTop: 4 }}>TOTAL</span>
                  </div>
                </div>

                <div style={{ width: '100%' }}>
                  {sourceData.map((source, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: source.color }} />
                        <Text style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{source.name}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Text style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{source.value}</Text>
                        <Text style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: 14, width: 40, textAlign: 'right' }}>({source.percent})</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <TrendingUp size={20} color="var(--accent-primary)" />
                <Text style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: 14 }}>WhatsApp converts at 13.6% — your best source.</Text>
              </div>
            </BubbleCard>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <BubbleCard style={{ height: '100%' }} bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Monthly Lead Trend</Title>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 32 }}>Total leads (bars) and qualified (line) — last 6 months</Text>
              
              <div style={{ flex: 1, minHeight: 300, width: '100%', marginBottom: 32 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-secondary)' }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-secondary)' }} dx={-10} domain={[0, 160]} ticks={[0, 40, 80, 120, 160]} />
                    <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }} />
                    <Bar yAxisId="left" dataKey="leads" barSize={32} fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="qual" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#f59e0b' }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, width: 'fit-content' }}>
                <TrendingUp size={16} color="var(--accent-primary)" />
                <Text style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: 13 }}>Lead volume grew 108.8% over 6 months</Text>
              </div>
            </BubbleCard>
          </motion.div>
        </Col>
      </Row>

    </motion.div>
  );
};

export default LeadsTab;
