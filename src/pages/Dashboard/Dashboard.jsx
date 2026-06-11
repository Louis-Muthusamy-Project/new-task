import React from 'react';
import { Typography, Row, Col, Card, Table, Tag, Progress, List, Button, Avatar } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, Clock, Calendar, Download } from 'lucide-react';
import { agencyClients, alertsData, executionActivityData, teamUtilisationData, teamCapacityData } from '../../data/mock';

const { Title, Text } = Typography;

const Dashboard = () => {
  const topClients = [...agencyClients].sort((a, b) => b.mos - a.mos).slice(0, 7);

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

  const leaderboardCols = [
    { title: 'CLIENT', dataIndex: 'name', key: 'name', render: (text, record) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>{record.id}</Avatar>
        <strong style={{ color: 'var(--text-primary)' }}>{text}</strong>
      </div>
    )},
    { title: 'INDUSTRY', dataIndex: 'industry', key: 'industry', render: text => <Text type="secondary">{text}</Text> },
    { title: 'MOS SCORE', dataIndex: 'mos', key: 'mos', render: val => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <strong style={{ minWidth: 24, color: 'var(--text-primary)' }}>{val}</strong>
        <Progress percent={val} showInfo={false} size="small" strokeColor="var(--accent-secondary)" trailColor="var(--bg-tertiary)" style={{ width: 100 }} />
      </div>
    )},
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: val => (
      <Tag style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', padding: '2px 8px' }}>
        <span style={{ color: 'var(--accent-secondary)', marginRight: 6, fontSize: '10px' }}>●</span> {val.toUpperCase()}
      </Tag>
    )}
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden" 
      animate="visible"
    >
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>AGENCY OVERVIEW</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Command Center</Title>
          <Text type="secondary">Good morning, Arjun — here's your agency at a glance.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Calendar size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Last 30 days</Button>
          <Button type="primary" icon={<Download size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)' }}>Generate Report</Button>
        </div>
      </motion.div>

      {/* KPI Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: 'ACTIVE CLIENTS', val: '12', sub: '+2 this month', type: 'up' },
          { label: 'TOTAL MRR', val: '₹33.90 L', sub: '+12% vs last month', type: 'up' },
          { label: 'AVG MOS SCORE', val: '68', sub: '+4 pts', type: 'up', isProgress: true },
          { label: 'SLA COMPLIANCE', val: '94%', sub: '-2% vs last month', type: 'down' },
          { label: 'OPEN ESCALATIONS', val: '3', sub: 'Needs attention', type: 'alert' }
        ].map((kpi, i) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={4} style={{ flex: '1 1 200px', minWidth: 200 }} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card className="glassmorphism" bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>{kpi.label}</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <Title level={2} style={{ margin: 0, fontSize: 32, fontWeight: 800, whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{kpi.val}</Title>
                  {kpi.isProgress && <Progress type="circle" percent={68} size={48} strokeColor="var(--accent-secondary)" trailColor="var(--bg-tertiary)" format={() => ''} />}
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {kpi.type === 'up' && <ArrowUpRight size={16} style={{ color: 'var(--accent-secondary)' }} />}
                  {kpi.type === 'down' && <ArrowDownRight size={16} style={{ color: 'var(--accent-warning)' }} />}
                  {kpi.type === 'alert' && <AlertCircle size={16} style={{ color: 'var(--accent-danger)' }} />}
                  <Text style={{ fontSize: 13, fontWeight: 500, color: kpi.type === 'alert' ? 'var(--accent-danger)' : kpi.type === 'down' ? 'var(--accent-warning)' : 'var(--accent-secondary)' }}>{kpi.sub}</Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} xl={16}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Client MOS Leaderboard</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Ranked by Marketing Operating Score</Text></div>} 
              extra={<a style={{ color: 'var(--accent-secondary)', fontWeight: 600, marginTop: 8, display: 'inline-block' }}>View all →</a>}
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
            >
              <div style={{ overflowX: 'auto' }}>
                <Table columns={leaderboardCols} dataSource={topClients} pagination={false} size="middle" scroll={{ x: 600 }} style={{ minWidth: 600 }} />
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} xl={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Alerts & Escalations</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Sorted by severity</Text></div>} 
              extra={<Tag color="error" style={{ borderRadius: 12, padding: '2px 10px', marginTop: 8, fontWeight: 600, border: 'none', background: 'var(--accent-danger)', color: '#fff' }}>1 CRITICAL</Tag>}
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: '0 16px 16px 16px' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={alertsData}
                renderItem={item => (
                  <List.Item actions={[<Button size="small" style={{ borderRadius: 8, color: 'var(--text-primary)', borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>{item.action}</Button>]}>
                    <List.Item.Meta
                      avatar={
                        <div style={{ padding: 8, borderRadius: 10, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                          {item.type === 'critical' ? <AlertCircle color="var(--accent-danger)" size={18} /> : 
                           item.type === 'warning' ? <AlertCircle color="var(--accent-warning)" size={18} /> : 
                           item.type === 'success' ? <CheckCircle2 color="var(--accent-secondary)" size={18} /> : 
                           <Clock color="var(--accent-primary)" size={18} />}
                        </div>
                      }
                      title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong style={{ color: 'var(--text-primary)' }}>{item.client}</strong><span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>{item.time}</span></div>}
                      description={<span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.desc}</span>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Execution Activity</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Completed vs scheduled - last 30 days</Text></div>} 
          extra={<div style={{ display: 'flex', gap: 16, fontSize: 13, marginTop: 8, fontWeight: 600 }}><span style={{ color: 'var(--accent-secondary)' }}>● Completed</span><span style={{ color: 'var(--text-tertiary)' }}>● Total</span></div>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={executionActivityData} margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 500, fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  cursor={{fill: 'var(--bg-tertiary)'}} 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--accent-secondary)', fontWeight: 600 }} 
                />
                <Bar dataKey="completed" fill="url(#colorCompleted)" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Team Utilisation</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Billable % by team</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ height: 240, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }} 
                    />
                    <Pie data={teamUtilisationData} innerRadius={70} outerRadius={90} paddingAngle={6} dataKey="value" stroke="var(--bg-secondary)">
                      {teamUtilisationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginTop: 16 }}>
                {teamUtilisationData.map(t => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.fill, boxShadow: 'var(--shadow-sm)' }}></span> {t.name}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} xl={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>This Week's Capacity</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Assigned vs available hours</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
                {teamCapacityData.map(t => (
                  <div key={t.initials} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Avatar size="large" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600 }}>{t.initials}</Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{t.name}</Text>
                        <Text style={{ fontSize: 13, color: t.color, fontWeight: 600 }}>{t.logged}h / {t.capacity}h <span style={{ marginLeft: 8, fontWeight: 700 }}>{Math.round((t.logged/t.capacity)*100)}%</span></Text>
                      </div>
                      <Progress percent={(t.logged/t.capacity)*100} showInfo={false} strokeColor={t.color} trailColor="var(--bg-tertiary)" size="small" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Dashboard;
