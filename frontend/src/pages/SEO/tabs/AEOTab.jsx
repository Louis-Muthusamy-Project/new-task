import React, { useState } from 'react';
import { Typography, Row, Col, Card, Table, Tag, Button, Progress, Avatar } from 'antd';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, MessageSquare, Info, X, ChevronRight, Edit } from 'lucide-react';

const { Title, Text } = Typography;

const snippetData = [
  { id: 1, query: 'best luxury apartments bangalore', type: 'Paragraph', pos: '#1', volume: '8,100', preview: 'Prestige Estates offers...', risk: 'Low' },
  { id: 2, query: 'prestige group track record', type: 'Paragraph', pos: '#1', volume: '4,400', preview: 'Founded in 1986, Prestige...', risk: 'Low' },
  { id: 3, query: 'how to buy apartment bangalore', type: 'List', pos: '#1', volume: '6,800', preview: '1. Choose location 2. Set budg...', risk: 'Medium' },
  { id: 4, query: 'whitefield property rates 2026', type: 'Table', pos: '#1', volume: '3,200', preview: 'Price table shown', risk: 'High' },
  { id: 5, query: 'luxury villa checklist', type: 'List', pos: '#2', volume: '2,900', preview: 'Competitor owns #1', risk: 'Medium' },
  { id: 6, query: 'real estate agent bangalore', type: 'Paragraph', pos: '#1', volume: '5,400', preview: 'BCC Martech certified...', risk: 'Low' },
  { id: 7, query: 'prestige somerville review', type: 'Rich', pos: '#1', volume: '3,800', preview: '4.8★ (124 reviews)', risk: 'Low' },
  { id: 8, query: 'apartment loan eligibility', type: 'Paragraph', pos: '#3', volume: '12,000', preview: 'Competitor owns #1', risk: 'High' }
];

const paaQueries = [
  { id: 1, q: 'What is the price of Prestige Estates apartments in Bangalore?', status: 'We own the answer', triggers: '4,200 monthly triggers', color: 'success' },
  { id: 2, q: 'Is Prestige Group a good builder?', status: 'We own the answer', triggers: '3,500 monthly triggers', color: 'success' },
  { id: 3, q: 'Which is the best area to buy flat in Bangalore?', status: 'Competitor appears first', triggers: '8,100 monthly triggers', color: 'warning', btn: 'Optimize' },
  { id: 4, q: 'What is the minimum budget for an apartment in Bangalore?', status: 'We own the answer', triggers: '2,900 monthly triggers', color: 'success' },
  { id: 5, q: 'How long does property registration take in Karnataka?', status: 'Not ranking', triggers: '1,800 monthly triggers', color: 'error', btn: 'Create Content' },
];

const schemaList = [
  { name: 'Organization schema', status: 'check' },
  { name: 'LocalBusiness schema', status: 'check' },
  { name: 'FAQPage schema (8 pages)', status: 'check' },
  { name: 'BreadcrumbList', status: 'check' },
  { name: 'Review / AggregateRating', status: 'check' },
  { name: 'HowTo schema (3 pages missing)', status: 'warning', action: 'Implement' },
  { name: 'VideoObject schema', status: 'warning', action: 'Implement' },
  { name: 'SpeakableSpecification (voice)', status: 'error', action: 'Add' },
];

const AEOTab = ({ itemVariants }) => {
  const [showInfo, setShowInfo] = useState(true);

  const snippetCols = [
    { title: 'QUERY', dataIndex: 'query', key: 'query', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { 
      title: 'TYPE', 
      dataIndex: 'type', 
      key: 'type', 
      render: val => <Tag color="processing" style={{ borderRadius: 12, fontWeight: 600 }}><MessageSquare size={12} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }}/>{val}</Tag> 
    },
    { title: 'POS', dataIndex: 'pos', key: 'pos', render: val => <strong style={{ color: 'var(--accent-primary)', fontSize: 14 }}>{val}</strong> },
    { title: 'VOLUME', dataIndex: 'volume', key: 'volume', render: text => <span style={{ color: 'var(--text-primary)' }}>{text}</span> },
    { title: 'PREVIEW', dataIndex: 'preview', key: 'preview', render: text => <Text type="secondary">{text}</Text> },
    { 
      title: 'RISK', 
      dataIndex: 'risk', 
      key: 'risk', 
      render: val => {
        let color = val === 'Low' ? 'success' : val === 'Medium' ? 'warning' : 'error';
        return <Tag color={color} style={{ borderRadius: 12, fontWeight: 600 }}>{val === 'Low' ? '✓ ' : '⚠️ '}{val}</Tag>;
      } 
    },
    { title: '', key: 'action', render: () => <Button type="link" size="small" style={{ fontWeight: 600 }}>Edit</Button> }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      
      {showInfo && (
        <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <MessageSquare size={24} style={{ color: 'var(--accent-primary)', marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Title level={5} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>What is AEO?</Title>
                <Button type="text" icon={<X size={16} />} onClick={() => setShowInfo(false)} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <Text style={{ color: 'var(--accent-primary)', fontSize: 13, display: 'block' }}>
                Answer Engine Optimisation ensures your content appears as the direct answer in Google's featured snippets, People Also Ask boxes, Knowledge Panels, and voice search results. Owning these positions means your brand answers the question — before users even click.
              </Text>
            </div>
          </div>
        </motion.div>
      )}

      {/* 5 Small Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'FEATURED SNIPPETS OWNED', val: '28', sub: '▲ +6', text: 'of 84 opportunities', color: 'var(--accent-primary)' },
          { label: 'PEOPLE ALSO ASK', val: '47', sub: '▲ +9', text: 'PAA box appearances', color: 'var(--accent-info)' },
          { label: 'KNOWLEDGE PANEL', val: 'ACTIVE ✓', sub: '', text: 'Google Business + entity', color: 'var(--accent-secondary)', isTag: true, tagColor: 'success' },
          { label: 'VOICE SEARCH COVERAGE', val: '61%', sub: '▲ +4%', text: 'of conversational queries', color: 'var(--accent-warning)' },
          { label: 'FAQ IMPRESSIONS', val: '12.4K', sub: '▲ +12%', text: 'FAQ schema triggers/mo', color: 'var(--accent-info)' },
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
              {kpi.isTag && <Tag style={{ borderRadius: 12, fontWeight: 600, marginTop: 8 }}>Verified</Tag>}
              {!kpi.isTag && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4, fontWeight: 500 }}>{kpi.text}</Text>}
            </Card>
          </motion.div>
        ))}
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Featured Snippet Positions</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Queries where Prestige Estates appears as the direct answer</Text></div>} 
              extra={<Button type="default" style={{ borderRadius: 8, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 600 }}>Find Opportunities</Button>}
              className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: '24px 0' }}
            >
              <div style={{ overflowX: 'auto', padding: '0 24px' }}>
                <Table columns={snippetCols} dataSource={snippetData} pagination={false} rowKey="id" size="middle" scroll={{ x: 800 }} style={{ minWidth: 800 }} />
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card 
              title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>People Also Ask — Top Queries</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Questions where your content appears in PAA boxes</Text></div>} 
              className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {paaQueries.map((item, i) => (
                  <div key={i} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <ChevronRight size={16} />
                        <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{item.q}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {item.color === 'success' ? <CheckCircle2 size={14} color="var(--accent-secondary)"/> : item.color === 'warning' ? <AlertTriangle size={14} color="var(--accent-warning)"/> : <X size={14} color="var(--accent-danger)"/>}
                        <Text style={{ color: `var(--accent-${item.color === 'success' ? 'secondary' : item.color === 'warning' ? 'warning' : 'danger'})`, fontWeight: 600, fontSize: 12 }}>{item.status}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>— {item.triggers}</Text>
                      </div>
                    </div>
                    {item.btn && <Button size="small" style={{ borderRadius: 8, fontWeight: 600 }}>{item.btn}</Button>}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} xl={8}>
          <motion.div variants={itemVariants}>
            <Card title={<Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Schema Markup</Title>} className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 16 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 12 }}>Structured data implementation</Text>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {schemaList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                      {item.status === 'check' ? <CheckCircle2 size={16} color="var(--accent-secondary)"/> : item.status === 'warning' ? <AlertTriangle size={16} color="var(--accent-warning)"/> : <X size={16} color="var(--accent-danger)"/>}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    {item.action && <a style={{ color: item.status === 'warning' ? 'var(--accent-warning)' : 'var(--accent-danger)', fontWeight: 600, fontSize: 12 }}>{item.action}</a>}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
                  <Text type="secondary">Schema Health</Text>
                  <Text style={{ color: 'var(--text-primary)' }}>75%</Text>
                </div>
                <Progress percent={75} showInfo={false} strokeColor="var(--accent-warning)" trailColor="var(--border-color)" />
              </div>
              <Button block style={{ borderRadius: 8, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 600 }}>Run Schema Validator</Button>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card title={<Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Knowledge Panel</Title>} extra={<Tag color="success" style={{ borderRadius: 12, fontWeight: 600 }}>Active & Verified</Tag>} className="glassmorphism" style={{ borderRadius: 16, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 20 }}>
              <strong style={{ fontSize: 16, display: 'block', color: 'var(--text-primary)' }}>Prestige Estates</strong>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Real estate developer</Text>
              <Text style={{ fontSize: 13, display: 'block', marginBottom: 16, color: 'var(--text-primary)' }}>Prestige Estates Projects Limited is...</Text>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
                <Text type="secondary">Founded: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>1986</span></Text>
                <Text type="secondary">HQ: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Bangalore</span></Text>
              </div>
              <Text style={{ color: 'var(--accent-warning)', fontSize: 13, display: 'block', marginBottom: 20, fontWeight: 600 }}>★★★★☆ 4.2 (2,641 reviews)</Text>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <Text type="secondary">Entity Authority</Text>
                  <Tag color="success" style={{ borderRadius: 12, fontWeight: 600, margin: 0 }}>✓ Strong</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <Text type="secondary">Wikipedia</Text>
                  <strong style={{ color: 'var(--accent-secondary)' }}>✓ Exists</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <Text type="secondary">Google Business</Text>
                  <strong style={{ color: 'var(--accent-secondary)' }}>✓ Verified</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <Text type="secondary">Wikidata ID</Text>
                  <strong style={{ color: 'var(--accent-secondary)' }}>✓ Linked</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 13 }}>
                  <Text type="secondary">Updated</Text>
                  <strong style={{ color: 'var(--accent-secondary)' }}>✓ 2 weeks ago</strong>
                </div>
                <Button block style={{ borderRadius: 8, fontWeight: 600 }}>Edit Entity Data</Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card title={<Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Voice Search Readiness</Title>} className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ height: 160, display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ value: 61, fill: 'var(--accent-primary)' }, { value: 39, fill: 'var(--bg-tertiary)' }]} innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} stroke="none" />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Title level={1} style={{ margin: 0, fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>61</Title>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>/100</Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} color="var(--accent-secondary)"/> <Text type="secondary">Conversational keywords targeted (28/45)</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} color="var(--accent-secondary)"/> <Text type="secondary">FAQ schema on key pages</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={14} color="var(--accent-warning)"/> <Text type="secondary">Page load &lt; 2s (4 pages failing)</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={14} color="var(--accent-warning)"/> <Text type="secondary">Local business schema complete</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><X size={14} color="var(--accent-danger)"/> <Text type="secondary">SpeakableSpecification missing</Text></div>
              </div>

              <Button type="primary" block icon={<MessageSquare size={16} />} style={{ borderRadius: 8, background: 'var(--accent-primary)', fontWeight: 600 }}>Improve Voice Score</Button>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default AEOTab;
