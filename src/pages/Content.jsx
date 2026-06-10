import React, { useState } from 'react';
import { Typography, Row, Col, Card, Button, Input, Select, Tag, Slider, Checkbox } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Plus, AlertCircle, FileText, Smartphone, Megaphone, Mail, Monitor, Edit3, Video, MessageCircle, Sparkles, Copy, Save, RefreshCw, CheckCircle2, ChevronRight, PenTool } from 'lucide-react';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Content = () => {
  const [activeType, setActiveType] = useState('social');
  
  const contentTypes = [
    { id: 'blog', title: 'Blog Post', desc: 'Long-form, SEO-optimised', icon: <FileText size={20} color="var(--accent-warning)" /> },
    { id: 'social', title: 'Social Media Post', desc: 'Instagram / LinkedIn / Twitter', icon: <Smartphone size={20} color="var(--accent-secondary)" /> },
    { id: 'ad', title: 'Ad Copy', desc: 'Google Ads / Meta Ads', icon: <Megaphone size={20} color="var(--accent-danger)" /> },
    { id: 'email', title: 'Email', desc: 'Newsletter / Campaign', icon: <Mail size={20} color="var(--accent-primary)" /> },
    { id: 'landing', title: 'Landing Page Copy', desc: 'Hero, features, CTA', icon: <Monitor size={20} color="#8b5cf6" /> },
    { id: 'brief', title: 'Content Brief', desc: 'Brief for your writers', icon: <Edit3 size={20} color="var(--text-secondary)" /> },
    { id: 'video', title: 'Video Script', desc: 'YouTube / Reel script', icon: <Video size={20} color="#ec4899" /> },
    { id: 'whatsapp', title: 'WhatsApp Message', desc: 'Sales / Follow-up', icon: <MessageCircle size={20} color="var(--accent-info)" /> },
  ];

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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>PILLAR 02 · EXECUTION</Text>
          <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Content Marketing</Title>
          <Text type="secondary">Plan, produce, approve, and ship every content piece across channels.</Text>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select defaultValue="Prestige Estates" style={{ width: 200, fontWeight: 600 }} size="large"><Select.Option value="Prestige Estates">Prestige Estates</Select.Option></Select>
          <Button icon={<Download size={16} />} style={{ borderRadius: 8, height: 40, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', fontWeight: 600 }}>Export</Button>
          <Button type="primary" icon={<Plus size={16} />} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>New Content</Button>
        </div>
      </motion.div>

      {/* NEW GRADIENT STROKE CARDS WITH FLOATING BADGE */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24, paddingTop: 16 }}>
        {[
          { label: 'PUBLISHED THIS MONTH', val: '8', sub: 'Pieces shipped', colorStart: '#3b82f6', colorEnd: '#10b981', icon: <CheckCircle2 size={20}/> },
          { label: 'IN REVIEW / PENDING', val: '4', sub: 'Awaiting approval', colorStart: '#f59e0b', colorEnd: '#ef4444', icon: <AlertCircle size={20}/> },
          { label: 'SCHEDULED', val: '6', sub: 'Queued for go-live', colorStart: '#8b5cf6', colorEnd: '#3b82f6', icon: <PenTool size={20}/> },
          { label: 'TOTAL PIPELINE', val: '24', sub: 'All statuses', colorStart: '#0d9488', colorEnd: '#0ea5e9', icon: <FileText size={20}/> }
        ].map((kpi, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={{ height: '100%' }}>
              <div style={{ position: 'relative', height: '100%', paddingTop: 20 }}>
                {/* Floating Badge */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 24, 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${kpi.colorStart}, ${kpi.colorEnd})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 2
                }}>
                  {kpi.icon}
                </div>
                
                {/* Gradient Border Card Wrapper */}
                <div style={{ 
                  padding: 2, 
                  borderRadius: 16, 
                  background: `linear-gradient(135deg, ${kpi.colorStart}, transparent, transparent, ${kpi.colorEnd})`,
                  height: 'calc(100% - 20px)'
                }}>
                  <Card 
                    bodyStyle={{ padding: '28px 20px 20px', height: '100%', display: 'flex', flexDirection: 'column' }} 
                    style={{ 
                      borderRadius: 14, 
                      height: '100%',
                      background: 'var(--bg-primary)',
                      border: 'none',
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{kpi.label}</Text>
                    <Title level={2} style={{ margin: '8px 0 4px', color: 'var(--text-primary)', fontSize: 36, fontWeight: 800 }}>{kpi.val}</Title>
                    <Text style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginTop: 'auto' }}>{kpi.sub}</Text>
                  </Card>
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <motion.div variants={itemVariants}>
        <div style={{ 
          background: 'rgba(245, 158, 11, 0.05)', 
          border: '1px solid rgba(245, 158, 11, 0.2)', 
          padding: 20, 
          borderRadius: 16, 
          marginBottom: 24, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', color: 'var(--accent-warning)' }}>
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <AlertCircle size={24} style={{ marginTop: 2 }} />
            </motion.div>
            <span>
              <strong style={{ fontSize: 15, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>3 content pieces need client approval — Prestige Estates</strong>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Oldest waiting 4 days. Send a nudge to keep launches on track.</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button type="primary" style={{ background: 'var(--accent-warning)', border: 'none', color: '#fff', borderRadius: 8, fontWeight: 600 }}>Send Reminder</Button>
            <Button style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', borderRadius: 8, background: 'var(--bg-secondary)', fontWeight: 600 }}>View All</Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', marginBottom: 24, overflowX: 'auto', paddingBottom: 2 }}>
          <div style={{ paddingBottom: 12, borderBottom: '2px solid var(--accent-secondary)', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', whiteSpace: 'nowrap' }}>AI Studio</div>
          <div style={{ paddingBottom: 12, color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Trends</div>
          <div style={{ paddingBottom: 12, color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>List View</div>
          <div style={{ paddingBottom: 12, color: 'var(--text-secondary)', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Calendar View</div>
        </div>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card className="glassmorphism" style={{ borderRadius: 16, height: '100%', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 24 }}>
              <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>What do you want to create?</Title>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Sparkles size={14} color="var(--accent-secondary)"/> Routed through Lovable AI (Gemini 1.5 Pro). Server-side, no key needed.
              </Text>
              
              <Row gutter={[12, 12]} style={{ marginTop: 20, marginBottom: 24 }}>
                {contentTypes.map(type => (
                  <Col xs={12} sm={8} lg={6} key={type.id}>
                    <motion.div 
                      whileHover={{ scale: activeType === type.id ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveType(type.id)}
                      style={{ 
                        border: activeType === type.id ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)', 
                        background: activeType === type.id ? 'var(--bg-secondary)' : 'var(--bg-primary)', 
                        padding: 16, 
                        borderRadius: 12, 
                        cursor: 'pointer',
                        height: '100%',
                        position: 'relative',
                        boxShadow: activeType === type.id ? '0 0 15px rgba(13, 148, 136, 0.15)' : 'var(--shadow-sm)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {activeType === type.id && (
                        <div style={{ position: 'absolute', top: 8, right: 8, color: 'var(--accent-secondary)' }}>
                          <CheckCircle2 size={16} fill="var(--accent-secondary)" color="var(--bg-primary)" />
                        </div>
                      )}
                      <div style={{ marginBottom: 12 }}>{type.icon}</div>
                      <strong style={{ display: 'block', fontSize: 13, marginBottom: 4, color: activeType === type.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{type.title}</strong>
                      <Text type="secondary" style={{ fontSize: 11 }}>{type.desc}</Text>
                    </motion.div>
                  </Col>
                ))}
              </Row>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>PLATFORM</Text>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Instagram', 'LinkedIn', 'Twitter/X', 'Facebook'].map(p => (
                      <Tag key={p} style={{ padding: '6px 16px', borderRadius: 20, cursor: 'pointer', background: p === 'Instagram' ? 'var(--accent-secondary)' : 'var(--bg-primary)', color: p === 'Instagram' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: `1px solid ${p === 'Instagram' ? 'var(--accent-secondary)' : 'var(--border-color)'}`, fontWeight: 600, fontSize: 13 }}>{p}</Tag>
                    ))}
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>TOPIC</Text>
                  <Input defaultValue="New project launch — Prestige Whitefield" style={{ borderRadius: 8, padding: '8px 12px', fontSize: 14 }} />
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>TONE</Text>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Professional', 'Casual', 'Excited', 'Inspiring'].map(p => (
                      <Tag key={p} style={{ padding: '6px 16px', borderRadius: 20, cursor: 'pointer', background: p === 'Professional' ? 'var(--accent-secondary)' : 'var(--bg-primary)', color: p === 'Professional' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: `1px solid ${p === 'Professional' ? 'var(--accent-secondary)' : 'var(--border-color)'}`, fontWeight: 600, fontSize: 13 }}>{p}</Tag>
                    ))}
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>BRAND VOICE</Text>
                  <Input defaultValue="Premium, aspirational, trustworthy" style={{ borderRadius: 8, padding: '8px 12px', fontSize: 14 }} />
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>KEY MESSAGE</Text>
                  <TextArea rows={3} placeholder="The one thing readers should take away" style={{ borderRadius: 8, padding: '8px 12px', fontSize: 14 }} />
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 12 }}>INCLUDE</Text>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <Checkbox defaultChecked style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Hashtags</Checkbox>
                    <Checkbox defaultChecked style={{ color: 'var(--text-primary)', fontWeight: 500 }}>CTA</Checkbox>
                    <Checkbox style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Emojis</Checkbox>
                    <Checkbox style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Mention @brand</Checkbox>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>CHARACTER LIMIT</Text>
                    <Text strong style={{ color: 'var(--accent-secondary)' }}>280</Text>
                  </div>
                  <Slider defaultValue={280} max={2200} trackStyle={{ background: 'var(--accent-secondary)' }} handleStyle={{ borderColor: 'var(--accent-secondary)' }} />
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, display: 'block', marginBottom: 8 }}>VARIATIONS</Text>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['1', '2', '3'].map(p => (
                      <Tag key={p} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer', background: p === '1' ? 'var(--accent-secondary)' : 'var(--bg-primary)', color: p === '1' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: `1px solid ${p === '1' ? 'var(--accent-secondary)' : 'var(--border-color)'}`, fontWeight: 700, fontSize: 14, margin: 0 }}>{p}</Tag>
                    ))}
                  </div>
                </div>

                <Button type="primary" size="large" icon={<Sparkles size={18} />} style={{ background: 'var(--accent-secondary)', width: '100%', marginTop: 12, height: 50, borderRadius: 12, fontSize: 16, fontWeight: 600, border: 'none', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)' }}>Generate with Lovable AI</Button>
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} xl={10}>
          <motion.div variants={itemVariants} style={{ height: '100%' }}>
            <Card className="glassmorphism" style={{ borderRadius: 16, height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>Generated Content</strong>
                <div style={{ display: 'flex', gap: 16 }}>
                  <a style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><Copy size={14}/> Copy All</a>
                  <a style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><Save size={14}/> Save</a>
                  <a style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><RefreshCw size={14}/> Regenerate</a>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-tertiary)', padding: 40, minHeight: 400 }}>
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }}>
                  <Sparkles size={48} style={{ marginBottom: 20, color: 'var(--accent-secondary)', opacity: 0.5 }} />
                </motion.div>
                <Text type="secondary" style={{ fontSize: 15 }}>Fill in the brief and hit <strong style={{ color: 'var(--text-primary)' }}>Generate</strong> to see real AI output here.</Text>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div variants={itemVariants} style={{ marginTop: 40, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Recently Generated</Title>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Content created with AI Studio — last 30 days</Text>
        </div>
        <Button type="link" style={{ color: 'var(--accent-secondary)', fontSize: 14, fontWeight: 600, padding: 0 }}>View All in Content →</Button>
      </motion.div>
      
      <Row gutter={[16, 16]}>
        {[
          { title: 'Whitefield launch hook', tags: ['Social', 'Prestige Estates', 'Today'] },
          { title: 'NRI investor blog outline', tags: ['Blog', 'Prestige Estates', 'Yesterday'] },
          { title: 'Summer RSA variants', tags: ['Ad Copy', 'Prestige Estates', '2d ago'] },
        ].map((item, i) => (
          <Col xs={24} lg={8} key={i}>
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <Card 
                bodyStyle={{ padding: '20px' }} 
                style={{ 
                  borderRadius: 16, 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <strong style={{ display: 'block', marginBottom: 16, fontSize: 15, color: 'var(--text-primary)' }}>{item.title}</strong>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {item.tags.map(t => <Tag key={t} style={{ borderRadius: 12, border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: 12, padding: '2px 10px', fontWeight: 500, margin: 0 }}>{t}</Tag>)}
                </div>
                <Button block style={{ height: 40, borderRadius: 8, fontWeight: 600, color: 'var(--text-primary)', borderColor: 'var(--border-color)' }} icon={<CheckCircle2 size={16} />}>Use Template</Button>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

    </motion.div>
  );
};

export default Content;
