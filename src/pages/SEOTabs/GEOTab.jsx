import React, { useState } from 'react';
import { Typography, Row, Col, Card, Table, Tag, Button, Progress } from 'antd';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { Sparkles, X, BrainCircuit, MessageCircle, Bot } from 'lucide-react';

const { Title, Text } = Typography;

const geoScoreHistory = [
  { month: 'Jul', val: 42 }, { month: 'Aug', val: 44 }, { month: 'Sep', val: 46 },
  { month: 'Oct', val: 49 }, { month: 'Nov', val: 51 }, { month: 'Dec', val: 54 },
  { month: 'Jan', val: 56 }, { month: 'Feb', val: 59 }, { month: 'Mar', val: 62 },
  { month: 'Apr', val: 65 }, { month: 'May', val: 68 }, { month: 'Jun', val: 72 }
];

const citationLog = [
  { id: 1, query: 'best luxury apartments in bangalore 2026', engine: 'Google AI', type: 'Direct', source: '/projects/luxury-apartments', time: 'Today, 2:14 PM', visits: '+340' },
  { id: 2, query: 'prestige group developer reputation', engine: 'Perplexity', type: 'Direct', source: '/about/our-story', time: 'Today, 9:42 AM', visits: '+120' },
  { id: 3, query: 'real estate developers to trust in bangalore', engine: 'ChatGPT', type: 'Mention', source: 'Homepage', time: 'Yesterday, 6:18 PM', visits: '+80' },
  { id: 4, query: 'whitefield apartment prices 2026', engine: 'Gemini', type: 'Data', source: '/blog/whitefield-prices', time: 'Yesterday, 3:22 PM', visits: '+210' },
  { id: 5, query: 'bangalore luxury real estate trends', engine: 'Perplexity', type: 'Direct', source: '/blog/2026-trends', time: '2 days ago', visits: '+190' },
  { id: 6, query: 'nri investment in bangalore property', engine: 'Google AI', type: 'Mention', source: '/nri-investments', time: '2 days ago', visits: '+95' },
  { id: 7, query: 'which builder is best in south bangalore', engine: 'ChatGPT', type: 'Direct', source: '/why-prestige', time: '3 days ago', visits: '+260' },
  { id: 8, query: 'luxury property market bangalore Q2 2026', engine: 'Gemini', type: 'Data', source: '/market-report-q2', time: '4 days ago', visits: '+420' }
];

const citationShare = [
  { name: 'Google AI Overview', value: 34, fill: '#3b82f6' },
  { name: 'Perplexity', value: 12, fill: '#8b5cf6' },
  { name: 'ChatGPT', value: 8, fill: '#10b981' },
  { name: 'Gemini', value: 10, fill: '#f59e0b' }
];

const citedContent = [
  { name: 'Blog Posts', val: 24, fill: '#3b82f6' },
  { name: 'Project Pages', val: 14, fill: '#3b82f6' },
  { name: 'About/Company', val: 10, fill: '#8b5cf6' },
  { name: 'Market Reports', val: 9, fill: '#f59e0b' },
  { name: 'Homepage', val: 4, fill: '#94a3b8' }
];

const GEOTab = ({ itemVariants }) => {
  const [showInfo, setShowInfo] = useState(true);

  const citationCols = [
    { title: 'QUERY', dataIndex: 'query', key: 'query', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { 
      title: 'ENGINE', 
      dataIndex: 'engine', 
      key: 'engine', 
      render: val => {
        let color, icon;
        if (val === 'Google AI') { color = 'processing'; icon = <Sparkles size={12} style={{marginRight:4, verticalAlign:'middle'}}/>; }
        else if (val === 'Perplexity') { color = 'purple'; icon = <BrainCircuit size={12} style={{marginRight:4, verticalAlign:'middle'}}/>; }
        else if (val === 'ChatGPT') { color = 'success'; icon = <MessageCircle size={12} style={{marginRight:4, verticalAlign:'middle'}}/>; }
        else { color = 'warning'; icon = <Bot size={12} style={{marginRight:4, verticalAlign:'middle'}}/>; }
        return <Tag color={color} style={{ borderRadius: 12, fontWeight: 600 }}>{icon}{val}</Tag>;
      } 
    },
    { 
      title: 'TYPE', 
      dataIndex: 'type', 
      key: 'type', 
      render: val => <Tag style={{ borderRadius: 12, fontWeight: 600, color: 'var(--accent-secondary)', background: 'rgba(16, 185, 129, 0.1)', border: 'none' }}>• {val}</Tag> 
    },
    { title: 'SOURCE', dataIndex: 'source', key: 'source', render: text => <Text type="secondary">{text}</Text> },
    { title: 'TIME', dataIndex: 'time', key: 'time', render: text => <Text type="secondary">{text}</Text> },
    { title: 'VISITS', dataIndex: 'visits', key: 'visits', render: text => <strong style={{ color: 'var(--accent-info)' }}>{text} visits</strong> }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      
      {showInfo && (
        <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <Sparkles size={24} style={{ color: 'var(--accent-info)', marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Title level={5} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>What is GEO — and why it matters now</Title>
                <Button type="text" icon={<X size={16} />} onClick={() => setShowInfo(false)} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <Text style={{ color: 'var(--accent-info)', fontSize: 13, display: 'block' }}>
                Generative Engine Optimisation (GEO) tracks how often your brand is cited as a trusted source inside AI-generated answers on Google AI Overviews, Perplexity, ChatGPT, and Gemini. By 2026, over 50% of searches trigger AI-generated responses. If your brand isn't being cited, you're invisible to half your audience.
              </Text>
            </div>
          </div>
        </motion.div>
      )}

      {/* 5 Small Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'GEO VISIBILITY SCORE', val: '72/100', sub: '▲ +8 pts', text: 'Top 22% in Real Estate', color: 'var(--accent-info)' },
          { label: 'GOOGLE AI OVERVIEW', val: '34', sub: '▲ +12', text: 'queries cited this month', color: 'var(--accent-primary)' },
          { label: 'PERPLEXITY CITATIONS', val: '12', sub: '▲ +5', text: 'direct citations', color: 'var(--accent-info)' },
          { label: 'CHATGPT / GEMINI', val: '8', sub: '▲ +3', text: 'brand mentions', color: 'var(--accent-secondary)' },
          { label: 'ENTITY AUTHORITY', val: 'STRONG ✓', sub: '', text: 'Wikipedia - Wikidata - GSG', color: 'var(--accent-secondary)', isTag: true, tagColor: 'success' },
        ].map((kpi, i) => (
          <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} key={i} style={{ height: '100%' }}>
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
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
                {kpi.isTag ? (
                  <Tag color={kpi.tagColor} style={{ fontSize: 16, padding: '4px 12px', borderRadius: 16, fontWeight: 700, margin: '8px 0' }}>{kpi.val}</Tag>
                ) : (
                  <Title level={2} style={{ margin: 0, color: 'var(--text-primary)', fontSize: 28, fontWeight: 800, whiteSpace: 'nowrap' }}>{kpi.val}</Title>
                )}
                {kpi.sub && <Text style={{ color: 'var(--accent-secondary)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{kpi.sub}</Text>}
              </div>
              {kpi.isTag && <Tag style={{ borderRadius: 12, fontWeight: 600, marginTop: 8 }}>Strong</Tag>}
              {!kpi.isTag && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4, fontWeight: 500 }}>{kpi.text}</Text>}
            </Card>
          </motion.div>
        ))}
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={10}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ height: 220, width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 24 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ value: 72, fill: 'var(--accent-info)' }, { value: 28, fill: 'var(--bg-tertiary)' }]} innerRadius={80} outerRadius={110} dataKey="value" startAngle={90} endAngle={-270} stroke="none" />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Title level={1} style={{ margin: 0, fontSize: 48, fontWeight: 800, color: 'var(--text-primary)' }}>72</Title>
                  <Text type="secondary" style={{ fontSize: 14, fontWeight: 600 }}>/100</Text>
                </div>
              </div>
              <Title level={5} style={{ margin: '0 0 8px 0', fontWeight: 700, color: 'var(--text-primary)' }}>GEO Visibility Score</Title>
              <Text type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>How often your brand appears in AI-generated answers</Text>
              <Tag color="purple" style={{ borderRadius: 12, fontWeight: 600, padding: '4px 12px', fontSize: 14, marginBottom: 32 }}>B+ — Good</Tag>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <Text type="secondary">Google AI Overviews</Text>
                    <Text style={{ color: 'var(--text-primary)' }}>78/100</Text>
                  </div>
                  <Progress percent={78} showInfo={false} strokeColor="var(--accent-primary)" trailColor="var(--bg-tertiary)" size="small" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <Text type="secondary">Perplexity.ai</Text>
                    <Text style={{ color: 'var(--text-primary)' }}>68/100</Text>
                  </div>
                  <Progress percent={68} showInfo={false} strokeColor="var(--accent-info)" trailColor="var(--bg-tertiary)" size="small" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <Text type="secondary">ChatGPT</Text>
                    <Text style={{ color: 'var(--text-primary)' }}>64/100</Text>
                  </div>
                  <Progress percent={64} showInfo={false} strokeColor="var(--accent-secondary)" trailColor="var(--bg-tertiary)" size="small" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <Text type="secondary">Gemini</Text>
                    <Text style={{ color: 'var(--text-primary)' }}>74/100</Text>
                  </div>
                  <Progress percent={74} showInfo={false} strokeColor="var(--accent-warning)" trailColor="var(--bg-tertiary)" size="small" />
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} xl={14}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>GEO Score — Last 12 Months</Title>} className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: '24px' }}>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={geoScoreHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGeo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-info)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent-info)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--bg-primary)' }} />
                    <Area type="monotone" dataKey="val" stroke="var(--accent-info)" strokeWidth={3} fillOpacity={1} fill="url(#colorGeo)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13 }}>Jun spike: 3 major publications cited our content</Text>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>AI Citation Log</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Every time an AI engine cited Prestige Estates content — last 30 days</Text></div>} 
          extra={
            <div style={{ display: 'flex', gap: 12 }}>
              <Button size="small" style={{ borderRadius: 16, fontWeight: 600 }}>All Engines ▾</Button>
              <Button size="small" style={{ borderRadius: 16, fontWeight: 600 }}>Last 30 days ▾</Button>
            </div>
          }
          className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: '24px 0' }}
        >
          <div style={{ overflowX: 'auto', padding: '0 24px' }}>
            <Table columns={citationCols} dataSource={citationLog} pagination={false} rowKey="id" size="middle" scroll={{ x: 900 }} style={{ minWidth: 900 }} />
          </div>
        </Card>
      </motion.div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Citation Share by AI Engine</Title>} className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ height: 240, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={citationShare} innerRadius={60} outerRadius={90} dataKey="value" stroke="var(--bg-primary)" strokeWidth={2}>
                      {citationShare.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>64</Title>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>Total citations</Text>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', marginTop: 16 }}>
                {citationShare.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.fill }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.name}</Text>
                    <strong style={{ color: 'var(--text-primary)', fontSize: 12 }}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} xl={12}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card title={<Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>What Content Gets Cited Most</Title>} className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={citedContent} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} width={100} />
                    <Tooltip cursor={{ fill: 'var(--bg-tertiary)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--bg-primary)' }} />
                    <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={24}>
                      {citedContent.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants}>
        <Card title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>GEO Action Plan — Improve Your Score</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Prioritised actions to increase AI engine visibility</Text></div>} className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}>
          
          <Row gutter={[24, 24]}>
            {[
              { title: 'Publish 4 authoritative long-form guides', desc: 'AI engines prioritise comprehensive, well-cited content. Target: 2,000+ word guides on \'Luxury Living Bangalore\', \'NRI Investment Guide\', \'Whitefield Property Guide\', \'Bangalore Real Estate Q3 2026\'.', points: '+10 GEO pts', priority: 'HIGH PRIORITY', time: '2-3 weeks', owner: 'Karan', btn: 'Create Brief' },
              { title: 'Complete missing schema implementation', desc: 'Implement HowTo schema on 3 process pages and SpeakableSpecification on 8 FAQ pages. AI engines rely on structured data to identify quotable content.', points: '+8 GEO pts', priority: 'HIGH PRIORITY', time: '3-4 days (dev)', owner: 'Dev Team', btn: 'Create Task' },
              { title: 'Earn 5 citations from DA80+ publications', desc: 'Get Prestige Estates cited in Economic Times, Business Standard, Housing.com, and 99acres editorial content. AI engines treat high DA citations as trust signals.', points: '+8 GEO pts', priority: 'MEDIUM PRIORITY', time: '4-6 weeks', owner: 'Rahul', btn: 'Start Outreach' },
              { title: 'Update brand entity across web', desc: 'Ensure Wikipedia, Wikidata, Google Business, and Crunchbase entries are complete and consistent. Entity completeness directly affects how AI engines represent your brand.', points: '+5 GEO pts', priority: 'MEDIUM PRIORITY', time: '1 week', owner: '—', btn: 'Open Checklist' }
            ].map((plan, i) => (
              <Col xs={24} xl={12} key={i}>
                <div style={{ padding: 24, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Tag color={plan.priority.includes('HIGH') ? 'error' : 'warning'} style={{ borderRadius: 12, fontWeight: 700, margin: 0 }}>{plan.priority}</Tag>
                    <Tag color="purple" style={{ borderRadius: 12, fontWeight: 700, margin: 0 }}>{plan.points}</Tag>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                    <Card style={{ padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }} bodyStyle={{ padding: 0 }}>
                      <Sparkles size={24} style={{ color: 'var(--accent-info)' }} />
                    </Card>
                    <div>
                      <strong style={{ display: 'block', fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{plan.title}</strong>
                      <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5, display: 'block' }}>{plan.desc}</Text>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                      <Text type="secondary">⏱ {plan.time}</Text>
                      <Text type="secondary">👤 {plan.owner}</Text>
                    </div>
                    <Button type="primary" style={{ background: 'var(--accent-info)', borderRadius: 8, fontWeight: 600 }}>{plan.btn}</Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, background: 'rgba(139, 92, 246, 0.05)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <Text style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Total estimated GEO improvement: <strong style={{ color: 'var(--accent-info)' }}>+31 pts</strong> <span style={{ fontWeight: 400 }}>(from 72 → 100)</span></Text>
            <Button type="primary" style={{ background: 'var(--accent-info)', borderRadius: 8, fontWeight: 600 }}>Generate Full GEO Report</Button>
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
};

export default GEOTab;
