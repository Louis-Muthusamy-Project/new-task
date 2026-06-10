import React from 'react';
import { Typography, Row, Col, Card, Button, Select, Table, Tag, Input, Badge } from 'antd';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus, ExternalLink, Sparkles, Code, LayoutTemplate, Activity, ChevronDown, CheckCircle2, AlertCircle, UploadCloud, Smartphone, Globe, Monitor, PenTool } from 'lucide-react';
import { allSitesPerformance } from '../data/mock';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const WebsiteBuilder = () => {
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

  const siteCols = [
    { title: 'SITE', dataIndex: 'site', key: 'site', render: (text, record) => <div><strong style={{ display: 'block', color: 'var(--text-primary)' }}>{text}</strong><a style={{ fontSize: 13, color: 'var(--accent-info)', fontWeight: 500 }}>{record.url}</a></div> },
    { title: 'VISITORS', dataIndex: 'visitors', key: 'visitors', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'CONV.', dataIndex: 'conv', key: 'conv', render: text => <strong style={{ color: 'var(--accent-primary)' }}>{text}</strong> },
    { title: 'SPEED', dataIndex: 'speed', key: 'speed', render: text => <span style={{ color: text > 90 ? 'var(--accent-primary)' : text === '-' ? 'var(--text-tertiary)' : 'var(--accent-warning)', fontWeight: 600 }}>{text}</span> },
    { title: 'SEO', dataIndex: 'seo', key: 'seo', render: text => <span style={{ color: text > 80 ? 'var(--accent-primary)' : text === '-' ? 'var(--text-tertiary)' : 'var(--accent-warning)', fontWeight: 600 }}>{text}</span> },
    { title: 'UPDATED', dataIndex: 'updated', key: 'updated', render: text => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text> },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: text => <Tag style={{ borderRadius: 12, border: 'none', background: text === 'Live' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)', color: text === 'Live' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 700, padding: '2px 8px' }}>{text}</Tag> },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Website & CRO</Title>
          <Text type="secondary">Build, launch, and optimize every client website — AI-powered, drag-and-drop, with funnels, forms, and domain management built in.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<LayoutGrid size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>Open Site Builder</Button>
          <Button icon={<Plus size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>New Site</Button>
          <Button icon={<ExternalLink size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>View Live Site</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Select defaultValue="Prestige Estates" style={{ width: 250, fontWeight: 600 }} size="large"><Option value="Prestige Estates">Prestige Estates</Option></Select>
        <Tag style={{ borderRadius: 16, padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', margin: 0, fontWeight: 600, fontSize: 13 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', marginRight: 10, boxShadow: '0 0 8px var(--accent-primary)' }} />
          Live — prestigeestates.com
        </Tag>
      </motion.div>

      {/* NEW BROWSER WINDOW CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {[
          { label: 'SITE HEALTH SCORE', val: '88/100', sub: '▲ +4 this month', alert: '2 critical · 14 warnings', showRing: true, color: 'var(--accent-primary)' },
          { label: 'MONTHLY VISITORS', val: '48,200', sub: '▲ +15%', alert: 'Organic: 54% · Paid: 26% · Direct: 20%', color: 'var(--accent-info)' },
          { label: 'CONVERSION RATE', val: '3.8%', sub: '▲ +0.4%', alert: '1,842 conversions this month', color: 'var(--accent-primary)' },
          { label: 'PAGE SPEED SCORE', val: '91/100', badge: 'Good ✓', alert: 'LCP: 2.1s · CLS: 0.08 · INP: 84ms', color: 'var(--accent-warning)' },
          { label: 'ACTIVE PAGES', val: '48', sub: '▲ +2 new this month', alert: '12 landing · 6 blog · 30 core', color: 'var(--accent-secondary)' },
        ].map((kpi, i) => (
          <Col xs={24} sm={12} lg={4} style={{ flex: '1 1 200px', minWidth: 200}} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card 
                bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }} 
                style={{ 
                  borderRadius: 12, 
                  height: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                {/* Browser Window Title Bar */}
                <div style={{ 
                  height: 32, 
                  background: 'var(--bg-tertiary)', 
                  borderBottom: '1px solid var(--border-color)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 12px',
                  gap: 6
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-danger)' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-warning)' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '40%', height: 6, background: 'var(--border-color)', borderRadius: 4 }} />
                  </div>
                </div>

                <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>{kpi.label}</Text>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div>
                      <Title level={2} style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontWeight: 800 }}>{kpi.val}</Title>
                      {kpi.sub && <Text style={{ fontSize: 13, color: kpi.color, display: 'block', fontWeight: 600 }}>{kpi.sub}</Text>}
                    </div>
                    
                    {kpi.showRing && (
                      <div style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '50%', 
                        border: '4px solid var(--accent-primary)', 
                        borderTopColor: 'transparent', 
                        transform: 'rotate(45deg)' 
                      }} />
                    )}
                    
                    {kpi.badge && <Tag style={{ borderRadius: 12, border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontWeight: 700, padding: '2px 8px', margin: 0 }}>{kpi.badge}</Tag>}
                  </div>
                  
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 'auto', paddingTop: 16, fontWeight: 500 }}>{kpi.alert}</Text>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', marginBottom: 32, overflowX: 'auto', paddingBottom: 2 }}>
        <div style={{ paddingBottom: 16, borderBottom: '3px solid var(--accent-secondary)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}><LayoutGrid size={18} color="var(--accent-secondary)"/> Builder</div>
        <div style={{ paddingBottom: 16, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Funnels</div>
        <div style={{ paddingBottom: 16, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Forms</div>
        <div style={{ paddingBottom: 16, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Surveys</div>
        <div style={{ paddingBottom: 16, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>QR Codes</div>
        <div style={{ paddingBottom: 16, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Domains</div>
        <div style={{ paddingBottom: 16, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>Analytics</div>
      </motion.div>

      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
            <Card style={{ borderRadius: 16, border: '2px solid var(--accent-secondary)', background: 'var(--bg-secondary)', height: '100%', boxShadow: '0 8px 24px rgba(13, 148, 136, 0.08)' }} bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Title level={5} style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontSize: 18 }}><Sparkles size={22} color="var(--accent-secondary)" /> Generate with AI</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20, fontWeight: 500 }}>Describe the website you want. Our AI builds it in under 60 seconds — full pages, copy, layout, and images.</Text>
              <TextArea rows={4} placeholder="e.g. A luxury real estate landing page for Prestige estates with hero, features, gallery, and lead form..." style={{ borderRadius: 12, marginBottom: 20, fontSize: 14, padding: 12 }} />
              
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12, fontWeight: 700, letterSpacing: 1 }}>STYLE</Text>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <Tag style={{ borderRadius: 20, border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', background: 'rgba(13, 148, 136, 0.1)', fontWeight: 600, padding: '4px 12px', margin: 0, cursor: 'pointer' }}>Modern</Tag>
                <Tag style={{ borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600, padding: '4px 12px', margin: 0, cursor: 'pointer' }}>Minimal</Tag>
                <Tag style={{ borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600, padding: '4px 12px', margin: 0, cursor: 'pointer' }}>Bold</Tag>
                <Tag style={{ borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600, padding: '4px 12px', margin: 0, cursor: 'pointer' }}>Luxury</Tag>
              </div>

              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12, fontWeight: 700, letterSpacing: 1 }}>PAGES</Text>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                <Tag style={{ borderRadius: 20, border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', background: 'rgba(13, 148, 136, 0.1)', fontWeight: 600, padding: '4px 12px', margin: 0, cursor: 'pointer' }}>1 page</Tag>
                <Tag style={{ borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600, padding: '4px 12px', margin: 0, cursor: 'pointer' }}>4 pages</Tag>
                <Tag style={{ borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600, padding: '4px 12px', margin: 0, cursor: 'pointer' }}>5 pages</Tag>
                <Tag style={{ borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 600, padding: '4px 12px', margin: 0, cursor: 'pointer' }}>Full site</Tag>
              </div>

              <Button type="primary" icon={<Sparkles size={18} />} style={{ width: '100%', borderRadius: 12, background: 'var(--accent-secondary)', height: 48, marginTop: 'auto', fontWeight: 700, fontSize: 15, border: 'none', boxShadow: 'var(--shadow-md)' }}>Generate Site</Button>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
            <Card className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Title level={5} style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontSize: 18 }}><LayoutTemplate size={22} color="var(--accent-info)" /> Start from a Template</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24, fontWeight: 500 }}>100+ professionally designed templates. Filter by industry and customize everything.</Text>
              
              <div style={{ height: 160, border: '2px dashed var(--border-color)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24, background: 'rgba(59, 130, 246, 0.05)', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }}>
                <Button type="link" style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-info)' }}>Browse Templates →</Button>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
            <Card className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Title level={5} style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontSize: 18 }}><Code size={22} color="var(--accent-warning)" /> Import or Upload Code</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24, fontWeight: 500 }}>Upload HTML/CSS/JS files, paste code, or import from Webflow, Figma, or WordPress.</Text>
              
              <div style={{ height: 160, border: '2px dashed var(--border-color)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24, background: 'rgba(245, 158, 11, 0.05)', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }}>
                <Button type="link" style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-warning)' }}>Import Site →</Button>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants} style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Client Sites — Prestige Estates <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>(3 Sites)</span></Title>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>All websites and landing pages for this client</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input placeholder="Search sites..." prefix={<Globe size={16} color="var(--text-tertiary)"/>} style={{ borderRadius: 8, width: 200, height: 40 }} />
          <Select defaultValue="Status: All" style={{ width: 140, height: 40 }}><Option value="Status: All">Status: All</Option></Select>
          <Select defaultValue="Type: All" style={{ width: 140, height: 40 }}><Option value="Type: All">Type: All</Option></Select>
        </div>
      </motion.div>

      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col xs={24} lg={12}>
          <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
            <Card className="glassmorphism" bodyStyle={{ padding: 32 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontWeight: 700, padding: '4px 12px' }}>● LIVE</Tag>
                <div style={{ width: 100, height: 50, background: 'var(--bg-tertiary)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}><Monitor size={24} color="var(--text-secondary)" /></div>
                <Tag style={{ margin: 0, borderRadius: 12, background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, padding: '4px 12px' }}>Main Website</Tag>
              </div>
              
              <strong style={{ fontSize: 18, display: 'block', marginBottom: 8, textAlign: 'center', color: 'var(--text-primary)' }}>Prestige Estates — Main Website</strong>
              <a style={{ display: 'block', textAlign: 'center', fontSize: 14, color: 'var(--accent-info)', marginBottom: 24, fontWeight: 500 }}>prestigeestates.com</a>
              
              <Text type="secondary" style={{ fontSize: 13, display: 'block', textAlign: 'center', marginBottom: 32, fontWeight: 500 }}>48,200 visitors/mo · 48 pages · Last edited 2 days ago</Text>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button type="primary" style={{ background: 'var(--accent-secondary)', borderRadius: 8, height: 40, fontWeight: 600, border: 'none' }}>Open Builder</Button>
                <Button icon={<ExternalLink size={16}/>} style={{ borderRadius: 8, height: 40, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>View Live</Button>
                <Button icon={<span style={{ letterSpacing: 2, fontWeight: 700 }}>...</span>} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }} />
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <Row gutter={[24, 24]} style={{ height: '100%' }}>
            <Col xs={24} md={12}>
              <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <Card className="glassmorphism" bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontWeight: 700, padding: '2px 8px' }}>● LIVE</Tag>
                    <Tag style={{ margin: 0, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: 'var(--accent-info)', fontWeight: 600 }}>Landing Page</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><div style={{ width: 70, height: 40, background: 'var(--bg-tertiary)', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}><Smartphone size={20} color="var(--text-secondary)" /></div></div>
                  <strong style={{ fontSize: 14, display: 'block', textAlign: 'center', marginBottom: 8, color: 'var(--text-primary)' }}>Luxury Living Campaign — Q2 2026</strong>
                  <a style={{ display: 'block', textAlign: 'center', fontSize: 12, color: 'var(--accent-info)', marginBottom: 16, fontWeight: 500 }}>prestigeestates.com/luxury-q2</a>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center', marginBottom: 20, fontWeight: 500 }}>6,230 visitors · 1 page · Last edited 1 week ago</Text>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 'auto' }}>
                    <Button type="primary" size="middle" style={{ background: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 600, border: 'none' }}>Open Builder</Button>
                    <Button size="middle" icon={<ExternalLink size={14}/>} style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }} />
                  </div>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <Card className="glassmorphism" bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px dashed var(--border-color)', height: '100%', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-warning)', fontWeight: 700, padding: '2px 8px' }}>DRAFT</Tag>
                    <Tag style={{ margin: 0, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: 'var(--accent-info)', fontWeight: 600 }}>Landing Page</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><div style={{ width: 70, height: 40, background: 'var(--bg-tertiary)', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}><PenTool size={20} color="var(--text-secondary)" /></div></div>
                  <strong style={{ fontSize: 14, display: 'block', textAlign: 'center', marginBottom: 8, color: 'var(--text-primary)' }}>Whitefield Project — New Launch Page</strong>
                  <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12, marginBottom: 16, fontWeight: 500 }}>Not published yet</Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center', marginBottom: 20, fontWeight: 500 }}>0 visitors · 1 page · Last edited Today</Text>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 'auto' }}>
                    <Button type="primary" size="middle" style={{ background: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 600, border: 'none' }}>Open Builder</Button>
                    <Button size="middle" style={{ borderRadius: 8, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-primary)', fontWeight: 600 }}>Publish <UploadCloud size={14} style={{ marginLeft: 6 }}/></Button>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Col>
      </Row>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Changes across all sites — last 7 days</Text></div>} 
          extra={<Button type="link" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-secondary)' }}>View Full History →</Button>}
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 40, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingLeft: 8 }}>
            {[
              { user: 'Divya Das', action: 'published "Prestige Somerville — Phase 2 launch page"', site: 'prestigeestates.com/somerville-ph2', time: '2 hrs ago', dot: 'var(--accent-primary)' },
              { user: 'Arjun Sharma', action: 'edited Homepage hero section', site: 'Main Website', time: '2 days ago', dot: 'var(--accent-info)' },
              { user: 'AI Co-pilot', action: 'wrote 14 meta descriptions missing across 14 pages', site: 'Main Website', time: 'Yesterday', dot: 'var(--accent-warning)' },
              { user: 'Whitefield landing page', action: 'published — now live', site: 'prestigeestates.com/whitefield', time: 'Yesterday', dot: 'var(--accent-primary)' },
              { user: 'Conversion rate improved 0.4%', action: '— A/B test concluded - Variant B wins', site: 'Q2 Campaign page', time: '3 days ago', dot: 'var(--accent-primary)' },
            ].map((log, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                {i !== 4 && <div style={{ position: 'absolute', top: 24, left: 6, width: 2, height: 'calc(100% + 4px)', background: 'var(--border-color)' }} />}
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: log.dot, border: '3px solid var(--bg-secondary)', zIndex: 1, marginTop: 4, boxShadow: `0 0 0 1px ${log.dot}` }} />
                <div>
                  <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{log.user}</strong> <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{log.action}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <Tag style={{ margin: 0, borderRadius: 12, border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>{log.site}</Tag>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{log.time}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card 
          title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>All Sites Performance — This Month</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Traffic, conversion, and speed across every live site</Text></div>} 
          className="glassmorphism" style={{ borderRadius: 16, marginBottom: 40, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 0 }}
        >
          <Table columns={siteCols} dataSource={allSitesPerformance} pagination={false} rowKey="id" size="middle" scroll={{ x: 1000 }} rowClassName={() => 'hover-bg'} />
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 20 }}>
        <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Templates — Start Faster</Title>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Choose a template, customize with AI, launch in minutes</Text>
      </motion.div>
      
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <Input placeholder="Search templates..." prefix={<LayoutTemplate size={16} color="var(--text-tertiary)"/>} style={{ borderRadius: 8, width: 300, height: 40 }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Real Estate', 'B2B', 'E-commerce', 'Healthcare', 'Finance', 'SaaS', 'Restaurant'].map(t => (
            <Tag key={t} style={{ borderRadius: 20, cursor: 'pointer', background: t === 'All' ? 'var(--text-primary)' : 'var(--bg-primary)', color: t === 'All' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: t === 'All' ? 'none' : '1px solid var(--border-color)', padding: '6px 16px', fontWeight: 600, fontSize: 13 }}>{t}</Tag>
          ))}
        </div>
      </motion.div>

      <Row gutter={[24, 24]}>
        {[
          { name: 'Real Estate Premium', pages: '5 pages', used: '384', rating: '4.9', cat: 'Real Estate', bg: 'linear-gradient(135deg, #1e293b, #0f172a)' },
          { name: 'Lead Gen — Property Launch', pages: '1 page', used: '1,245', rating: '4.8', cat: 'Landing Page', bg: 'linear-gradient(135deg, #d97706, #b45309)' },
          { name: 'Luxury Brand', pages: '8 pages', used: '824', rating: '4.9', cat: 'Full Site', bg: 'linear-gradient(135deg, #334155, #1e293b)' },
          { name: 'D2C Product Store', pages: '12 pages', used: '2,140', rating: '4.7', cat: 'E-commerce', bg: 'linear-gradient(135deg, #ea580c, #c2410c)' },
          { name: 'SaaS Landing Page', pages: '1 page', used: '3,200', rating: '4.9', cat: 'SaaS', bg: 'linear-gradient(135deg, #7c3aed, #5b21b6)' },
          { name: 'Restaurant & Hospitality', pages: '6 pages', used: '480', rating: '4.6', cat: 'Restaurant', bg: 'linear-gradient(135deg, #059669, #047857)' },
        ].map((tpl, i) => (
          <Col xs={24} sm={12} lg={8} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -6, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <Card bodyStyle={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', boxShadow: 'var(--shadow-sm)', height: '100%' }}>
                <div style={{ height: 180, background: tpl.bg, borderRadius: 12, marginBottom: 20, position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }}>
                  <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 24, background: 'rgba(255,255,255,0.15)', borderRadius: 6 }} />
                  <div style={{ position: 'absolute', top: 64, left: 20, right: 20, bottom: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }} />
                  <div style={{ position: 'absolute', bottom: 24, right: 24, width: 80, height: 24, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                </div>
                <Tag style={{ margin: '0 0 12px', borderRadius: 6, background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, padding: '2px 8px', width: 'fit-content' }}>{tpl.cat}</Tag>
                <strong style={{ display: 'block', fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>{tpl.name}</strong>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 24, fontWeight: 500 }}>{tpl.pages} · Mobile-optimized · SEO-ready<br/>★ {tpl.rating} · Used by {tpl.used} agencies</Text>
                
                <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                  <Button style={{ flex: 1, borderRadius: 8, height: 40, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Preview</Button>
                  <Button type="primary" style={{ flex: 1, borderRadius: 8, height: 40, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontWeight: 600 }}>Use Template</Button>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: 40, marginBottom: 40 }}>
        <Button type="default" style={{ borderRadius: 20, height: 44, padding: '0 24px', fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Show All 100+ Templates <ChevronDown size={16} style={{ marginLeft: 8 }}/></Button>
      </motion.div>

    </motion.div>
  );
};

export default WebsiteBuilder;
