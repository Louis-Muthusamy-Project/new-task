import React from 'react';
import { Typography, Row, Col, Input, Button, Tag, Select, Upload, Checkbox } from 'antd';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, PhoneCall, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import BubbleCard from '../../components/BubbleCard';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const SupportTab = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1400, margin: '0 auto' }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 800 }}>Support</Title>
        <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Raise a request, track your tickets, or contact your team directly.</Text>
      </motion.div>

      {/* Account Manager Card */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <BubbleCard bodyStyle={{ padding: 40, background: 'rgba(13, 148, 136, 0.03)' }} style={{ borderColor: 'rgba(13, 148, 136, 0.2)' }}>
          <Row gutter={48}>
            <Col xs={24} md={16}>
              <Text style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: 1, display: 'block', marginBottom: 16 }}>YOUR DEDICATED ACCOUNT MANAGER</Text>
              <Title level={3} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Arjun Sharma</Title>
              <Text style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Senior SEO Lead & Account Manager</Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-secondary)', display: 'block', marginBottom: 16 }}>BCC Martech</Text>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Arjun is online — typically replies in under 2 hours</Text>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <Button type="primary" icon={<MessageCircle size={16} />} style={{ background: 'var(--accent-primary)', fontWeight: 700, borderRadius: 8, height: 40 }}>WhatsApp</Button>
                <Button icon={<Mail size={16} />} style={{ fontWeight: 600, borderRadius: 8, height: 40, color: 'var(--text-secondary)' }}>Email</Button>
                <Button icon={<PhoneCall size={16} />} style={{ fontWeight: 600, borderRadius: 8, height: 40, color: 'var(--text-secondary)' }}>Book a Call</Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  <AlertCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} /> Response commitment: Within 4 business hours
                </Text>
                <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Critical issues: Within 1 hour</Text>
                <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Current SLA performance: 98% on time ✓</Text>
              </div>
            </Col>

            <Col xs={24} md={8} style={{ borderLeft: '1px solid rgba(13, 148, 136, 0.1)', paddingLeft: 48 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f59e0b', color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                AS
              </div>
              <Text style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: 1, display: 'block', marginBottom: 16 }}>RECENT INTERACTIONS</Text>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 12, display: 'inline-block', marginTop: 2 }}>📊</span>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Jun 5 — <span style={{ color: 'var(--text-secondary)' }}>Monthly report delivered</span></Text>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 12, display: 'inline-block', marginTop: 2 }}>📞</span>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>May 28 — <span style={{ color: 'var(--text-secondary)' }}>Strategy call completed</span></Text>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <CheckCircle2 size={14} color="var(--accent-primary)" style={{ marginTop: 2 }} />
                  <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>May 15 — <span style={{ color: 'var(--text-secondary)' }}>SEO audit reviewed</span></Text>
                </li>
              </ul>
            </Col>
          </Row>
        </BubbleCard>
      </motion.div>

      {/* Raise a Request */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <Title level={4} style={{ margin: '0 0 4px 0', fontWeight: 800 }}>Raise a Request</Title>
        <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 24 }}>For anything that needs attention — we'll respond within SLA</Text>
        
        <BubbleCard bodyStyle={{ padding: 40 }}>
          <Row gutter={32} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Type of request *</Text>
              <Select placeholder="Select request type" style={{ width: '100%' }} size="large" />
            </Col>
            <Col xs={24} md={12}>
              <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Priority *</Text>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button style={{ borderRadius: 8, background: 'var(--bg-secondary)', fontWeight: 600 }}>Normal</Button>
                <Button style={{ borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 600 }}>Urgent</Button>
                <Button style={{ borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 600 }}>Critical</Button>
              </div>
            </Col>
          </Row>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Subject *</Text>
              <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>0/120</Text>
            </div>
            <Input placeholder="Brief description of your request" size="large" style={{ borderRadius: 8 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Details</Text>
              <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)' }}>0/1000</Text>
            </div>
            <TextArea placeholder="Tell us more — the more detail, the faster we can help." rows={4} style={{ borderRadius: 8 }} />
          </div>

          <div style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Attach files</Text>
            <Dragger style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: 12 }}>
              <p className="ant-upload-drag-icon">
                <UploadCloud size={32} color="var(--text-secondary)" />
              </p>
              <p className="ant-upload-text" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Drag files here or click to upload</p>
              <p className="ant-upload-hint" style={{ fontWeight: 500, color: 'var(--text-tertiary)', fontSize: 12 }}>PNG, JPG, PDF, MP4 · Max 10MB each</p>
            </Dragger>
          </div>

          <div style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 12 }}>Notify me via</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Checkbox checked><Text style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Email (rahul.kapoor@prestigeestates.com)</Text></Checkbox>
              <Checkbox><Text style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>WhatsApp (+91 98765 43210)</Text></Checkbox>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
            <Text style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>* Required fields</Text>
            <div style={{ display: 'flex', gap: 16 }}>
              <Button type="text" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Cancel</Button>
              <Button type="primary" style={{ background: 'var(--accent-secondary)', fontWeight: 700, borderRadius: 8, padding: '0 24px' }}>Submit Request</Button>
            </div>
          </div>
        </BubbleCard>
      </motion.div>

      {/* My Open Tickets */}
      <motion.div variants={itemVariants} style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 800 }}>My Open Tickets</Title>
            <Tag style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 12, fontWeight: 700, padding: '0 8px', margin: 0 }}>
              3 open
            </Tag>
          </div>
          <Button type="link" style={{ fontWeight: 700, color: 'var(--accent-secondary)', padding: 0 }}>View All Tickets</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Ticket 1 */}
          <BubbleCard bodyStyle={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>#PE-2026-044</Text>
                <Tag style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 10, padding: '0 6px', margin: 0 }}>IN PROGRESS</Tag>
              </div>
              <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>2 days ago</Text>
            </div>
            <Title level={5} style={{ margin: '0 0 12px 0', fontWeight: 800, fontSize: 16 }}>June Instagram content for approval — 6 posts</Title>
            <Tag style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 11, marginBottom: 12 }}>Content Change</Tag>
            <Text style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>
              The 6 Instagram posts for June have been uploaded for review. Please approve or send feedback by 12 Jun.
            </Text>
            <div style={{ background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>Karan Mehta replied:</strong> 'Content uploaded to approval queue'</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button type="link" style={{ padding: 0, fontWeight: 800, color: 'var(--accent-secondary)' }}>View Ticket →</Button>
              <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-warning)' }}>Priority: Urgent</Text>
            </div>
          </BubbleCard>

          {/* Ticket 2 */}
          <BubbleCard bodyStyle={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>#PE-2026-042</Text>
                <Tag style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, fontWeight: 800, fontSize: 10, padding: '0 6px', margin: 0 }}>OPEN</Tag>
              </div>
              <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>4 days ago</Text>
            </div>
            <Title level={5} style={{ margin: '0 0 12px 0', fontWeight: 800, fontSize: 16 }}>Q2 Performance Presentation — need by 20 June</Title>
            <Tag style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 11, marginBottom: 12 }}>Report Request</Tag>
            <Text style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Please prepare a PowerPoint presentation of our Q2 results for our board meeting on 25 June.
            </Text>
            <Text style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 16 }}>Awaiting agency response</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button type="link" style={{ padding: 0, fontWeight: 800, color: 'var(--accent-secondary)' }}>View Ticket →</Button>
              <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Priority: Normal</Text>
            </div>
          </BubbleCard>

          {/* Ticket 3 */}
          <BubbleCard bodyStyle={{ padding: 24, borderLeft: '4px solid var(--accent-danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>#PE-2026-046</Text>
                <Tag style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, fontWeight: 800, fontSize: 10, padding: '0 6px', margin: 0 }}>OPEN</Tag>
              </div>
              <Text style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>1 hour ago</Text>
            </div>
            <Title level={5} style={{ margin: '0 0 12px 0', fontWeight: 800, fontSize: 16, color: 'var(--accent-danger)' }}>Google Ads not generating leads — check urgently</Title>
            <Tag style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', border: 'none', borderRadius: 4, fontWeight: 600, fontSize: 11, marginBottom: 12 }}>Technical Issue</Tag>
            <Text style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>
              We haven't received any Google Ads leads since yesterday morning. Something may be wrong with the campaign or lead sync.
            </Text>
            <Text style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 16 }}>Ticket created — awaiting response</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button type="link" style={{ padding: 0, fontWeight: 800, color: 'var(--accent-danger)' }}>View Ticket →</Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-danger)' }}>Priority: Critical</Text>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-danger)' }} />
              </div>
            </div>
          </BubbleCard>
        </div>
      </motion.div>

      {/* Resolved Tickets */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0, fontWeight: 800 }}>Resolved Tickets</Title>
          <Button type="link" style={{ fontWeight: 700, color: 'var(--accent-secondary)', padding: 0 }}>View All</Button>
        </div>
        <Text type="secondary" style={{ fontSize: 14, fontWeight: 500, display: 'block', marginTop: 4 }}>Show past 5 resolved tickets ▾</Text>
      </motion.div>

    </motion.div>
  );
};

export default SupportTab;
