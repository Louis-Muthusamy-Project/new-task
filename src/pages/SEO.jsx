import React from 'react';
import { Typography, Row, Col, Card, Table, Tag, Button, Input, Progress, Avatar } from 'antd';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Download, Play, CheckCircle2, AlertTriangle, Info, ArrowUp, ArrowDown, Search, MessageSquare, Sparkles, Plus, TrendingUp, Link2, Activity, Target } from 'lucide-react';
import { seoKeywords, organicTrafficSparkline } from '../data/mock';

const { Title, Text } = Typography;

const SEO = () => {
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

  const keywordCols = [
    { title: 'KEYWORD', dataIndex: 'keyword', key: 'keyword', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'POS', dataIndex: 'pos', key: 'pos', render: val => <strong style={{ color: val <= 3 ? 'var(--accent-warning)' : val <= 10 ? 'var(--accent-primary)' : val <= 30 ? 'var(--accent-info)' : 'var(--accent-danger)', fontSize: 16 }}>{val <= 3 && '★ '}{val}</strong> },
    { title: 'PREV', dataIndex: 'prev', key: 'prev', render: val => <Text type="secondary">{val}</Text> },
    { 
      title: 'CHANGE', 
      dataIndex: 'change', 
      key: 'change', 
      render: val => {
        if (val === 0) return <Text type="secondary">—</Text>;
        const color = val > 0 ? 'var(--accent-primary)' : 'var(--accent-danger)';
        const bg = val > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        return <Tag style={{ color, background: bg, border: 'none', borderRadius: 12, fontWeight: 600, padding: '2px 8px' }}>{val > 0 ? <ArrowUp size={12}/> : <ArrowDown size={12}/>} {Math.abs(val)}</Tag>;
      } 
    },
    { title: 'VOLUME', dataIndex: 'volume', key: 'volume', render: text => <span style={{ color: 'var(--text-primary)' }}>{text}</span> },
    { 
      title: 'DIFFICULTY', 
      dataIndex: 'difficulty', 
      key: 'difficulty', 
      render: val => {
        let color = val === 'Low' ? 'success' : val === 'Medium' ? 'warning' : 'error';
        return <Tag color={color} style={{ borderRadius: 12, fontWeight: 600 }}>{val}</Tag>;
      } 
    },
    { title: 'FEATURED', dataIndex: 'featured', key: 'featured', render: val => val ? <Tag color="processing" style={{ borderRadius: 12, fontWeight: 600 }}>SNIPPET</Tag> : <Text type="secondary">—</Text> },
    { 
      title: 'INTENT', 
      dataIndex: 'intent', 
      key: 'intent', 
      render: val => {
        const isBrand = val === 'Brand';
        const isComm = val === 'Commercial';
        return <Tag style={{ borderRadius: 12, background: isBrand ? 'var(--text-primary)' : 'transparent', color: isBrand ? 'var(--bg-primary)' : isComm ? 'var(--accent-secondary)' : 'var(--accent-info)', border: isBrand ? 'none' : `1px solid ${isComm ? 'var(--accent-secondary)' : 'var(--accent-info)'}`, fontWeight: 600, padding: '2px 10px' }}>{val}</Tag> 
      }
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>SEO / AEO / GEO</Title>
          <Text type="secondary">Search - Answer Engine - Generative Engine — unified in one view.</Text>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 16, borderRight: '1px solid var(--border-color)' }}>
            <Avatar size="default" style={{ backgroundColor: 'var(--accent-secondary)', fontWeight: 700 }}>PE</Avatar>
            <div style={{ lineHeight: 1.2 }}>
              <strong style={{ display: 'block', fontSize: 14, color: 'var(--text-primary)' }}>Prestige Estates</strong>
              <Text type="secondary" style={{ fontSize: 11 }}>Synced 4 mins ago</Text>
            </div>
          </div>
          <Button icon={<Play size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Run Full Audit</Button>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Export Report</Button>
        </div>
      </motion.div>

      {/* NEW INNER GLOW AURA CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'SEO HEALTH', val: '88', sub: '▲ +3', color: 'var(--accent-secondary)', icon: <Search size={24} />, glowPos: 'top-left' },
          { label: 'ANSWER ENGINE', val: '74', sub: '▲ +5', color: 'var(--accent-info)', icon: <MessageSquare size={24} />, glowPos: 'bottom-right' },
          { label: 'UNIFIED SEARCH', val: '78', sub: 'Top 21% in Real Estate', color: 'var(--accent-warning)', icon: <Sparkles size={24} />, glowPos: 'bottom-left' }
        ].map((kpi, i) => (
          <Col xs={24} lg={8} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: 24, height: '100%' }} 
                style={{ 
                  borderRadius: 16, 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%'
                }}
              >
                {/* Radial Glow Aura */}
                <div style={{ 
                  position: 'absolute', 
                  top: kpi.glowPos.includes('top') ? '-20%' : 'auto', 
                  bottom: kpi.glowPos.includes('bottom') ? '-20%' : 'auto', 
                  left: kpi.glowPos.includes('left') ? '-20%' : 'auto', 
                  right: kpi.glowPos.includes('right') ? '-20%' : 'auto', 
                  width: '60%', 
                  height: '60%', 
                  background: `radial-gradient(circle, ${kpi.color} 0%, transparent 70%)`, 
                  opacity: 0.15,
                  filter: 'blur(30px)',
                  pointerEvents: 'none'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>{kpi.label}</Text>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
                      <Title level={1} style={{ margin: 0, color: 'var(--text-primary)', fontSize: 48, fontWeight: 800 }}>{kpi.val}</Title>
                      <Text type="secondary" style={{ fontSize: 16, fontWeight: 500 }}>/100</Text>
                    </div>
                    <Text style={{ color: kpi.color, fontSize: 13, fontWeight: 600, marginTop: 8 }}>{kpi.sub}</Text>
                  </div>
                  <div style={{ color: kpi.color, opacity: 0.9 }}>
                    {kpi.icon}
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* NEW MINIMALIST LINE-ART CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'KEYWORDS IN TOP 10', val: '142', sub: '▲ +12', text: 'of 284 tracked', color: 'var(--accent-secondary)', icon: <Target size={16} />, spark: true },
          { label: 'ORGANIC SESSIONS', val: '48.2K', sub: '▲ +18%', text: 'Target: 40K ✓ exceeded', color: 'var(--accent-primary)', icon: <TrendingUp size={16} />, spark: true },
          { label: 'DOMAIN AUTHORITY', val: '52', sub: '▲ +1', text: 'Industry avg: 44 (+8)', color: 'var(--accent-info)', icon: <Activity size={16} /> },
          { label: 'BACKLINKS', val: '3,840', sub: '▲ +124', text: 'Referring domains: 264', color: 'var(--accent-warning)', icon: <Link2 size={16} /> },
          { label: 'SITE HEALTH', val: '88/100', sub: '▲ +4 pts', text: '0 critical · 14 warnings', color: 'var(--accent-danger)', icon: <CheckCircle2 size={16} /> },
        ].map((kpi, i) => (
          <Col xs={24} sm={12} xl={kpi.spark ? 5 : 4} lg={8} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }} 
                style={{ 
                  borderRadius: 12, 
                  height: '100%',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderTop: `4px solid ${kpi.color}`,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{kpi.label}</Text>
                  <span style={{ color: kpi.color }}>{kpi.icon}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
                  <Title level={2} style={{ margin: 0, color: 'var(--text-primary)', fontSize: 28, fontWeight: 800, whiteSpace: 'nowrap' }}>{kpi.val}</Title>
                  <Text style={{ color: 'var(--accent-primary)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{kpi.sub}</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4, fontWeight: 500 }}>{kpi.text}</Text>
                {kpi.spark && (
                  <div style={{ height: 40, marginTop: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={organicTrafficSparkline}>
                        <Line type="monotone" dataKey="val" stroke={kpi.color} strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={17}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Keyword Rankings</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>284 tracked keywords · Updated 4 mins ago</Text></div>} 
              extra={
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  <Button type="primary" icon={<Plus size={16} />} style={{ background: 'var(--accent-secondary)', borderRadius: 8, border: 'none', fontWeight: 600 }}>Add Keywords</Button>
                  <Button type="link" style={{ color: 'var(--accent-secondary)', fontWeight: 600, padding: 0 }}>View All →</Button>
                </div>
              }
              className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <Input.Search placeholder="Filter keywords..." style={{ width: '100%', maxWidth: 360 }} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button type="primary" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: 16, fontWeight: 600 }} size="small">All (284)</Button>
                  <Button style={{ borderRadius: 16, fontWeight: 500, color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'transparent' }} size="small">Top 3 (18)</Button>
                  <Button style={{ borderRadius: 16, fontWeight: 500, color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'transparent' }} size="small">Top 10 (142)</Button>
                  <Button style={{ borderRadius: 16, fontWeight: 500, color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'transparent' }} size="small">Top 20 (198)</Button>
                  <Button style={{ borderRadius: 16, fontWeight: 500, color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'transparent' }} size="small">Dropped (8)</Button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <Table columns={keywordCols} dataSource={seoKeywords} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} style={{ minWidth: 1000 }} />
              </div>
              
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 20, borderRadius: 12, marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--accent-warning)' }}>
                  <AlertTriangle size={20} style={{ marginTop: 2 }} />
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)' }}><strong style={{ color: 'var(--accent-warning)', display: 'block', marginBottom: 4 }}>8 keywords dropped this month</strong>"prestige smart city review" fell 6 positions. Refresh page content and build 3 new backlinks.</span>
                </div>
                <Button style={{ borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)', fontWeight: 600, borderRadius: 8 }}>View All Drops</Button>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} xl={7}>
          <motion.div variants={itemVariants}>
            <Card title={<Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Site Health Score</Title>} className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ height: 200, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ value: 88, fill: 'var(--accent-secondary)' }, { value: 12, fill: 'var(--bg-tertiary)' }]} innerRadius={60} outerRadius={85} dataKey="value" startAngle={90} endAngle={-270} stroke="none" />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Title level={1} style={{ margin: 0, fontSize: 48, fontWeight: 800, color: 'var(--text-primary)' }}>88</Title>
                  <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>/100</Text>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}><Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Good — minor improvements needed</Text></div>
              
              <Row gutter={[16, 20]}>
                <Col span={12}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14}/> Performance</span> <strong style={{ color: 'var(--text-primary)' }}>91</strong></div></Col>
                <Col span={12}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14}/> Crawlability</span> <strong style={{ color: 'var(--text-primary)' }}>96</strong></div></Col>
                <Col span={12}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14}/> HTTPS/Security</span> <strong style={{ color: 'var(--text-primary)' }}>100</strong></div></Col>
                <Col span={12}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14}/> On-Page SEO</span> <strong style={{ color: 'var(--text-primary)' }}>82</strong></div></Col>
                <Col span={12}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14}/> Core Web Vitals</span> <strong style={{ color: 'var(--text-primary)' }}>78</strong></div></Col>
                <Col span={12}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14}/> Mobile Usability</span> <strong style={{ color: 'var(--text-primary)' }}>94</strong></div></Col>
              </Row>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card title={<Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Issues Breakdown</Title>} className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 16 }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={16}/> Critical Issues</span> <strong>0 - All Clear</strong>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16}/> Warnings</span> <strong>14</strong>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 14, color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={16}/> Passed Checks</span> <strong>203</strong>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                {[
                  { title: '14 pages missing meta descriptions', type: 'warning' },
                  { title: '6 images without alt text', type: 'warning' },
                  { title: '3 pages with load time >3s', type: 'warning' },
                  { title: '2 pages with duplicate H1 tags', type: 'warning' }
                ].map((issue, i) => (
                  <div key={i} style={{ padding: '12px 8px', display: 'flex', justifyContent: 'space-between', borderBottom: i < 3 ? '1px solid var(--border-color)' : 'none', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><AlertTriangle size={14} color="var(--accent-warning)" /> {issue.title}</span>
                    <a style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Fix</a>
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

export default SEO;
