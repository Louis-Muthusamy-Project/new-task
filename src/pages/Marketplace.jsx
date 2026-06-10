import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Tabs, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Search, BarChart2, FileText, CheckCircle2, Edit2, Eye, EyeOff, Plus, Play, Shield, Activity, Mail, FileCheck } from 'lucide-react';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('all');

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

  const stats = [
    { label: 'PRODUCTS LISTED', value: '12', sub: 'Active across all categories', color: 'var(--text-primary)' },
    { label: 'REVENUE THIS MONTH', value: '₹1,84,000', sub: '+12%', subColor: 'var(--accent-primary)', color: 'var(--text-primary)' },
    { label: 'ORDERS THIS MONTH', value: '8', sub: '+3', subColor: 'var(--accent-primary)', color: 'var(--text-primary)' },
    { label: 'ACTIVE SUBSCRIPTIONS', value: '3', sub: 'Recurring revenue', color: 'var(--text-primary)' },
  ];

  const servicePackages = [
    {
      id: 1,
      title: 'SEO Starter Package',
      price: '₹25,000/mo',
      icon: <Search size={24} color="var(--accent-primary)" />,
      desc: 'Perfect for businesses starting their SEO journey. Includes technical audit, 10 keyword optimisations, monthly report.',
      bullets: ['Technical SEO audit', '10 target keywords', 'Monthly ranking report', '2 blog posts/month'],
      status: 'Active — Visible to clients',
      activeClients: 3
    },
    {
      id: 2,
      title: 'Ads Management — Starter',
      price: '₹35,000/mo + 10% ad spend',
      icon: <BarChart2 size={24} color="var(--accent-info)" />,
      desc: 'Google + Meta campaign management with weekly reporting.',
      bullets: ['Google Ads setup & management', 'Meta Ads management', 'Weekly performance reports', 'A/B testing (2 creatives/mo)'],
      status: 'Active — Visible to clients',
      activeClients: 5
    },
    {
      id: 3,
      title: 'Full-Service Marketing Retainer',
      price: '₹1,20,000/mo',
      icon: <FileText size={24} color="var(--accent-secondary)" />,
      desc: 'Complete marketing management: SEO, Ads, Social, Content.',
      bullets: ['All of the above', 'Social media (4 platforms)', 'Content calendar', 'Monthly strategy call'],
      status: 'Active — Visible to clients',
      activeClients: 8
    }
  ];

  const templates = [
    { icon: <Search size={16} />, title: 'Real Estate Lead Gen Funnel', price: '₹4,999', purchases: '642', rating: '4.9', tag: 'Funnel' },
    { icon: <FileText size={16} />, title: 'Agency Report Template — Premium', price: '₹2,999', purchases: '1,240', rating: '4.8', tag: 'Template' },
    { icon: <CheckCircle2 size={16} />, title: 'Site Visit Booking Form Pack', price: '₹1,999', purchases: '680', rating: '4.7', tag: 'Form' },
    { icon: <Play size={16} />, title: 'Real Estate Social Media Pack (30 posts)', price: '₹3,499', purchases: '420', rating: '4.9', tag: 'Social' },
    { icon: <Mail size={16} />, title: 'Real Estate Email Nurture Sequence', price: '₹2,499', purchases: '380', rating: '4.8', tag: 'Email' },
    { icon: <Activity size={16} />, title: '90-Day Marketing Playbook Template', price: '₹9,999', purchases: '284', rating: '4.9', tag: 'Strategy' },
  ];

  const addons = [
    { icon: <Shield size={28} color="var(--accent-info)" />, bg: 'rgba(59, 130, 246, 0.1)', title: 'AI Agent Pack (3 extra agents)', price: '₹4,999/mo', desc: 'Churn Predictor • Competitor Monitor • Lead Scorer' },
    { icon: <Globe size={28} color="var(--accent-primary)" />, bg: 'rgba(16, 185, 129, 0.1)', title: 'White-Label Portal', price: '₹2,999/mo per client', desc: 'Custom domain • Full branding per client' },
    { icon: <BarChart2 size={28} color="var(--accent-warning)" />, bg: 'rgba(245, 158, 11, 0.1)', title: 'Advanced Analytics', price: '₹3,999/mo', desc: 'Attribution modelling • Predictive analytics • Custom dashboards' },
  ];

  // Helper for Globe icon
  function Globe({ size, color }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
  }

  // Retail Tag Card Component
  const RetailTagCard = ({ children, style, bodyStyle }) => (
    <Card 
      className="glassmorphism" 
      bodyStyle={{ padding: '32px 24px', ...bodyStyle }} 
      style={{ 
        borderRadius: '32px 32px 12px 12px', 
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        background: 'var(--bg-secondary)',
        position: 'relative',
        ...style 
      }}
    >
      {/* The Hole Punch */}
      <div style={{ 
        position: 'absolute', 
        top: 12, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: 14, 
        height: 14, 
        borderRadius: '50%', 
        background: 'var(--bg-primary)', 
        border: '1px solid var(--border-color)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }} />
      {children}
    </Card>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5 }}>MARKETPLACE</Text>
        <Title level={2} style={{ margin: '4px 0 8px 0', fontWeight: 800 }}>Marketplace</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Text type="secondary" style={{ fontWeight: 500 }}>Expand your revenue — sell services, tools, and templates to your clients.</Text>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="primary" style={{ background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-sm)', height: 40, padding: '0 24px' }}>Agency View ✓</Button>
            <Button style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 40 }}>Preview as Client</Button>
          </div>
        </div>
      </motion.div>

      {/* Retail Price Tag Top KPIs */}
      <motion.div variants={itemVariants}>
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          {stats.map((stat, idx) => (
            <Col xs={24} sm={12} lg={6} key={idx}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
                <RetailTagCard style={{ height: '100%', paddingTop: 16 }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, display: 'block', marginBottom: 12, textAlign: 'center' }}>{stat.label}</Text>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: 1, color: stat.color, fontWeight: 800 }}>{stat.value}</Title>
                    {stat.subColor && <span style={{ color: stat.subColor, fontWeight: 700, fontSize: 15 }}>{stat.sub}</span>}
                  </div>
                  {!stat.subColor && <Text type="secondary" style={{ fontSize: 13, textAlign: 'center', display: 'block', fontWeight: 500 }}>{stat.sub}</Text>}
                </RetailTagCard>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultActiveKey="all" style={{ marginBottom: 40 }} size="large">
          <TabPane tab={<strong style={{ fontWeight: 600 }}>All</strong>} key="all" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Services</strong>} key="services" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Templates</strong>} key="templates" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Tools & Addons</strong>} key="tools" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Reports</strong>} key="reports" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Training</strong>} key="training" />
        </Tabs>
      </motion.div>

      {/* Service Packages */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Your Service Packages</Title>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Sell structured packages directly to clients from their portal</Text>
          </div>
          <Button type="primary" icon={<Plus size={16}/>} style={{ background: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 700, border: 'none', height: 40, boxShadow: 'var(--shadow-md)' }}>Add Service Package</Button>
        </div>

        <Row gutter={[24, 32]}>
          {servicePackages.map(pkg => (
            <Col xs={24} lg={8} key={pkg.id}>
              <RetailTagCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    {pkg.icon}
                  </div>
                  <Tag style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 12, fontWeight: 800, padding: '4px 12px', fontSize: 13 }}>{pkg.price}</Tag>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 8px var(--accent-primary)' }}></div>
                  {pkg.status}
                </div>
                
                <Title level={4} style={{ margin: '0 0 12px 0', fontWeight: 800, color: 'var(--text-primary)' }}>{pkg.title}</Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, display: 'block', minHeight: 48, fontWeight: 500, lineHeight: 1.6 }}>{pkg.desc}</Text>

                <ul style={{ margin: '0 0 32px 0', padding: 0, listStyle: 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pkg.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                      <CheckCircle2 size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <Text style={{ fontSize: 13, color: 'var(--accent-secondary)', fontWeight: 700, display: 'block', marginBottom: 20 }}>{pkg.activeClients} active clients</Text>

                <div style={{ display: 'flex', borderTop: '2px dashed var(--border-color)', paddingTop: 20, margin: '0 -12px' }}>
                  <Button type="text" icon={<Edit2 size={16}/>} style={{ flex: 1, display: 'flex', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Edit</Button>
                  <Button type="text" icon={<Eye size={16}/>} style={{ flex: 1, display: 'flex', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Preview</Button>
                  <Button type="text" icon={<EyeOff size={16}/>} style={{ flex: 1, display: 'flex', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Unpublish</Button>
                </div>
              </RetailTagCard>
            </Col>
          ))}
          
          <Col xs={24} lg={8}>
            <RetailTagCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: 16, borderRadius: 16, color: 'var(--text-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <FileCheck size={24} />
                  </div>
                  <Tag style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 12, fontWeight: 800, padding: '4px 12px', fontSize: 13 }}>₹8,000 one-time</Tag>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-tertiary)' }}></div>
                  Draft
                </div>
                
                <Title level={4} style={{ margin: '0 0 12px 0', fontWeight: 800, color: 'var(--text-primary)', opacity: 0.8 }}>Complete Website Audit Report</Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, display: 'block', minHeight: 48, fontWeight: 500, lineHeight: 1.6 }}>One-time purchase. Delivered in 3 days.</Text>

                <ul style={{ margin: '0 0 32px 0', padding: 0, listStyle: 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}><CheckCircle2 size={18} color="var(--accent-primary)" /> Technical SEO audit</li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}><CheckCircle2 size={18} color="var(--accent-primary)" /> Content gap analysis</li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}><CheckCircle2 size={18} color="var(--accent-primary)" /> Competitor benchmarking</li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}><CheckCircle2 size={18} color="var(--accent-primary)" /> Action plan & priorities</li>
                </ul>

                <Text style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 700, display: 'block', marginBottom: 20 }}>0 active clients</Text>

                <div style={{ display: 'flex', gap: 16, borderTop: '2px dashed var(--border-color)', paddingTop: 24, margin: '0 -12px' }}>
                  <Button type="primary" style={{ background: 'var(--accent-secondary)', borderRadius: 8, fontWeight: 700, flex: 1, height: 40, border: 'none' }}>Publish</Button>
                  <Button icon={<Edit2 size={16}/>} style={{ borderRadius: 8, fontWeight: 600, flex: 1, height: 40, borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Edit</Button>
                </div>
            </RetailTagCard>
          </Col>
          
          <Col xs={24} lg={8}>
            <div className="hover-bg" style={{ border: '3px dashed var(--border-color)', borderRadius: 32, height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
              <Plus size={40} style={{ marginBottom: 16, color: 'var(--text-tertiary)' }} />
              <Text style={{ fontSize: 16, fontWeight: 700, color: 'inherit' }}>Add Service Package</Text>
            </div>
          </Col>

        </Row>
      </motion.div>

      {/* Templates */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'var(--text-primary)' }}>M1 Templates Marketplace</Title>
        <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 32 }}>Premium templates created by the M1 community</Text>
        
        <Row gutter={[24, 24]}>
          {templates.map((tpl, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: 10, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    {tpl.icon}
                  </div>
                  <Tag style={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', margin: 0, fontWeight: 600, padding: '4px 12px' }}>{tpl.tag}</Tag>
                </div>
                <Text style={{ fontWeight: 700, fontSize: 15, display: 'block', marginBottom: 12, color: 'var(--text-primary)' }}>{tpl.title}</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>{tpl.price}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{tpl.purchases} purchases</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--accent-warning)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ★ {tpl.rating}
                  </div>
                </div>
                <Button block style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-tertiary)', height: 40 }}>Get Template</Button>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Addons */}
      <motion.div variants={itemVariants}>
        <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800, color: 'var(--text-primary)' }}>Power Addons for M1</Title>
        <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 32 }}>Extend your M1 platform with premium features</Text>
        
        <Row gutter={[24, 24]}>
          {addons.map((addon, i) => (
            <Col xs={24} lg={8} key={i}>
              <Card className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ background: addon.bg, padding: 16, borderRadius: 16, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
                  {addon.icon}
                </div>
                <Text style={{ fontWeight: 800, fontSize: 18, display: 'block', color: 'var(--text-primary)', marginBottom: 8 }}>{addon.title}</Text>
                <Text style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent-primary)', display: 'block', marginBottom: 12 }}>{addon.price}</Text>
                <Text type="secondary" style={{ fontSize: 14, marginBottom: 32, flex: 1, display: 'block', fontWeight: 500, lineHeight: 1.6 }}>{addon.desc}</Text>
                <Button type="primary" block style={{ background: 'var(--accent-primary)', borderRadius: 8, fontWeight: 700, border: 'none', height: 40 }}>Activate Addon</Button>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>

    </motion.div>
  );
};

export default Marketplace;
