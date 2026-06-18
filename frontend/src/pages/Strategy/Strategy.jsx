import React from 'react';
import { Typography, Row, Col, Card, Progress, Table, Tag, Button, List } from 'antd';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, AlertTriangle, Filter, Plus, FileText, AlertCircle, Sparkles, Crosshair, BarChart2, Activity, Banknote } from 'lucide-react';
import { strategyOkrs, radarData, roadmapData, investmentData } from '../../data/mock';

const { Title, Text } = Typography;

const Strategy = () => {
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

  const roadmapCols = [
    { title: 'INITIATIVE', dataIndex: 'initiative', key: 'initiative', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'CLIENT', dataIndex: 'client', key: 'client', render: text => <Text type="secondary">{text}</Text> },
    { title: 'CHANNEL', dataIndex: 'channel', key: 'channel', render: text => <Tag style={{ borderRadius: 12, fontSize: 10, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>{text}</Tag> },
    { title: 'OWNER', dataIndex: 'owner', key: 'owner', render: text => <span style={{ color: 'var(--text-primary)' }}>{text}</span> },
    { title: 'PHASE', dataIndex: 'phase', key: 'phase', render: text => <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 500 }}><span style={{ color: text === 'Build' ? 'var(--accent-primary)' : text === 'Launch' ? 'var(--accent-secondary)' : 'var(--accent-warning)', fontSize: 10 }}>●</span> {text}</div> },
    { title: 'TIMELINE', dataIndex: 'timeline', key: 'timeline', render: text => <Text type="secondary">{text}</Text> },
    { title: 'DEPS', dataIndex: 'deps', key: 'deps', render: text => <span style={{ color: 'var(--text-primary)' }}>{text}</span> },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: text => <Tag color={text === 'IN PROGRESS' ? 'processing' : text === 'AT RISK' ? 'error' : 'default'} style={{ borderRadius: 12, fontWeight: 600, padding: '2px 8px' }}>{text}</Tag> }
  ];

  const briefData = [
    { title: 'Q3 SEO Strategy', client: 'Prestige Estates', owner: 'Arjun Sharma', time: '2 days ago', status: 'APPROVED', color: 'success' },
    { title: 'Festive Campaign Master Brief', client: 'Nykaa', owner: 'Priya Nair', time: 'yesterday', status: 'IN REVIEW', color: 'warning' },
    { title: 'GEO Playbook v2.1', client: 'boAt', owner: 'Karan Mehta', time: '4 days ago', status: 'APPROVED', color: 'success' },
    { title: 'Churn Recovery Brief', client: 'BharatPe', owner: 'Rahul Singh', time: 'today', status: 'DRAFT', color: 'default' },
  ];

  const riskData = [
    { title: 'Wakefit algo recovery slower than modeled', owner: 'Arjun Sharma', impact: '₹45L ARR', type: 'HIGH RISK', color: 'var(--accent-danger)', bgColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' },
    { title: 'BharatPe lifecycle dev capacity blocked', owner: 'Rahul Singh', impact: 'Churn +6%', type: 'MED RISK', color: 'var(--accent-warning)', bgColor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' },
    { title: 'Festive creative bandwidth Q4', owner: 'Divya Rao', impact: 'Throughput', type: 'LOW RISK', color: 'var(--accent-secondary)', bgColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Strategy & Planning</Title>
          <Text type="secondary">Roadmaps, OKRs and briefs across every account — the brain that drives every campaign.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<Target size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Generate strategy</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)' }}>New objective</Button>
        </div>
      </motion.div>

      {/* NEW FROSTED LEFT-ACCENT KPI CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'ACTIVE OBJECTIVES', val: '5', sub: '+2', icon: <Crosshair size={22} />, color: 'var(--accent-primary)' },
          { label: 'KEY RESULTS TRACKED', val: '15', sub: '+5', icon: <BarChart2 size={22} />, color: 'var(--accent-secondary)' },
          { label: 'ON-TRACK', val: '3', sub: '60% of objectives', icon: <CheckCircle2 size={22} />, color: 'var(--accent-secondary)' },
          { label: 'AT RISK / BEHIND', val: '2', sub: '2 need attention', icon: <AlertTriangle size={22} />, color: 'var(--accent-danger)', isAlert: true },
          { label: 'PLANNED SPEND Q3', val: '₹3.84 Cr', sub: 'across 12 accounts', icon: <Banknote size={22} />, color: 'var(--text-primary)', accentColor: 'var(--text-tertiary)', flex: 1.5 }
        ].map((kpi, i) => (
          <Col xs={24} sm={12} xl={kpi.flex ? 6 : 4} lg={8} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', height: '100%' }} 
                style={{ 
                  borderRadius: 16, 
                  height: '100%', 
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border-color)',
                  borderLeft: `5px solid ${kpi.accentColor || kpi.color}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{kpi.label}</Text>
                  <div style={{ color: kpi.accentColor || kpi.color, opacity: 0.8 }}>
                    {kpi.icon}
                  </div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <Title level={2} style={{ margin: 0, color: kpi.isAlert ? 'var(--accent-danger)' : 'var(--text-primary)', fontSize: 32, fontWeight: 800, whiteSpace: 'nowrap' }}>{kpi.val}</Title>
                  {kpi.sub && <Text style={{ color: kpi.isAlert ? 'var(--accent-danger)' : 'var(--accent-secondary)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{kpi.sub}</Text>}
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={16}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Objectives & key results</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Quarterly OKRs by account</Text></div>} 
              extra={
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <Button size="small" type="primary" style={{ background: 'var(--text-primary)', borderRadius: 16, padding: '0 16px', fontWeight: 600 }}>All</Button>
                  <Button size="small" style={{ borderRadius: 16, padding: '0 16px', fontWeight: 600, color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}>On Track</Button>
                  <Button size="small" style={{ borderRadius: 16, padding: '0 16px', fontWeight: 600, color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}>At Risk</Button>
                </div>
              }
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {strategyOkrs.map(okr => (
                  <div key={okr.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <Tag color={okr.status === 'On Track' ? 'success' : 'error'} style={{ borderRadius: 12, marginBottom: 12, padding: '2px 10px', fontWeight: 700, background: okr.status === 'On Track' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderColor: okr.status === 'On Track' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: okr.status === 'On Track' ? 'var(--accent-secondary)' : 'var(--accent-danger)' }}>
                          {okr.status.toUpperCase()} <Text type="secondary" style={{ fontSize: 10, marginLeft: 8, color: 'inherit', opacity: 0.8 }}>Q3 FY26</Text>
                        </Tag>
                        <Title level={5} style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{okr.title}</Title>
                        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{okr.client}</Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Title level={3} style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{okr.progress}%</Title>
                        <Text type="secondary" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700 }}>PROGRESS</Text>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {okr.stats.map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'nowrap' }}>
                          <Text style={{ width: 250, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, flexShrink: 0 }}>{s.label}</Text>
                          <Text strong style={{ width: 100, fontSize: 13, textAlign: 'right', color: 'var(--text-primary)', flexShrink: 0 }}>{s.val}</Text>
                          <Progress percent={s.pct} showInfo={false} strokeColor={okr.status === 'On Track' ? 'var(--accent-secondary)' : 'var(--accent-warning)'} trailColor="var(--bg-tertiary)" style={{ flex: 1, minWidth: 100 }} size="small" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} xl={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Channel maturity</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Prestige vs Wakefit benchmark</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Prestige (leader)" dataKey="A" stroke="var(--accent-secondary)" fill="var(--accent-secondary)" fillOpacity={0.4} strokeWidth={2} />
                    <Radar name="Wakefit (recovering)" dataKey="B" stroke="var(--accent-danger)" fill="var(--accent-danger)" fillOpacity={0.4} strokeWidth={2} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: 16, borderRadius: 12, marginTop: 16, display: 'flex', gap: 12, alignItems: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
                <Sparkles size={18} color="var(--accent-secondary)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <Text strong style={{ fontSize: 14, display: 'block', color: 'var(--accent-secondary)', marginBottom: 4 }}>AI strategist insight</Text>
                  <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>Wakefit's SEO score (20) is the lowest across portfolio. Prioritize schema rollout to lift recovery by ~14 pts in 60 days.</Text>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Initiative roadmap</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>What's planned, in-flight and at risk this quarter</Text></div>} 
          extra={<Button icon={<Filter size={16} />} size="small" style={{ borderRadius: 8, marginTop: 8, fontWeight: 600, color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}>Filters</Button>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <div style={{ overflowX: 'auto' }}>
            <Table columns={roadmapCols} dataSource={roadmapData} pagination={false} rowKey="initiative" size="middle" scroll={{ x: 1000 }} style={{ minWidth: 1000 }} />
          </div>
        </Card>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Planned investment by channel</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Q3 FY26 forecast across the portfolio (₹ lakhs)</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={investmentData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis stroke="var(--text-tertiary)" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: 'var(--shadow-md)', color: 'var(--text-primary)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 20, fontWeight: 500, color: 'var(--text-primary)' }} />
                    <Bar dataKey="SEO" stackId="a" fill="var(--accent-secondary)" />
                    <Bar dataKey="Paid" stackId="a" fill="var(--accent-warning)" />
                    <Bar dataKey="Content" stackId="a" fill="var(--accent-primary)" />
                    <Bar dataKey="Social" stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="Lifecycle" stackId="a" fill="#ec4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} xl={8}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Strategy briefs</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Living docs powering every campaign</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {briefData.map((b, i) => (
                  <motion.div key={i} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                    <div style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: 8, color: 'var(--text-secondary)' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{b.title}</strong>
                          <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{b.client} · {b.owner} · {b.time}</Text>
                        </div>
                      </div>
                      <Tag color={b.color} style={{ borderRadius: 12, fontWeight: 600, padding: '2px 10px' }}>{b.status}</Tag>
                    </div>
                  </motion.div>
                ))}
                <Button type="dashed" block style={{ marginTop: 12, borderRadius: 12, height: 44, fontWeight: 600, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }} icon={<Sparkles size={16} />}>Draft new brief with AI</Button>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants} style={{ marginTop: 32, marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Strategic risk register</Title>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>What could derail this quarter, and who owns mitigation</Text>
      </motion.div>
      
      {/* NEW SOFT-TINT RISK CARDS */}
      <Row gutter={[16, 16]}>
        {riskData.map((r, i) => (
          <Col xs={24} xl={8} lg={8} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }} 
                style={{ 
                  borderRadius: 16, 
                  background: r.bgColor, 
                  border: `1px solid ${r.borderColor}`,
                  boxShadow: 'var(--shadow-sm)',
                  height: '100%'
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: r.color, fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
                  <AlertTriangle size={16} /> {r.type}
                </div>
                <strong style={{ fontSize: 16, display: 'block', marginBottom: 24, color: 'var(--text-primary)', lineHeight: 1.4 }}>{r.title}</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${r.borderColor}` }}>
                  <Text style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Owner: <span style={{ color: 'var(--text-primary)' }}>{r.owner}</span></Text>
                  <Text style={{ fontSize: 13, color: r.color, fontWeight: 600 }}>Impact: {r.impact}</Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

    </motion.div>
  );
};

export default Strategy;
