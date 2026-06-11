import React from 'react';
import { Typography, Row, Col, Card } from 'antd';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const { Title, Text } = Typography;

const BrandGuidelinesTab = ({ itemVariants }) => {
  const colors = [
    { name: 'Primary · Navy', hex: '#0D1B2A', usage: 'Headers, footers, backgrounds', bg: '#0D1B2A', text: '#fff' },
    { name: 'Secondary · Teal', hex: '#0D7A75', usage: 'CTAs, highlights, links', bg: '#0D7A75', text: '#fff' },
    { name: 'Accent · Gold', hex: '#E6A02B', usage: 'Premium accents, icons', bg: '#E6A02B', text: '#fff' },
    { name: 'Text · Ink', hex: '#1A2744', usage: 'Body text', bg: '#1A2744', text: '#fff' },
    { name: 'Light · Off-white', hex: '#F8FAFC', usage: 'Backgrounds', bg: '#F8FAFC', text: '#000', border: '1px solid var(--border-color)' }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <strong style={{ fontSize: 16, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Brand Guidelines — Prestige Estates</strong>
        <Text type="secondary" style={{ fontSize: 13 }}>Live guidelines used by the design team</Text>
      </motion.div>

      {/* Colours */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Colours</strong>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>Brand palette with intended usage</Text>
        
        <Row gutter={[16, 16]}>
          {colors.map((c, i) => (
            <Col xs={24} sm={12} lg={8} xl={4} key={i}>
              <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, overflow: 'hidden', border: c.border || 'none', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ height: 100, background: c.bg }} />
                <div style={{ padding: 16, background: 'var(--bg-secondary)' }}>
                  <strong style={{ display: 'block', fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</strong>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>{c.hex}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{c.usage}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Typography */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Typography</strong>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>Type system</Text>

        <Card style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ marginBottom: 32 }}>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 16 }}>INTER (PRIMARY)</Text>
            <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Luxury Living, Redefined</Title>
            <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Discover Prestige Estates</Title>
            <Text type="secondary" style={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>Lorem ipsum body text sample here.</Text>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 32 }}>
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 16 }}>CAMBRIA (DISPLAY — FOR PRINT)</Text>
            <h1 style={{ margin: 0, fontSize: 32, fontFamily: 'Cambria, serif', fontWeight: 400, color: 'var(--text-primary)' }}>Prestige Estates</h1>
          </div>
        </Card>
      </motion.div>

      {/* Logo Usage */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 16 }}>Logo Usage</strong>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <div style={{ background: '#0D1B2A', height: 160, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <strong style={{ fontSize: 32, color: '#fff' }}>PE</strong>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ background: '#fff', height: 160, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: 32, color: '#0D1B2A' }}>PE</strong>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ background: '#F8FAFC', height: 160, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: 32, color: '#0D1B2A' }}>PE</strong>
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 16, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#10b981', fontWeight: 700, marginBottom: 16 }}>
                <div style={{ background: '#10b981', color: '#fff', borderRadius: 4, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14}/></div>
                DO
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Maintain min clear space of 1x logo height</li>
                <li>Use approved logo files only</li>
                <li>Use white logo on dark backgrounds</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 16, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#ef4444', fontWeight: 700, marginBottom: 16 }}>
                <div style={{ background: '#ef4444', color: '#fff', borderRadius: 4, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14}/></div>
                DON'T
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Stretch, skew, or recolour the logo</li>
                <li>Place over busy photography without overlay</li>
                <li>Recreate the wordmark in another font</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Tone of Voice */}
      <motion.div variants={itemVariants}>
        <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>Tone of Voice</strong>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>Premium but approachable</Text>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 16, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#10b981', fontWeight: 700, marginBottom: 12 }}>
                <div style={{ background: '#10b981', color: '#fff', borderRadius: 4, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14}/></div>
                DO
              </div>
              <Text style={{ color: 'var(--text-primary)', fontSize: 14 }}>"Discover your dream home in Bangalore's finest address."</Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 16, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#ef4444', fontWeight: 700, marginBottom: 12 }}>
                <div style={{ background: '#ef4444', color: '#fff', borderRadius: 4, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14}/></div>
                DON'T
              </div>
              <Text style={{ color: 'var(--text-primary)', fontSize: 14 }}>"Buy property now!!! Limited time offer!!"</Text>
            </Card>
          </Col>
        </Row>
      </motion.div>

    </motion.div>
  );
};

export default BrandGuidelinesTab;
