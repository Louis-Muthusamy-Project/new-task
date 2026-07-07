import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Row, Col, Card, Button, Select, Table, Tag, Input } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Globe, Store, FileText, LayoutTemplate, Smartphone, QrCode, MessageCircle, Link2, Plus, ExternalLink, Sparkles, Code, Activity, ChevronDown } from 'lucide-react';

// Import Tab Components
import FunnelsTab from './tabs/FunnelsTab';
import WebsitesTab from './tabs/WebsitesTab';
import StoresTab from './tabs/StoresTab';
import FormsTab from './tabs/FormsTab';
import BlogsTab from './tabs/BlogsTab';
import QRLinksTab from './tabs/QRLinksTab';
import ChatWidgetsTab from './tabs/ChatWidgetsTab';
import DomainsTab from './tabs/DomainsTab';

const { Title, Text } = Typography;

const WebsiteBuilder = () => {
  // Read the wildcard sub-path so the Stores manage view can survive a
  // browser refresh. The route is mounted as "workspace/website/*" in
  // App.jsx, so useParams()['*'] gives us the sub-path, e.g.:
  //   "stores"             → list view
  //   "stores/<mongoId>"   → manage view for that store
  const params = useParams();
  const subPath = params['*'] || '';

  // Derive the active tab and (optionally) the store ID from the URL.
  const urlSegments = subPath.split('/').filter(Boolean);
  const urlTab = urlSegments[0] || 'overview';
  const urlStoreId = urlTab === 'stores' && urlSegments[1] ? urlSegments[1] : null;

  const [activeTab, setActiveTab] = useState(urlTab);

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid size={16} /> },
    { id: 'funnels', label: 'Funnels', icon: <LayoutTemplate size={16} /> },
    { id: 'websites', label: 'Websites', icon: <Globe size={16} /> },
    { id: 'stores', label: 'Stores', icon: <Store size={16} /> },
    { id: 'forms', label: 'Forms', icon: <FileText size={16} /> },
    { id: 'blogs', label: 'Blogs', icon: <LayoutTemplate size={16} /> },
    { id: 'qr-links', label: 'QR Links', icon: <QrCode size={16} /> },
    { id: 'chat-widgets', label: 'Chat Widgets', icon: <MessageCircle size={16} /> },
    { id: 'domains', label: 'Domains', icon: <Link2 size={16} /> },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'funnels': return <FunnelsTab itemVariants={itemVariants} />;
      case 'websites': return <WebsitesTab itemVariants={itemVariants} />;
      case 'stores': return <StoresTab itemVariants={itemVariants} initialStoreId={urlStoreId} />;
      case 'forms': return <FormsTab itemVariants={itemVariants} />;
      case 'blogs': return <BlogsTab itemVariants={itemVariants} />;
      case 'qr-links': return <QRLinksTab itemVariants={itemVariants} />;
      case 'chat-widgets': return <ChatWidgetsTab itemVariants={itemVariants} />;
      case 'domains': return <DomainsTab itemVariants={itemVariants} />;
      case 'overview':
      default:
        return (
          <motion.div variants={itemVariants}>
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
                        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
                        style={{
                          borderRadius: 12,
                          height: '100%',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-sm)',
                          overflow: 'hidden',
                        }}
                      >
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

            <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
              <Col xs={24} lg={8}>
                <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                  <Card style={{ borderRadius: 16, border: '2px solid var(--accent-secondary)', background: 'var(--bg-secondary)', height: '100%', boxShadow: '0 8px 24px rgba(13, 148, 136, 0.08)' }} bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Title level={5} style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontSize: 18 }}><Sparkles size={22} color="var(--accent-secondary)" /> Generate with AI</Title>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20, fontWeight: 500 }}>Describe the website you want. Our AI builds it in under 60 seconds — full pages, copy, layout, and images.</Text>
                    <Input.TextArea rows={4} placeholder="e.g. A luxury real estate landing page for Prestige estates with hero, features, gallery, and lead form..." style={{ borderRadius: 12, marginBottom: 20, fontSize: 14, padding: 12 }} />
                    <Button type="primary" icon={<Sparkles size={18} />} onClick={() => setActiveTab('websites')} style={{ width: '100%', borderRadius: 12, background: 'var(--accent-secondary)', height: 48, marginTop: 'auto', fontWeight: 700, fontSize: 15, border: 'none', boxShadow: 'var(--shadow-md)' }}>Generate Site</Button>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} lg={8}>
                <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                  <Card className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Title level={5} style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)', fontSize: 18 }}><LayoutTemplate size={22} color="var(--accent-info)" /> Start from a Template</Title>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24, fontWeight: 500 }}>100+ professionally designed templates. Filter by industry and customize everything.</Text>
                    
                    <div style={{ height: 160, border: '2px dashed var(--border-color)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24, background: 'rgba(59, 130, 246, 0.05)', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }} onClick={() => setActiveTab('websites')}>
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
                    
                    <div style={{ height: 160, border: '2px dashed var(--border-color)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24, background: 'rgba(245, 158, 11, 0.05)', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }} onClick={() => setActiveTab('websites')}>
                      <Button type="link" style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-warning)' }}>Import Site →</Button>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            <motion.div variants={itemVariants}>
                <Card
                  title={<div style={{ paddingTop: 8 }}><Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</Title><Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Changes across all sites — last 7 days</Text></div>}
                  extra={<Button type="link" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-secondary)' }}>View Full History →</Button>}
                  className="glassmorphism"
                  style={{ borderRadius: 16, marginBottom: 40, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                  styles={{ body: { padding: 24 } }}
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
          </motion.div>
        );
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 900 }}>Websites</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Build, launch, and optimize every client website — AI-powered, drag-and-drop, with funnels, forms, and domain management built in.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button icon={<LayoutGrid size={16} />} style={{ borderRadius: 8, height: 44, background: 'var(--accent-secondary)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 700, padding: '0 24px' }}>Open Site Builder</Button>
          <Button icon={<ExternalLink size={16} />} style={{ borderRadius: 8, height: 44, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 700, padding: '0 24px' }}>View Live Site</Button>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-color)', marginBottom: 32, overflowX: 'auto', paddingBottom: 0 }}>
        {tabs.map((tab) => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '12px 16px', 
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '3px solid var(--accent-primary)' : '3px solid transparent', 
              fontWeight: activeTab === tab.id ? 800 : 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              cursor: 'pointer', 
              whiteSpace: 'nowrap',
              marginBottom: -1,
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </motion.div>

      {/* Tab Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -10 }}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.2, staggerChildren: 0.05 } }
          }}
        >
          {renderActiveTab()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default WebsiteBuilder;
