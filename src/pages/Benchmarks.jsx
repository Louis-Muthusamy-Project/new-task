import React from 'react';
import { Typography, Select, Button, Row, Col, Table, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const { Title, Text } = Typography;

const Benchmarks = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // The Analytical Reticle Frame Component
  const ReticleFrame = ({ children, style, bodyStyle }) => {
    const nodeStyle = {
      position: 'absolute',
      width: 6,
      height: 6,
      background: 'var(--text-tertiary)',
      zIndex: 2
    };
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
        <div style={{ ...nodeStyle, top: -3, left: -3 }} />
        <div style={{ ...nodeStyle, top: -3, right: -3 }} />
        <div style={{ ...nodeStyle, bottom: -3, left: -3 }} />
        <div style={{ ...nodeStyle, bottom: -3, right: -3 }} />
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-color)', 
          padding: '32px 40px',
          height: '100%',
          ...bodyStyle 
        }}>
          {children}
        </div>
      </div>
    );
  };

  const percentiles = [
    { label: 'SEO Performance', value: 84, suffix: 'Top 16% in Real Estate' },
    { label: 'Social Media', value: 71, suffix: 'Top 29%' },
    { label: 'Paid Advertising', value: 68, suffix: 'Top 32%' },
    { label: 'Lead Generation', value: 78, suffix: 'Top 22%' },
    { label: 'Content Marketing', value: 82, suffix: 'Top 18%' },
    { label: 'Overall MOS', value: 79, suffix: 'Top 21%' },
  ];

  const tableData = [
    { key: '1', client: 'Prestige Estates', industry: 'Real Estate', mos: 84, avg: 68, diff: 16, seo: 'Top 16%', ads: 'Top 32%', social: 'Top 29%' },
    { key: '2', client: 'boAt', industry: 'Consumer Electronics', mos: 81, avg: 72, diff: 9, seo: 'Top 22%', ads: 'Top 18%', social: 'Top 14%' },
    { key: '3', client: 'Rapido', industry: 'Mobility', mos: 78, avg: 65, diff: 13, seo: 'Top 28%', ads: 'Top 24%', social: 'Top 31%' },
    { key: '4', client: 'Nykaa', industry: 'Beauty', mos: 76, avg: 74, diff: 2, seo: 'Top 34%', ads: 'Top 29%', social: 'Top 19%' },
    { key: '5', client: 'CRED', industry: 'Fintech', mos: 73, avg: 70, diff: 3, seo: 'Top 38%', ads: 'Top 42%', social: 'Top 45%' },
    { key: '6', client: 'Meesho', industry: 'E-Commerce', mos: 71, avg: 76, diff: -5, seo: 'Top 45%', ads: 'Top 38%', social: 'Top 41%' },
    { key: '7', client: 'Zepto', industry: 'Q-Commerce', mos: 67, avg: 71, diff: -4, seo: 'Top 52%', ads: 'Top 48%', social: 'Top 44%' },
    { key: '8', client: 'Lenskart', industry: 'Retail', mos: 63, avg: 69, diff: -6, seo: 'Top 58%', ads: 'Top 62%', social: 'Top 55%' },
    { key: '9', client: 'OYO', industry: 'Hospitality', mos: 62, avg: 67, diff: -5, seo: 'Top 61%', ads: 'Top 58%', social: 'Top 64%' },
    { key: '10', client: 'BharatPe', industry: 'Fintech', mos: 58, avg: 70, diff: -12, seo: 'Top 72%', ads: 'Top 78%', social: 'Top 68%' },
    { key: '11', client: 'Urban Company', industry: 'Services', mos: 55, avg: 63, diff: -8, seo: 'Top 74%', ads: 'Top 71%', social: 'Top 78%' },
    { key: '12', client: 'Wakefit', industry: 'D2C', mos: 49, avg: 68, diff: -19, seo: 'Bottom 30%', ads: 'Bottom 28%', social: 'Bottom 35%' },
  ];

  const columns = [
    { title: 'Client', dataIndex: 'client', key: 'client', render: (text) => <Text style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{text}</Text> },
    { title: 'Industry', dataIndex: 'industry', key: 'industry', render: (text) => <Text type="secondary">{text}</Text> },
    { title: 'MOS Score', dataIndex: 'mos', key: 'mos', align: 'center', render: (text) => <Text style={{ fontWeight: 800, fontSize: 15 }}>{text}</Text> },
    { title: 'Industry Avg', dataIndex: 'avg', key: 'avg', align: 'center', render: (text) => <Text type="secondary" style={{ fontWeight: 600 }}>{text}</Text> },
    { 
      title: 'Difference', dataIndex: 'diff', key: 'diff', align: 'center',
      render: (val) => {
        const color = val > 0 ? 'var(--accent-primary)' : val < 0 ? 'var(--accent-danger)' : 'var(--accent-warning)';
        const Icon = val > 0 ? TrendingUp : val < 0 ? TrendingDown : Minus;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color, fontWeight: 800 }}>
            <Icon size={14} /> {val > 0 ? `+${val}` : val}
          </div>
        );
      }
    },
    { title: 'SEO rank', dataIndex: 'seo', key: 'seo', align: 'center', render: (text) => <Text type="secondary">{text}</Text> },
    { title: 'Ads rank', dataIndex: 'ads', key: 'ads', align: 'center', render: (text) => <Text type="secondary">{text}</Text> },
    { title: 'Social rank', dataIndex: 'social', key: 'social', align: 'center', render: (text) => <Text type="secondary">{text}</Text> },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 64 }}>
      
      {/* Header */}
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, display: 'block', marginBottom: 8 }}>INTELLIGENCE</Text>
          <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Benchmarking Engine</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>See how your clients perform vs industry standards and competitors.</Text>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Select defaultValue="Prestige Estates" style={{ width: 200, height: 40 }} className="custom-select" />
          <Select defaultValue="All Industries" style={{ width: 180, height: 40 }} className="custom-select" />
          <Button type="primary" icon={<Download size={16} />} style={{ height: 40, background: 'var(--accent-primary)', borderRadius: 0, fontWeight: 700, border: 'none' }}>
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Radar and Percentiles */}
      <motion.div variants={itemVariants}>
        <Row gutter={[32, 32]} style={{ marginBottom: 48 }}>
          <Col xs={24} lg={12}>
            <ReticleFrame>
              <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Industry Comparison</Title>
              <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 40 }}>Prestige Estates vs Real Estate industry average</Text>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: 320 }}>
                {/* SVG Radar Chart */}
                <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%', maxWidth: 360 }}>
                  <g transform="translate(150, 150)">
                    {/* Background Grid */}
                    <polygon points="0,-100 86.6,-50 86.6,50 0,100 -86.6,50 -86.6,-50" fill="var(--bg-tertiary)" stroke="var(--border-color)" strokeWidth="1" />
                    <polygon points="0,-75 64.95,-37.5 64.95,37.5 0,75 -64.95,37.5 -64.95,-37.5" fill="none" stroke="var(--border-color)" strokeWidth="1" />
                    <polygon points="0,-50 43.3,-25 43.3,25 0,50 -43.3,25 -43.3,-25" fill="none" stroke="var(--border-color)" strokeWidth="1" />
                    <polygon points="0,-25 21.65,-12.5 21.65,12.5 0,25 -21.65,12.5 -21.65,-12.5" fill="none" stroke="var(--border-color)" strokeWidth="1" />
                    
                    {/* Axes */}
                    <line x1="0" y1="0" x2="0" y2="-100" stroke="var(--border-color)" />
                    <line x1="0" y1="0" x2="86.6" y2="-50" stroke="var(--border-color)" />
                    <line x1="0" y1="0" x2="86.6" y2="50" stroke="var(--border-color)" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="var(--border-color)" />
                    <line x1="0" y1="0" x2="-86.6" y2="50" stroke="var(--border-color)" />
                    <line x1="0" y1="0" x2="-86.6" y2="-50" stroke="var(--border-color)" />

                    {/* Labels */}
                    <text x="0" y="-115" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="700">SEO</text>
                    <text x="100" y="-55" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="700">Social</text>
                    <text x="100" y="60" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="700">Ads</text>
                    <text x="0" y="120" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="700">Leads</text>
                    <text x="-100" y="60" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="700">Content</text>
                    <text x="-100" y="-55" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="700">CX</text>

                    {/* Industry Avg Polygon (Dark) */}
                    <polygon points="0,-68 50,-28 65,30 0,68 -55,35 -50,-35" fill="var(--text-primary)" fillOpacity="0.8" stroke="var(--text-primary)" strokeWidth="2" />
                    
                    {/* Prestige Estates Polygon (Cyan/Primary) */}
                    <polygon points="0,-84 70,-20 80,45 0,80 -70,50 -60,-20" fill="var(--accent-primary)" fillOpacity="0.4" stroke="var(--accent-primary)" strokeWidth="3" />
                  </g>
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, background: 'var(--text-primary)' }} />
                  <Text style={{ fontSize: 12, fontWeight: 700 }}>Industry Avg</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, background: 'var(--accent-primary)', opacity: 0.8 }} />
                  <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)' }}>Prestige Estates</Text>
                </div>
              </div>
            </ReticleFrame>
          </Col>

          <Col xs={24} lg={12}>
            <ReticleFrame>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
                <div>
                  <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Percentile Rankings</Title>
                  <Text type="secondary" style={{ fontSize: 14 }}>Prestige Estates — where they stand in their industry</Text>
                </div>
                <Tag style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '6px 12px', fontWeight: 800 }}>79th percentile overall</Tag>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {percentiles.map((p, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{p.label}</Text>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{p.value}th</span>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>· {p.suffix}</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${p.value}%` }} 
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        style={{ height: '100%', background: 'var(--accent-primary)' }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ReticleFrame>
          </Col>
        </Row>
      </motion.div>

      {/* Massive Matrix Table */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <ReticleFrame bodyStyle={{ padding: 0 }}>
          <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border-color)' }}>
            <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>All Clients vs Industry Benchmark</Title>
            <Text type="secondary" style={{ fontSize: 14 }}>MOS scores compared with the average for each industry</Text>
          </div>
          <Table 
            dataSource={tableData} 
            columns={columns} 
            pagination={false} 
            rowClassName="hover-bg"
            style={{ padding: '0 16px 16px 16px' }}
          />
        </ReticleFrame>
      </motion.div>

      {/* Line Charts */}
      <motion.div variants={itemVariants}>
        <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Industry Benchmarks — Real Estate (selected)</Title>
        <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24 }}>12-month rolling average · highlighted months = client beat industry</Text>
        
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <ReticleFrame>
              <Title level={5} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>MOS — Prestige Estates vs Industry</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 32 }}>MOS over 12 months</Text>
              
              <div style={{ position: 'relative', height: 200 }}>
                {/* Y-Axis */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>80 —</span>
                  <span>60 —</span>
                  <span>40 —</span>
                  <span>20 —</span>
                  <span>0 —</span>
                </div>
                {/* X-Axis */}
                <div style={{ position: 'absolute', left: 30, right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
                
                {/* Chart SVG */}
                <div style={{ position: 'absolute', left: 30, right: 0, top: 10, bottom: 20 }}>
                  <svg width="100%" height="100%" preserveAspectRatio="none">
                    <path d="M 0 160 L 50 150 L 100 145 L 150 155 L 200 160 L 250 165 L 300 170 L 350 160 L 400 155 L 450 150 L 500 140 L 550 120" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeDasharray="4,4" />
                    <path d="M 0 140 L 50 130 L 100 110 L 150 120 L 200 115 L 250 100 L 300 90 L 350 85 L 400 70 L 450 60 L 500 40 L 550 20" fill="none" stroke="var(--accent-primary)" strokeWidth="3" />
                  </svg>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 2, background: 'var(--accent-secondary)' }} />
                  <Text style={{ fontSize: 11, fontWeight: 700 }}>Industry Avg</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 2, background: 'var(--accent-primary)' }} />
                  <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)' }}>Prestige Estates</Text>
                </div>
              </div>
            </ReticleFrame>
          </Col>
          <Col xs={24} md={12}>
            <ReticleFrame>
              <Title level={5} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Organic Traffic Growth (Indexed)</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 32 }}>Index over 12 months</Text>
              
              <div style={{ position: 'relative', height: 200 }}>
                {/* Y-Axis */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>160 —</span>
                  <span>120 —</span>
                  <span>80 —</span>
                  <span>40 —</span>
                  <span>0 —</span>
                </div>
                {/* X-Axis */}
                <div style={{ position: 'absolute', left: 30, right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
                
                {/* Chart SVG */}
                <div style={{ position: 'absolute', left: 30, right: 0, top: 10, bottom: 20 }}>
                  <svg width="100%" height="100%" preserveAspectRatio="none">
                    <path d="M 0 160 L 50 155 L 100 150 L 150 140 L 200 135 L 250 130 L 300 120 L 350 110 L 400 100 L 450 90 L 500 80 L 550 70" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeDasharray="4,4" />
                    <path d="M 0 150 L 50 140 L 100 130 L 150 125 L 200 115 L 250 105 L 300 90 L 350 80 L 400 70 L 450 50 L 500 30 L 550 10" fill="none" stroke="var(--accent-primary)" strokeWidth="3" />
                  </svg>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 2, background: 'var(--accent-secondary)' }} />
                  <Text style={{ fontSize: 11, fontWeight: 700 }}>Industry Avg</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 2, background: 'var(--accent-primary)' }} />
                  <Text style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)' }}>Prestige Estates</Text>
                </div>
              </div>
            </ReticleFrame>
          </Col>
        </Row>
      </motion.div>

    </motion.div>
  );
};

export default Benchmarks;
