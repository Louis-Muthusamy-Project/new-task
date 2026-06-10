import React from 'react';
import { Typography, Card, Button, Input, Select, Upload, Switch, Table, Progress, Tag, Tabs, Checkbox, Form, Radio, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, CheckCircle2, ShieldAlert, Check, FileText } from 'lucide-react';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SettingsPage = () => {
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

  const m1Invoices = [
    { id: 'M1-INV-2026-06', period: 'Jun 2026', amount: '₹8,500', status: 'PAID' },
    { id: 'M1-INV-2026-05', period: 'May 2026', amount: '₹8,500', status: 'PAID' },
    { id: 'M1-INV-2026-04', period: 'Apr 2026', amount: '₹8,500', status: 'PAID' },
    { id: 'M1-INV-2026-03', period: 'Mar 2026', amount: '₹8,500', status: 'PAID' },
    { id: 'M1-INV-2026-02', period: 'Feb 2026', amount: '₹8,500', status: 'PAID' },
    { id: 'M1-INV-2026-01', period: 'Jan 2026', amount: '₹8,500', status: 'PAID' },
  ];

  const invCols = [
    { title: 'INVOICE #', dataIndex: 'id', key: 'id', render: text => <Text type="secondary" style={{ fontSize: 13, fontWeight: 600 }}>{text}</Text> },
    { title: 'PERIOD', dataIndex: 'period', key: 'period', render: text => <Text style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{text}</Text> },
    { title: 'AMOUNT', dataIndex: 'amount', key: 'amount', render: text => <strong style={{ color: 'var(--text-primary)' }}>{text}</strong> },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: val => <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}><CheckCircle2 size={14}/> {val}</span> },
    { title: 'ACTIONS', key: 'actions', align: 'right', render: () => <a style={{ color: 'var(--accent-secondary)', fontSize: 12, fontWeight: 600 }}>PDF</a> },
  ];

  const PanelCard = ({ title, extra, children, accentColor }) => (
    <Card 
      title={<strong style={{ fontSize: 15, color: 'var(--text-primary)', letterSpacing: 0.5 }}>{title}</strong>} 
      extra={extra && <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{extra}</Text>} 
      className="glassmorphism" 
      style={{ 
        borderRadius: '0 24px 24px 0', 
        marginBottom: 40,
        border: '1px solid var(--border-color)',
        borderLeft: `8px solid ${accentColor}`,
        boxShadow: 'var(--shadow-md)',
        background: 'var(--bg-secondary)'
      }} 
      bodyStyle={{ padding: 32 }}
    >
      {children}
    </Card>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <Text type="secondary" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>AGENCY OPS / CONTROL CENTRE</Text>
        <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Settings</Title>
        <Text type="secondary" style={{ fontWeight: 500 }}>Configure how the M1 platform works for BCC Martech.</Text>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultActiveKey="1" style={{ marginBottom: 32 }} size="large">
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Agency</strong>} key="1" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Integrations</strong>} key="2" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Team & Access</strong>} key="3" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Notifications</strong>} key="4" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Backend Config</strong>} key="5" />
          <TabPane tab={<strong style={{ fontWeight: 600 }}>Access Matrix</strong>} key="6" />
        </Tabs>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Title level={4} style={{ marginBottom: 8, fontWeight: 700, color: 'var(--text-primary)' }}>Agency Settings</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 14, fontWeight: 500 }}>Your agency profile, branding, and M1 subscription.</Text>
      </motion.div>

      {/* Agency Profile */}
      <motion.div variants={itemVariants}>
        <PanelCard title="Agency Profile" accentColor="var(--accent-secondary)">
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <Form layout="vertical">
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Agency Name *</strong>}>
                  <Input defaultValue="BCC Martech" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                </Form.Item>
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Agency Tagline</strong>}>
                  <Input defaultValue="Performance Marketing Agency" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                </Form.Item>
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Primary Contact Name *</strong>}>
                  <Input defaultValue="Arjun Sharma" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                </Form.Item>
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Primary Contact Email *</strong>}>
                  <Input defaultValue="arjun@bccmartech.com" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                </Form.Item>
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Primary Contact Phone *</strong>}>
                  <Input defaultValue="+91 98765 43210" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                </Form.Item>
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Office Location</strong>}>
                  <Input defaultValue="Bengaluru, Karnataka, India" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                </Form.Item>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Founded</strong>} style={{ flex: 1 }}>
                    <Input defaultValue="2020" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                  </Form.Item>
                  <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Website</strong>} style={{ flex: 1 }}>
                    <Input defaultValue="www.bccmartech.com" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>GST Number</strong>} style={{ flex: 1 }}>
                    <Input defaultValue="29AABCB1234D1Z5" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                  </Form.Item>
                  <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>PAN Number</strong>} style={{ flex: 1 }}>
                    <Input defaultValue="AABCB1234D" style={{ borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} />
                  </Form.Item>
                </div>
              </Form>
            </div>
            <div style={{ flex: '1 1 300px' }}>
              <Form layout="vertical">
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Agency Logo</strong>}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ width: 88, height: 88, background: 'var(--accent-secondary)', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: 28, fontWeight: 800, boxShadow: 'var(--shadow-sm)' }}>BCC</div>
                    <div>
                      <Button icon={<UploadIcon size={16}/>} style={{ borderRadius: 8, marginBottom: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }}>Upload new logo</Button>
                      <Text type="secondary" style={{ display: 'block', fontSize: 11, fontWeight: 500 }}>Min 200x200px. PNG or SVG preferred.</Text>
                      <a style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-danger)' }}>Remove logo</a>
                    </div>
                  </div>
                </Form.Item>
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Agency Primary Colour</strong>}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, background: 'var(--accent-secondary)', borderRadius: 8, border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} />
                    <Input defaultValue="var(--accent-secondary)" style={{ width: 200, borderRadius: 8, background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8, fontWeight: 500 }}>Used in all client portals under your brand kit.</Text>
                  
                  <div style={{ marginTop: 24, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ padding: '12px 16px', background: 'var(--accent-secondary)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>Live Preview - Portal Header</div>
                    <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>portal.bccmartech.com</div>
                  </div>
                </Form.Item>
                <Form.Item label={<strong style={{ color: 'var(--text-secondary)' }}>Default Portal Language</strong>}>
                  <Select defaultValue="English (India)" style={{ width: '100%', fontWeight: 500 }}>
                    <Select.Option value="English (India)">English (India)</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, borderTop: '1px solid var(--border-color)', paddingTop: 32 }}>
            <Button type="primary" size="large" style={{ borderRadius: 8, background: 'var(--accent-secondary)', fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-sm)' }}>Save Agency Profile</Button>
          </div>
        </PanelCard>
      </motion.div>

      {/* White-Label */}
      <motion.div variants={itemVariants}>
        <PanelCard title="White-Label Client Portal" extra="Your clients see YOUR brand, not M1's brand, in their portal." accentColor="var(--accent-info)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: 14 }}>Custom Portal Domain</strong>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Add CNAME record: `portal.bccmartech.com -&gt; m1.agency`</Text>
                </div>
                <Switch defaultChecked style={{ background: 'var(--accent-info)' }} />
              </div>
              <Input defaultValue="portal.bccmartech.com" style={{ borderRadius: 8, maxWidth: 400, marginBottom: 16, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}><CheckCircle2 size={16}/> DNS verified · SSL active</span>
                <a style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-info)' }}>View DNS Instructions</a>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: 14 }}>Portal "Powered by" text</strong>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Show in client portal footer</Text>
                </div>
                <Switch defaultChecked style={{ background: 'var(--accent-info)' }} />
              </div>
              <Input defaultValue="Powered by BCC Martech" style={{ borderRadius: 8, maxWidth: 400, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }} />
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: 14 }}>Email From Name</strong>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Verified domain — emails to client from this address</Text>
                </div>
                <Switch defaultChecked style={{ background: 'var(--accent-info)' }} />
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, maxWidth: 600 }}>
                <Input defaultValue="BCC Martech" style={{ borderRadius: 8, flex: 1, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }} />
                <Input defaultValue="reports@bccmartech.com" style={{ borderRadius: 8, flex: 1, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 600 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}><CheckCircle2 size={16}/> Verified sender</span>
                <a style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-info)' }}>Verify new email</a>
              </div>
            </div>
          </div>
        </PanelCard>
      </motion.div>

      {/* Subscription */}
      <motion.div variants={itemVariants}>
        <PanelCard title="Your M1 Subscription" extra="The plan you pay M1 for using the platform." accentColor="var(--accent-primary)">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <Title level={3} style={{ margin: 0, color: 'var(--accent-primary)', fontWeight: 800 }}>Agency Pro</Title>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>₹8,500/month · Billed Monthly · Next charge: 1 Jul 2026</Text>
            </div>
            <Tag style={{ borderRadius: 12, fontSize: 13, padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', fontWeight: 700 }}><Check size={16} style={{ marginRight: 6, verticalAlign: 'middle', position: 'relative', top: -1 }}/> Active</Tag>
          </div>

          <Row gutter={16} style={{ marginBottom: 40, fontSize: 14, fontWeight: 500 }}>
            <Col span={8}>
              <ul style={{ margin: 0, paddingLeft: 24, color: 'var(--text-secondary)' }}>
                <li>25 client accounts</li>
                <li>8,000 AI API calls /month</li>
                <li>Custom domain</li>
              </ul>
            </Col>
            <Col span={8}>
              <ul style={{ margin: 0, paddingLeft: 24, color: 'var(--text-secondary)' }}>
                <li>10 team members</li>
                <li>100 GB storage</li>
                <li>Priority support</li>
              </ul>
            </Col>
            <Col span={8}>
              <ul style={{ margin: 0, paddingLeft: 24, color: 'var(--text-secondary)' }}>
                <li>10 AI agents</li>
                <li>White-label portal</li>
              </ul>
            </Col>
          </Row>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <strong style={{ color: 'var(--text-primary)' }}>AI API Calls</strong>
                <Text type="secondary" style={{ fontWeight: 600 }}>6,580 / 8,000 calls (82%)</Text>
              </div>
              <Progress percent={82} strokeColor="var(--accent-warning)" trailColor="var(--bg-tertiary)" showInfo={false} size="small" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Storage</strong>
                <Text type="secondary" style={{ fontWeight: 600 }}>18 / 100 GB (18%)</Text>
              </div>
              <Progress percent={18} strokeColor="var(--accent-primary)" trailColor="var(--bg-tertiary)" showInfo={false} size="small" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Client Accounts</strong>
                <Text type="secondary" style={{ fontWeight: 600 }}>12 / 25 (48%)</Text>
              </div>
              <Progress percent={48} strokeColor="var(--accent-primary)" trailColor="var(--bg-tertiary)" showInfo={false} size="small" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Team Members</strong>
                <Text type="secondary" style={{ fontWeight: 600 }}>5 / 10 (50%)</Text>
              </div>
              <Progress percent={50} strokeColor="var(--accent-primary)" trailColor="var(--bg-tertiary)" showInfo={false} size="small" />
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--accent-warning)', fontSize: 14, fontWeight: 600 }}><ShieldAlert size={20}/> You've used 82% of your monthly AI API calls. Consider upgrading to Enterprise for unlimited calls.</span>
            <Button size="middle" style={{ background: 'var(--accent-warning)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700 }}>Upgrade Plan</Button>
          </div>

          <Row gutter={24} style={{ marginBottom: 48 }}>
            <Col span={8}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, textAlign: 'center', opacity: 0.6, background: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-tertiary)' }}>STARTER</div>
                <div style={{ fontSize: 28, fontWeight: 800, margin: '12px 0', color: 'var(--text-primary)' }}>₹4,999<span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>/mo</span></div>
                <ul style={{ fontSize: 12, textAlign: 'left', paddingLeft: 20, color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
                   <li>5 clients</li><li>2 team</li><li>3 agents</li><li>2,000 AI calls</li>
                </ul>
                <Button block disabled style={{ borderRadius: 8, marginTop: 24, fontWeight: 600 }}>Current plan is higher</Button>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ border: '2px solid var(--accent-primary)', borderRadius: 16, padding: 32, textAlign: 'center', position: 'relative', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-md)' }}>
                <Tag color="var(--accent-primary)" style={{ position: 'absolute', top: -12, right: 16, borderRadius: 12, fontWeight: 800, padding: '2px 12px', border: 'none' }}>CURRENT</Tag>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--accent-primary)' }}>AGENCY PRO</div>
                <div style={{ fontSize: 28, fontWeight: 800, margin: '12px 0', color: 'var(--text-primary)' }}>₹8,500<span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>/mo</span></div>
                <ul style={{ fontSize: 12, textAlign: 'left', paddingLeft: 20, color: 'var(--text-primary)', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
                   <li>25 clients</li><li>10 team</li><li>10 agents</li><li>8,000 AI calls</li>
                </ul>
                <Button block style={{ borderRadius: 8, marginTop: 24, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: 'none', fontWeight: 700 }}>Your current plan</Button>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 16, padding: 32, textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: 'var(--text-secondary)' }}>ENTERPRISE</div>
                <div style={{ fontSize: 28, fontWeight: 800, margin: '12px 0', color: 'var(--text-primary)' }}>₹24,000<span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>/mo</span></div>
                <ul style={{ fontSize: 12, textAlign: 'left', paddingLeft: 20, color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
                   <li>Unlimited clients</li><li>Unlimited team</li><li>Unlimited agents</li><li>Unlimited AI calls</li><li>Custom features</li>
                </ul>
                <Button type="primary" block style={{ borderRadius: 8, marginTop: 24, background: 'var(--accent-info)', fontWeight: 700, border: 'none' }}>Upgrade</Button>
              </div>
            </Col>
          </Row>

          <Title level={5} style={{ margin: '0 0 20px 0', fontWeight: 800, color: 'var(--text-primary)' }}>M1 INVOICES</Title>
          <Table columns={invCols} dataSource={m1Invoices} pagination={false} size="middle" style={{ marginBottom: 20 }} scroll={{ x: 'max-content' }} rowClassName={() => 'hover-bg'} />
          <div style={{ textAlign: 'center' }}>
            <a style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>View all invoices</a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 12, marginTop: 40, flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: 14 }}><Text type="secondary" style={{ fontWeight: 500 }}>Payment method:</Text> <strong style={{ color: 'var(--text-primary)', marginLeft: 8 }}>Visa ····4021</strong> — HDFC Bank</span>
            <a style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-secondary)' }}>Update payment method</a>
          </div>
        </PanelCard>
      </motion.div>

      {/* Payment Gateway */}
      <motion.div variants={itemVariants}>
        <PanelCard title="Payment Gateway — Razorpay" extra="Collect retainer payments and marketplace purchases from your clients." accentColor="var(--accent-warning)">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: '1px solid var(--border-color)', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, padding: '8px 16px', fontWeight: 800, color: 'var(--accent-info)', background: 'rgba(59, 130, 246, 0.05)', fontSize: 16 }}>Razorpay</div>
              <div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                  <Tag style={{ margin: 0, borderRadius: 12, fontSize: 11, padding: '2px 10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', fontWeight: 700 }}><CheckCircle2 size={12} style={{ marginRight: 6, position: 'relative', top: 1 }}/> Connected</Tag>
                  <code style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 6 }}>rzp_live_8n2EqA29Mz</code>
                </div>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>Linked bank: HDFC ····4821 · Settlement: T+2 · Mode: Live</Text>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              <a style={{ color: 'var(--accent-secondary)' }}>Manage account</a> <Text type="secondary" style={{ margin: '0 8px' }}>·</Text> <a style={{ color: 'var(--accent-danger)' }}>Disconnect</a>
            </div>
          </div>

          <Row gutter={48}>
            <Col xs={24} lg={12}>
              <Form layout="vertical">
                <Form.Item label={<strong style={{ color: 'var(--text-primary)' }}>Default collection mode</strong>}>
                  <Radio.Group defaultValue="manual" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    <Radio value="auto" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Auto-Collect (Mandate)</Radio>
                    <Radio value="link" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Payment link</Radio>
                    <Radio value="manual" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Manual</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item label={<strong style={{ color: 'var(--text-primary)' }}>Auto-collection date</strong>} style={{ marginTop: 32 }}>
                  <Select defaultValue="1" style={{ width: 160, fontWeight: 600 }}>
                    <Select.Option value="1">1st of month</Select.Option>
                    <Select.Option value="5">5th of month</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            </Col>
            <Col xs={24} lg={12}>
              <Form layout="vertical">
                <Form.Item label={<strong style={{ color: 'var(--text-primary)' }}>Invoice notifications</strong>}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    <Checkbox defaultChecked style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Email invoice to client on issue date</Checkbox>
                    <Checkbox defaultChecked style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Send payment link with invoice</Checkbox>
                    <Checkbox defaultChecked style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Auto-reminder T-7 days before due</Checkbox>
                    <Checkbox defaultChecked style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Auto-reminder T-1 day before due</Checkbox>
                    <Checkbox defaultChecked style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Overdue alert T+1 day after due</Checkbox>
                    <Checkbox style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Overdue alert every 3 days until paid</Checkbox>
                  </div>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 32, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <strong style={{ fontSize: 14, display: 'block', color: 'var(--text-primary)', marginBottom: 8 }}>GST Configuration</strong>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.6, display: 'block' }}>Your GSTIN: <strong>29AABCB1234D1Z5</strong><br/>Default tax rate: 18% GST (IGST interstate / CGST+SGST intrastate)</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12, fontWeight: 600 }}>SAC Code: 998311 - Marketing services</Text>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}><Switch defaultChecked style={{ background: 'var(--accent-secondary)', marginRight: 12 }} /> Include GST in invoices</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
            <Button type="primary" size="large" style={{ borderRadius: 8, background: 'var(--accent-secondary)', fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-sm)' }}>Save Payment Settings</Button>
          </div>
        </PanelCard>
      </motion.div>

    </motion.div>
  );
};

export default SettingsPage;
