import React from 'react';
import { Typography, Row, Col, Table, Button, Avatar } from 'antd';
import { ArrowUpRight, ArrowDownRight, CheckSquare, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SlabCard from '../../components/SlabCard';

const { Title, Text } = Typography;

const PerformanceTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const stats = [
    { label: 'AVG CLIENT MOS', value: '71/100', sub: '+4 pts MoM', color: 'var(--accent-primary)', trend: 'up' },
    { label: 'TOTAL LEADS', value: '1,840', sub: '+18%', color: 'var(--accent-primary)', trend: 'up' },
    { label: 'BLENDED ROAS', value: '3.8x', sub: '+0.4', color: 'var(--accent-primary)', trend: 'up' },
    { label: 'SLA COMPLIANCE', value: '94%', sub: '-2%', color: 'var(--accent-danger)', trend: 'down' },
  ];

  const clients = [
    { code: 'PE', name: 'Prestige Estates', mos: 84, seo: 91, ads: 86, leads: 83, social: 79, web: 88, geo: 72 },
    { code: 'BT', name: 'boAt', mos: 81, seo: 78, ads: 84, leads: 79, social: 88, web: 82, geo: 84 },
    { code: 'RP', name: 'Rapido', mos: 78, seo: 74, ads: 79, leads: 81, social: 82, web: 76, geo: 58 },
    { code: 'NY', name: 'Nykaa', mos: 76, seo: 72, ads: 74, leads: 77, social: 86, web: 79, geo: 52 },
    { code: 'CR', name: 'CRED', mos: 73, seo: 76, ads: 72, leads: 74, social: 70, web: 74, geo: 60 },
    { code: 'ME', name: 'Meesho', mos: 71, seo: 68, ads: 73, leads: 76, social: 74, web: 72, geo: 56 },
    { code: 'ZP', name: 'Zepto', mos: 67, seo: 64, ads: 68, leads: 72, social: 71, web: 65, geo: 48 },
    { code: 'LK', name: 'Lenskart', mos: 63, seo: 62, ads: 58, leads: 66, social: 68, web: 61, geo: 44 },
    { code: 'OY', name: 'OYO', mos: 62, seo: 58, ads: 63, leads: 61, social: 64, web: 60, geo: 42 },
    { code: 'BP', name: 'BharatPe', mos: 58, seo: 60, ads: 48, leads: 52, social: 54, web: 56, geo: 38 },
    { code: 'UC', name: 'Urban Company', mos: 55, seo: 52, ads: 54, leads: 58, social: 56, web: 58, geo: 36 },
    { code: 'WF', name: 'Wakefit', mos: 49, seo: 42, ads: 46, leads: 48, social: 52, web: 44, geo: 32 },
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
    ...['MOS', 'SEO', 'ADS', 'LEADS', 'SOCIAL', 'WEB', 'GEO'].map(col => ({
      title: col,
      dataIndex: col.toLowerCase(),
      key: col.toLowerCase(),
      render: (val) => <span style={{ color: getStatusColor(val), fontWeight: 800 }}>{val}</span>
    }))
  ];

  const team = [
    { name: 'Arjun Sharma', initials: 'AS', clients: 7, mos: 72, sla: '97%', tasks: 28, status: 'good' },
    { name: 'Priya Nair', initials: 'PN', clients: 6, mos: 74, sla: '98%', tasks: 22, status: 'good' },
    { name: 'Karan Mehta', initials: 'KM', clients: 6, mos: 67, sla: '91%', tasks: 18, status: 'warning' },
    { name: 'Divya Rao', initials: 'DR', clients: 5, mos: 71, sla: '96%', tasks: 14, status: 'good' },
    { name: 'Rahul Singh', initials: 'RS', clients: 8, mos: 68, sla: '93%', tasks: 24, status: 'good' },
  ];

  // Dummy chart data
  const chartData = [
    { name: 'Jan', pe: 80, bt: 75, rp: 70, ny: 72, cr: 65, me: 60, zp: 55, lk: 50, oy: 45, bp: 60, uc: 40, wf: 50 },
    { name: 'Feb', pe: 82, bt: 77, rp: 72, ny: 74, cr: 68, me: 63, zp: 58, lk: 52, oy: 48, bp: 55, uc: 45, wf: 48 },
    { name: 'Mar', pe: 81, bt: 80, rp: 75, ny: 73, cr: 70, me: 65, zp: 60, lk: 55, oy: 50, bp: 52, uc: 48, wf: 45 },
    { name: 'Apr', pe: 85, bt: 82, rp: 76, ny: 75, cr: 72, me: 68, zp: 62, lk: 58, oy: 55, bp: 50, uc: 50, wf: 42 },
    { name: 'May', pe: 83, bt: 81, rp: 78, ny: 76, cr: 71, me: 70, zp: 65, lk: 60, oy: 60, bp: 55, uc: 52, wf: 45 },
    { name: 'Jun', pe: 84, bt: 81, rp: 78, ny: 76, cr: 73, me: 71, zp: 67, lk: 63, oy: 62, bp: 58, uc: 55, wf: 49 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Agency Performance</Title>
        <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>How BCC Martech is performing as an agency — June 2026</Text>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 6, borderRadius: 12, width: 'fit-content' }}>
          {['This Month', 'Last Month', 'Last Quarter', 'Last 6 Months'].map((filter, idx) => (
            <Button key={filter} type="text" style={{ background: idx === 0 ? 'var(--accent-primary)' : 'transparent', color: idx === 0 ? '#fff' : 'var(--text-secondary)', fontWeight: 700, borderRadius: 8 }}>
              {filter}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          {stats.map((stat, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <SlabCard bodyStyle={{ padding: '24px' }}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, display: 'block', marginBottom: 16 }}>{stat.label}</Text>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: stat.color }}>
                  {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.sub}
                </div>
              </SlabCard>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <SlabCard bodyStyle={{ padding: 0 }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>MOS Leaderboard</Text>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>12 clients — all 8 signals</Text>
            </div>
            <Button type="text" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>View Full MOS —</Button>
          </div>
          <Table 
            dataSource={clients} 
            columns={columns} 
            pagination={false} 
            rowKey="code"
            style={{ width: '100%' }}
            className="custom-table"
          />
        </SlabCard>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <SlabCard bodyStyle={{ padding: '32px' }}>
          <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: 24 }}>Team Performance — This Month</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {team.map((member, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: 200 }}>
                  <Avatar style={{ backgroundColor: 'var(--text-tertiary)', fontWeight: 700 }}>{member.initials}</Avatar>
                  <Text style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</Text>
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontWeight: 600, width: 80 }}>{member.clients} clients</Text>
                <Text style={{ color: 'var(--text-primary)', fontWeight: 800, width: 100 }}>MOS avg {member.mos}</Text>
                <Text style={{ color: 'var(--text-secondary)', fontWeight: 600, width: 80 }}>SLA {member.sla}</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 100, color: 'var(--text-primary)', fontWeight: 600 }}>
                  Tasks: {member.tasks}
                  {member.status === 'good' ? (
                    <div style={{ background: 'var(--accent-primary)', color: '#fff', borderRadius: 4, padding: 2, display: 'flex' }}><CheckSquare size={14} /></div>
                  ) : (
                    <div style={{ background: 'var(--accent-warning)', color: '#fff', borderRadius: 4, padding: 2, display: 'flex' }}><AlertTriangle size={14} /></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SlabCard>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
        <SlabCard bodyStyle={{ padding: '32px' }}>
          <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Client MOS Trend — Last 6 Months</Text>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 32 }}>Hover lines to see per-client scores</Text>
          
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, fontWeight: 600 }}
                  itemStyle={{ fontSize: 12, fontWeight: 700 }}
                />
                <Line type="monotone" dataKey="pe" stroke={getStatusColor(84)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="bt" stroke={getStatusColor(81)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="rp" stroke={getStatusColor(78)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="ny" stroke={getStatusColor(76)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="zp" stroke={getStatusColor(67)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="bp" stroke={getStatusColor(58)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="wf" stroke={getStatusColor(49)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SlabCard>
      </motion.div>

    </motion.div>
  );
};

export default PerformanceTab;
