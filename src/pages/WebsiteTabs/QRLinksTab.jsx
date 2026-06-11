import React, { useState, useEffect } from "react";
import { Button, Table, Typography, Space, Input, Select, Card, Row, Col, Popconfirm, Divider } from "antd";
import { Plus, Trash2, Link2, MessageSquare, Phone, Mail, CreditCard, FormInput, User, FileText, Wifi, QrCode, ArrowRight, ArrowLeft } from "lucide-react";

import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { Option } = Select;

const qrTypes = [
  { id: 'Website', icon: <Link2 size={24} /> },
  { id: 'Review Link', icon: <MessageSquare size={24} /> },
  { id: 'Call', icon: <Phone size={24} /> },
  { id: 'SMS', icon: <MessageSquare size={24} /> },
  { id: 'Email', icon: <Mail size={24} /> },
  { id: 'Payment', icon: <CreditCard size={24} /> },
  { id: 'WhatsApp', icon: <MessageSquare size={24} /> },
  { id: 'Funnel', icon: <Link2 size={24} /> },
  { id: 'Form', icon: <FormInput size={24} /> },
  { id: 'Survey', icon: <FormInput size={24} /> },
  { id: 'Quiz', icon: <FormInput size={24} /> },
  { id: 'Digital VCard', icon: <User size={24} /> },
  { id: 'Personal Profile', icon: <User size={24} /> },
  { id: 'Business Profile', icon: <User size={24} /> },
  { id: 'File', icon: <FileText size={24} /> },
  { id: 'WiFi', icon: <Wifi size={24} /> }
];

const CreateQRView = ({ setView, handleCreateQR, itemVariants }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: `QR-${Math.floor(Date.now() / 1000)}`,
    type: 'Website',
    customUrl: '',
    foreground: 'var(--accent-primary)',
    background: '#ffffff',
    shape: 'Square'
  });

  const renderStepper = () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: step >= 1 ? 1 : 0.5 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 1 ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: step >= 1 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
        <div style={{ fontWeight: 800, color: step >= 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>CHOOSE TYPE</div>
      </div>
      <div style={{ height: 2, flex: 1, background: step >= 2 ? 'var(--accent-primary)' : 'var(--border-color)', margin: '0 16px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: step >= 2 ? 1 : 0.5 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 2 ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: step >= 2 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
        <div style={{ fontWeight: 800, color: step >= 2 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>ADDITIONAL INFO</div>
      </div>
      <div style={{ height: 2, flex: 1, background: step >= 3 ? 'var(--accent-primary)' : 'var(--border-color)', margin: '0 16px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: step >= 3 ? 1 : 0.5 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= 3 ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: step >= 3 ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>3</div>
        <div style={{ fontWeight: 800, color: step >= 3 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>DESIGN & COLORS</div>
      </div>
    </div>
  );

  const renderPhoneMockup = (content) => (
    <div style={{ padding: 24, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "0 16px 16px 0", height: "100%", background: 'var(--bg-primary)' }}>
      <div style={{ width: 300, height: 600, border: '8px solid var(--border-color)', borderRadius: 40, position: 'relative', background: 'var(--bg-secondary)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 120, height: 24, background: 'var(--border-color)', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}></div>
        <div style={{ padding: 40, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          {content}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Row>
      <Col span={16} style={{ padding: 40 }}>
        {renderStepper()}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>QR Name</div>
          <Input 
            size="large"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            style={{ borderRadius: 8 }}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Select QR Type <span style={{ fontWeight: 500, color: "var(--text-tertiary)", textTransform: "none" }}>(dynamic URL supported)</span></div>
          <Row gutter={[16, 16]}>
            {qrTypes.map(t => (
              <Col span={6} key={t.id}>
                <div 
                  onClick={() => setFormData({...formData, type: t.id})}
                  style={{
                    border: formData.type === t.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: formData.type === t.id ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-primary)',
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: formData.type === t.id ? '0 4px 12px rgba(59, 130, 246, 0.1)' : 'none'
                  }}
                  className="hover-shadow-md"
                >
                  <div style={{ color: formData.type === t.id ? 'var(--accent-primary)' : 'var(--text-tertiary)', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: formData.type === t.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{t.id}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
        <div style={{ marginTop: 24, fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>
          Best for business cards, flyers, and general traffic to your site.
        </div>
      </Col>
      <Col span={8}>
        {renderPhoneMockup(
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 24, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
              <QrCode size={120} color="var(--accent-primary)" />
            </div>
            <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 18 }}>{formData.type}</div>
          </div>
        )}
      </Col>
    </Row>
  );

  const renderStep2 = () => (
    <Row>
      <Col span={16} style={{ padding: 40 }}>
        {renderStepper()}
        <Title level={4} style={{ marginBottom: 8, color: 'var(--text-primary)', fontWeight: 800 }}>Website settings</Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 32, fontSize: 14, fontWeight: 500 }}>Best for business cards, flyers, and general traffic to your site.</Text>
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Link to website</div>
          <Select size="large" defaultValue="custom" style={{ width: "100%" }}>
            <Option value="custom">— Or use custom URL below —</Option>
          </Select>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 8, fontWeight: 500 }}>Opens the website home page. Connect a custom domain in Sites for your live URL.</div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Custom URL</div>
          <Input 
            size="large"
            placeholder="https://yoursite.com/offer" 
            value={formData.customUrl}
            onChange={e => setFormData({...formData, customUrl: e.target.value})}
            style={{ borderRadius: 8 }}
          />
        </div>
      </Col>
      <Col span={8}>
        {renderPhoneMockup(
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-primary)', padding: 24, borderRadius: 24, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
              <QrCode size={120} color="var(--accent-primary)" />
            </div>
            <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 18 }}>{formData.type}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 8, wordBreak: 'break-all' }}>{formData.customUrl || "https://yoursite.com/offer"}</div>
          </div>
        )}
      </Col>
    </Row>
  );

  const renderStep3 = () => (
    <Row>
      <Col span={16} style={{ padding: 40 }}>
        {renderStepper()}
        <Title level={4} style={{ marginBottom: 8, color: 'var(--text-primary)', fontWeight: 800 }}>Design & colors</Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 32, fontSize: 14, fontWeight: 500 }}>Choose a profile theme (light or dark) and customize your scannable QR code.</Text>
        
        <Divider style={{ margin: "24px 0", borderColor: 'var(--border-color)' }} />

        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: 'var(--text-primary)' }}>QR code style</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24, fontWeight: 500 }}>Colors encoded in the scannable image.</div>

        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col span={12}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>FOREGROUND</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: formData.foreground, borderRadius: 8, border: "1px solid var(--border-color)" }}></div>
              <Input 
                size="large"
                value={formData.foreground} 
                onChange={e => setFormData({...formData, foreground: e.target.value})}
                style={{ borderRadius: 8 }}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>BACKGROUND</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: formData.background, borderRadius: 8, border: "1px solid var(--border-color)" }}></div>
              <Input 
                size="large"
                value={formData.background} 
                onChange={e => setFormData({...formData, background: e.target.value})}
                style={{ borderRadius: 8 }}
              />
            </div>
          </Col>
        </Row>

        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>MODULE SHAPE</div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button 
            size="large"
            style={{ 
              borderRadius: 8, 
              fontWeight: 700,
              background: formData.shape === 'Square' ? 'var(--accent-primary)' : 'var(--bg-primary)',
              color: formData.shape === 'Square' ? '#fff' : 'var(--text-primary)',
              borderColor: formData.shape === 'Square' ? 'var(--accent-primary)' : 'var(--border-color)'
            }}
            onClick={() => setFormData({...formData, shape: "Square"})}
          >
            Square
          </Button>
          <Button 
            size="large"
            style={{ 
              borderRadius: 8, 
              fontWeight: 700,
              background: formData.shape === 'Rounded' ? 'var(--accent-primary)' : 'var(--bg-primary)',
              color: formData.shape === 'Rounded' ? '#fff' : 'var(--text-primary)',
              borderColor: formData.shape === 'Rounded' ? 'var(--accent-primary)' : 'var(--border-color)'
            }}
            onClick={() => setFormData({...formData, shape: "Rounded"})}
          >
            Rounded
          </Button>
        </div>

      </Col>
      <Col span={8}>
        {renderPhoneMockup(
          <div style={{ display: "flex", justifyContent: 'center' }}>
            <div style={{ background: formData.background, padding: 32, borderRadius: formData.shape === 'Rounded' ? 32 : 16, boxShadow: 'var(--shadow-md)' }}>
              <QrCode size={160} color={formData.foreground === 'var(--accent-primary)' ? '#3b82f6' : formData.foreground} />
            </div>
          </div>
        )}
      </Col>
    </Row>
  );

  return (
    <motion.div variants={itemVariants} className="builder-view-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 700 }} onClick={() => setView("list")}>
        <ArrowLeft size={16} /> Back to QR Links
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8, color: 'var(--text-primary)', fontWeight: 900 }}>Create QR Code</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Generate your QR with ease — same flow as GoHighLevel.</Text>
        </div>
      </div>

      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 24, overflow: "hidden", maxWidth: 1000, margin: "0 auto", border: "1px solid var(--border-color)", background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-md)' }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <div style={{ padding: "24px 40px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: 'var(--bg-primary)' }}>
          <Button 
            size="large"
            type="text" 
            disabled={step === 1} 
            onClick={() => setStep(step - 1)}
            style={{ fontWeight: 700, color: step === 1 ? "var(--text-tertiary)" : "var(--text-secondary)" }}
          >
            Previous
          </Button>
          <Button 
            size="large"
            type="primary" 
            style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 800, padding: "0 32px" }}
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleCreateQR(formData);
            }}
          >
            {step === 3 ? "Create QR Code" : "Next"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

const ManageQRView = ({ activeQR, setView, handleDeleteQR, itemVariants }) => {
  return (
    <motion.div variants={itemVariants} className="builder-view-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 700 }} onClick={() => setView("list")}>
        <ArrowLeft size={16} /> Back to QR Links
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8, color: 'var(--text-primary)', fontWeight: 900 }}>{activeQR.name}</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 600 }}>{activeQR.type} · {activeQR.scans} scans</Text>
        </div>
        <Space>
          <Button size="large" type="primary" onClick={() => setView("create")} icon={<Plus size={16} />} style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 800 }}>New QR Code</Button>
        </Space>
      </div>

      <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "var(--accent-success)", padding: "16px 24px", borderRadius: 12, marginBottom: 32, fontWeight: 600, fontSize: 14 }}>
        QR code created successfully. Download the image or share the scan link.
      </div>

      <Row gutter={32}>
        <Col span={10}>
          <Card style={{ borderRadius: 24, textAlign: "center", border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-md)' }} bodyStyle={{ padding: 40 }}>
            <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
               <div style={{ background: activeQR.background, padding: 32, borderRadius: activeQR.shape === 'Rounded' ? 32 : 16, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                 <QrCode size={200} color={activeQR.foreground === 'var(--accent-primary)' ? '#3b82f6' : activeQR.foreground} />
               </div>
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button size="large" type="primary" block style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 800 }}>Download SVG</Button>
              <Button size="large" block style={{ borderRadius: 8, fontWeight: 700, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}>Open scan URL</Button>
            </Space>
          </Card>
        </Col>
        <Col span={14}>
          <Card style={{ borderRadius: 24, marginBottom: 24, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }} bodyStyle={{ padding: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 24 }}>DETAILS</div>
            
            <div style={{ marginBottom: 24, background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", marginBottom: 4 }}>TYPE</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{activeQR.type}</div>
            </div>
            
            <div style={{ marginBottom: 24, background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", marginBottom: 4 }}>ABOUT</div>
              <div style={{ color: "var(--text-secondary)", fontWeight: 500, lineHeight: 1.5 }}>Open a custom link or the home page of a Jeema website you published.</div>
            </div>

            <div style={{ marginBottom: 24, background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", marginBottom: 4 }}>DESTINATION</div>
              <div style={{ color: "var(--accent-info)", fontWeight: 600, wordBreak: "break-all" }}>{activeQR.scanLink}</div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", marginBottom: 4 }}>TRACKING</div>
              <div style={{ fontWeight: 800, color: 'var(--accent-success)' }}>Scan analytics enabled</div>
            </div>
          </Card>

          <Popconfirm title="Are you sure you want to delete this QR code?" onConfirm={() => handleDeleteQR(activeQR.key)}>
            <Button size="large" block danger style={{ borderRadius: 12, fontWeight: 800, background: "rgba(239, 68, 68, 0.1)", border: "none", color: "var(--accent-danger)" }}>
              Delete QR code
            </Button>
          </Popconfirm>
        </Col>
      </Row>
    </motion.div>
  );
};


const QRLinksTab = ({ itemVariants }) => {
  const [view, setView] = useState("list"); // list, create, manage
  const [qrs, setQrs] = useState([]);
  const [activeQR, setActiveQR] = useState(null);

  useEffect(() => {
    const savedQRs = localStorage.getItem("tunepath_qrcodes");
    if (savedQRs) {
      try {
        setQrs(JSON.parse(savedQRs));
      } catch (e) {
        console.error("Failed to parse qrcodes from local storage");
      }
    } else {
      setQrs([
        {
          key: '1',
          name: 'QR-1781009828',
          slug: 'qr-1781009828',
          type: 'Website',
          scans: 12,
          scanLink: 'https://jeema.one/q/qr-1781009828',
          foreground: 'var(--accent-primary)',
          background: '#ffffff',
          shape: 'Square'
        },
        {
          key: '2',
          name: 'QR-1780906178',
          slug: 'qr-1780906178',
          type: 'WiFi',
          scans: 45,
          scanLink: 'Direct (device action)',
          foreground: 'var(--accent-primary)',
          background: '#ffffff',
          shape: 'Square'
        }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tunepath_qrcodes", JSON.stringify(qrs));
  }, [qrs]);

  const handleCreateQR = (formData) => {
    const newQR = {
      key: Date.now().toString(),
      name: formData.name,
      slug: formData.name.toLowerCase(),
      type: formData.type,
      scans: 0,
      scanLink: formData.customUrl || `https://jeema.one/q/${formData.name.toLowerCase()}`,
      foreground: formData.foreground,
      background: formData.background,
      shape: formData.shape
    };
    setQrs([newQR, ...qrs]);
    setActiveQR(newQR);
    setView("manage");
  };

  const handleDeleteQR = (key) => {
    setQrs(qrs.filter(q => q.key !== key));
    setView("list");
  };

  const renderList = () => {
    const columns = [
      {
        title: "NAME",
        dataIndex: "name",
        key: "name",
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: 15 }}>{record.name}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500 }}>{record.slug}</div>
          </div>
        )
      },
      {
        title: "TYPE",
        dataIndex: "type",
        key: "type",
        render: (text) => <Text strong style={{ color: 'var(--text-primary)' }}>{text}</Text>
      },
      {
        title: "SCANS",
        dataIndex: "scans",
        key: "scans",
        render: (text) => <Text strong style={{ color: 'var(--text-primary)' }}>{text}</Text>
      },
      {
        title: "SCAN LINK",
        dataIndex: "scanLink",
        key: "scanLink",
        render: (text) => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text>
      },
      {
        title: "ACTIONS",
        key: "actions",
        align: "right",
        render: (_, record) => (
          <span 
            style={{ color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => {
              setActiveQR(record);
              setView("manage");
            }}
          >
            Manage <ArrowRight size={14} />
          </span>
        )
      },
    ];

    return (
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <QrCode size={24} color="var(--accent-primary)" /> QR Links
            </Title>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              Trackable QR codes for websites, forms, funnels, contact actions, WiFi, and more.
            </Text>
          </div>
          <Space>
            <Button 
              type="primary" 
              icon={<Plus size={18} />} 
              style={{ backgroundColor: "var(--accent-primary)", border: 'none', borderRadius: 8, fontWeight: 700, height: 44, padding: '0 24px', boxShadow: 'var(--shadow-md)' }}
              onClick={() => setView("create")}
            >
              Create QR Code
            </Button>
          </Space>
        </div>

        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <Table
            columns={columns}
            dataSource={qrs}
            pagination={false}
            locale={{
              emptyText: (
                <div style={{ padding: "80px 0", textAlign: "center" }}>
                  <div style={{ width: 80, height: 80, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <QrCode size={40} />
                  </div>
                  <Title level={4} style={{ marginBottom: 12, color: 'var(--text-primary)', fontWeight: 800 }}>No QR Codes yet</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 15, fontWeight: 500 }}>
                    Click <strong style={{ color: "var(--text-primary)" }}>+ Create QR Code</strong> to generate trackable links.
                  </Text>
                  <Button type="primary" icon={<Plus size={18} />} onClick={() => setView("create")} style={{ borderRadius: 8, height: 44, background: 'var(--accent-primary)', border: 'none', fontWeight: 700, padding: '0 32px' }}>Create QR Code</Button>
                </div>
              )
            }}
          />
        </Card>
      </motion.div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      {view === "list" && renderList()}
      {view === "create" && <CreateQRView setView={setView} handleCreateQR={handleCreateQR} itemVariants={itemVariants} />}
      {view === "manage" && <ManageQRView activeQR={activeQR} setView={setView} handleDeleteQR={handleDeleteQR} itemVariants={itemVariants} />}
    </div>
  );
};

export default QRLinksTab;
