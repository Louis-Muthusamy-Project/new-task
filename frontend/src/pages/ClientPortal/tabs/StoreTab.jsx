import React from 'react';
import { Typography, Row, Col, Button, Tag } from 'antd';
import { motion } from 'framer-motion';
import { Sparkles, Check, Search, BarChart2, Briefcase, ArrowRight } from 'lucide-react';
import BubbleCard from '../../../components/BubbleCard';

const { Title, Text } = Typography;

const StoreTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const services = [
    {
      title: 'SEO Starter Package',
      price: '₹25,000/mo',
      desc: 'Perfect for businesses starting their SEO journey. Includes technical audit, 10 keyword optimisations, monthly report.',
      features: ['Technical SEO audit', '10 target keywords', 'Monthly ranking report', '2 blog posts/month'],
      icon: <Search size={20} color="var(--accent-primary)" />,
      current: false
    },
    {
      title: 'Ads Management — Starter',
      price: '₹35,000/mo + 10% ad spend',
      desc: 'Google + Meta campaign management with weekly reporting.',
      features: ['Google Ads setup & management', 'Meta Ads management', 'Weekly performance reports', 'A/B testing (2 creatives/mo)'],
      icon: <BarChart2 size={20} color="var(--accent-primary)" />,
      current: false
    },
    {
      title: 'Full-Service Marketing Retainer',
      price: '₹1,20,000/mo',
      desc: 'Complete marketing management: SEO, Ads, Social, Content.',
      features: ['All of the above', 'Social media (4 platforms)', 'Content calendar', 'Monthly strategy call'],
      icon: <Briefcase size={20} color="var(--accent-primary)" />,
      current: true
    }
  ];

  const reports = [
    {
      title: 'Competitor Intelligence Report',
      desc: "Detailed analysis of your top 3 competitors' digital strategy",
      price: '₹5,999'
    },
    {
      title: 'Market Opportunity Report',
      desc: 'Bangalore real estate digital market landscape 2026',
      price: '₹8,999'
    },
    {
      title: 'Custom SEO Audit',
      desc: 'Deep-dive technical + content SEO audit for your website',
      price: '₹4,999'
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Services & Upgrades</Title>
        <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Powered by BCC Martech — add more to your marketing</Text>
      </motion.div>

      {/* Recommended Section */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <div style={{ background: 'rgba(13, 148, 136, 0.05)', border: '1px solid rgba(13, 148, 136, 0.2)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'var(--accent-primary)', color: '#fff', padding: 8, borderRadius: 12, height: 'fit-content' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <Text style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: 1, display: 'block', marginBottom: 4 }}>RECOMMENDED FOR YOU</Text>
              <Text style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Based on your <strong style={{ color: 'var(--text-primary)' }}>MOS Score (84/100)</strong>, here's what can push you to 90+:</Text>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Add GEO Optimisation Service</Text>
              <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Est. <span style={{ color: 'var(--accent-primary)' }}>+8 MOS pts</span> · ₹15,000/mo
              </Text>
            </div>
            <Button type="link" style={{ fontWeight: 700, color: 'var(--accent-secondary)', fontSize: 15 }}>Learn More <ArrowRight size={16} style={{ marginLeft: 8 }} /></Button>
          </div>
        </div>
      </motion.div>

      {/* Available Services */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Available Services</Title>
        <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24, fontWeight: 500 }}>Browse and request services from your agency team</Text>
        
        <Row gutter={[24, 24]}>
          {services.map((service, idx) => (
            <Col xs={24} lg={8} key={idx}>
              <BubbleCard bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', height: '100%' }} style={{ height: '100%', borderColor: service.current ? 'var(--accent-primary)' : 'var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: 12, borderRadius: 12 }}>
                    {service.icon}
                  </div>
                  <Tag style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', border: 'none', borderRadius: 12, fontWeight: 800, padding: '4px 12px', fontSize: 12, margin: 0 }}>
                    {service.price}
                  </Tag>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                  <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)' }}>Available</Text>
                  {service.current && (
                    <Tag style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: 'none', borderRadius: 12, fontWeight: 700, padding: '2px 8px', fontSize: 11, marginLeft: 'auto', margin: 0 }}>
                      Currently on this ✓
                    </Tag>
                  )}
                </div>
                
                <Title level={5} style={{ margin: '0 0 12px 0', fontWeight: 800, fontSize: 18 }}>{service.title}</Title>
                <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 24, minHeight: 44 }}>{service.desc}</Text>
                
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, marginBottom: 32, flex: 1 }}>
                  {service.features.map((feat, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <Check size={16} color="var(--accent-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{feat}</Text>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  block 
                  style={{ 
                    height: 44, 
                    borderRadius: 8, 
                    fontWeight: 700,
                    background: service.current ? 'rgba(13, 148, 136, 0.1)' : 'var(--accent-secondary)',
                    color: service.current ? 'var(--accent-secondary)' : '#fff',
                    border: 'none'
                  }}
                >
                  {service.current ? 'Current Plan' : 'Purchase'}
                </Button>
              </BubbleCard>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Reports for Purchase */}
      <motion.div variants={itemVariants}>
        <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Reports for Purchase</Title>
        <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24, fontWeight: 500 }}>One-time deliverables you can order anytime</Text>
        
        <Row gutter={[24, 24]}>
          {reports.map((report, idx) => (
            <Col xs={24} lg={8} key={idx}>
              <BubbleCard bodyStyle={{ padding: 24 }}>
                <Title level={5} style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: 16 }}>{report.title}</Title>
                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 24, minHeight: 40 }}>{report.desc}</Text>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Text style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{report.price}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 1 }}>ONE-TIME</Text>
                </div>
                
                <Button 
                  block 
                  style={{ 
                    height: 40, 
                    borderRadius: 8, 
                    fontWeight: 700,
                    background: 'var(--accent-secondary)',
                    color: '#fff',
                    border: 'none'
                  }}
                >
                  Purchase
                </Button>
              </BubbleCard>
            </Col>
          ))}
        </Row>
      </motion.div>

    </motion.div>
  );
};

export default StoreTab;
