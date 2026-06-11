import React, { useState } from 'react';
import { Modal, Typography, Button, Select, Row, Col, Card, Input } from 'antd';
import { FileText, BarChart2, Target, Zap, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;

const CreateReportModal = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [selectedTemplate, setSelectedTemplate] = useState('monthly');
  const [selectedClient, setSelectedClient] = useState('Prestige Estates');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 days');
  const [selectedSections, setSelectedSections] = useState(['mos', 'seo', 'ads', 'leads']);
  const [emailRecipients, setEmailRecipients] = useState('client@example.com');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 9XXXXXXXXX');
  const [deliveryMethod, setDeliveryMethod] = useState('Send now');

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const stepTitles = [
    'Template',
    'Client',
    'Date Range',
    'Sections',
    'Delivery',
    'Preview'
  ];

  const renderStepper = () => {
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
          {/* Connecting Line */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'var(--bg-tertiary)', zIndex: 0, transform: 'translateY(-50%)' }} />
          
          {/* Active progress line */}
          <div style={{ position: 'absolute', top: '50%', left: 0, width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`, height: 2, background: 'var(--accent-primary)', zIndex: 1, transform: 'translateY(-50%)', transition: 'width 0.3s ease' }} />

          {[1, 2, 3, 4, 5, 6].map(step => {
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            return (
              <div 
                key={step}
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  background: isActive || isCompleted ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                  color: isActive || isCompleted ? '#fff' : 'var(--text-tertiary)',
                  border: isActive || isCompleted ? 'none' : '1px solid var(--border-color)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 700, 
                  fontSize: 14,
                  zIndex: 2,
                  transition: 'all 0.3s'
                }}
              >
                {step}
              </div>
            );
          })}
        </div>
        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</Text>
      </div>
    );
  };

  const toggleSection = (id) => {
    if (selectedSections.includes(id)) {
      setSelectedSections(selectedSections.filter(s => s !== id));
    } else {
      setSelectedSections([...selectedSections, id]);
    }
  };

  const renderStepContent = () => {
    const variants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    };

    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" initial="initial" animate="animate" exit="exit" variants={variants} transition={{ duration: 0.2 }}>
            <Row gutter={[16, 16]}>
              {[
                { id: 'monthly', title: 'Monthly Performance Report', desc: 'All KPIs across SEO, ads, leads, social and content in one comprehensive deck.', icon: <FileText size={20} /> },
                { id: 'seo', title: 'SEO Ranking Report', desc: 'Keyword positions, organic traffic, top pages and backlink growth.', icon: <BarChart2 size={20} /> },
                { id: 'paid', title: 'Paid Media Report', desc: 'Ad spend, leads, ROAS and campaign-level breakdown across platforms.', icon: <Target size={20} /> },
                { id: 'exec', title: 'Executive Summary', desc: '1-page MOS score with top wins, risks and next steps for leadership.', icon: <Zap size={20} /> },
                { id: 'blank', title: 'Start blank', desc: 'Build a fully custom report from scratch.', isBlank: true }
              ].map(tpl => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <Col xs={24} sm={12} key={tpl.id}>
                    <div 
                      onClick={() => setSelectedTemplate(tpl.id)}
                      style={{ 
                        padding: 20, 
                        borderRadius: 12, 
                        border: isSelected ? '2px solid var(--accent-primary)' : tpl.isBlank ? '1px dashed var(--border-color)' : '1px solid var(--border-color)', 
                        background: isSelected ? 'rgba(13, 148, 136, 0.05)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--text-primary)' }}>
                        {tpl.icon && <span style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{tpl.icon}</span>}
                        <strong style={{ fontSize: 15 }}>{tpl.title}</strong>
                      </div>
                      <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{tpl.desc}</Text>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial="initial" animate="animate" exit="exit" variants={variants} transition={{ duration: 0.2 }}>
            <div style={{ marginBottom: 24 }}>
              <strong style={{ display: 'block', fontSize: 15, marginBottom: 12, color: 'var(--text-primary)' }}>Select client</strong>
              <Select 
                size="large" 
                value={selectedClient} 
                onChange={setSelectedClient} 
                style={{ width: '100%', fontWeight: 500 }}
              >
                <Option value="Prestige Estates">Prestige Estates</Option>
                <Option value="Bhartiya City">Bhartiya City</Option>
                <Option value="Rapido">Rapido</Option>
              </Select>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial="initial" animate="animate" exit="exit" variants={variants} transition={{ duration: 0.2 }}>
            <div style={{ marginBottom: 24 }}>
              <strong style={{ display: 'block', fontSize: 15, marginBottom: 12, color: 'var(--text-primary)' }}>Date range</strong>
              <Select 
                size="large" 
                value={selectedDateRange} 
                onChange={setSelectedDateRange} 
                style={{ width: '100%', fontWeight: 500 }}
              >
                <Option value="Last 7 days">Last 7 days</Option>
                <Option value="Last 30 days">Last 30 days</Option>
                <Option value="This Month">This Month</Option>
                <Option value="Last Month">Last Month</Option>
              </Select>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial="initial" animate="animate" exit="exit" variants={variants} transition={{ duration: 0.2 }}>
            <strong style={{ display: 'block', fontSize: 15, marginBottom: 16, color: 'var(--text-primary)' }}>Sections to include</strong>
            <Row gutter={[16, 16]}>
              {[
                { id: 'mos', label: 'MOS Score' },
                { id: 'seo', label: 'SEO' },
                { id: 'ads', label: 'Ads' },
                { id: 'leads', label: 'Leads' },
                { id: 'social', label: 'Social' },
                { id: 'finance', label: 'Finance' },
                { id: 'exec', label: 'Executive Summary' },
              ].map(sec => {
                const isSelected = selectedSections.includes(sec.id);
                return (
                  <Col xs={24} sm={12} key={sec.id}>
                    <div 
                      onClick={() => toggleSection(sec.id)}
                      style={{ 
                        padding: '16px 20px', 
                        borderRadius: 12, 
                        border: '1px solid var(--border-color)', 
                        background: 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        border: isSelected ? 'none' : '2px solid var(--border-color)', 
                        background: isSelected ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <Text style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{sec.label}</Text>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" initial="initial" animate="animate" exit="exit" variants={variants} transition={{ duration: 0.2 }}>
            <div style={{ marginBottom: 24 }}>
              <strong style={{ display: 'block', fontSize: 15, marginBottom: 12, color: 'var(--text-primary)' }}>Email recipients</strong>
              <Input.TextArea 
                rows={3} 
                value={emailRecipients} 
                onChange={e => setEmailRecipients(e.target.value)} 
                style={{ borderRadius: 8, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} 
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <strong style={{ display: 'block', fontSize: 15, marginBottom: 12, color: 'var(--text-primary)' }}>WhatsApp number (optional)</strong>
              <Input 
                size="large" 
                value={whatsappNumber} 
                onChange={e => setWhatsappNumber(e.target.value)} 
                style={{ borderRadius: 8, background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontWeight: 500 }} 
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <strong style={{ display: 'block', fontSize: 15, marginBottom: 12, color: 'var(--text-primary)' }}>Delivery</strong>
              <Select 
                size="large" 
                value={deliveryMethod} 
                onChange={setDeliveryMethod} 
                style={{ width: '100%', fontWeight: 500 }}
              >
                <Option value="Send now">Send now</Option>
                <Option value="Schedule">Schedule for later</Option>
              </Select>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="step6" initial="initial" animate="animate" exit="exit" variants={variants} transition={{ duration: 0.2 }}>
            <div style={{ padding: 24, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <strong style={{ display: 'block', fontSize: 16, marginBottom: 20, color: 'var(--text-primary)' }}>Preview</strong>
              
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px 0', fontSize: 14 }}>
                <Text type="secondary" style={{ fontWeight: 500 }}>Template</Text>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedTemplate === 'monthly' ? 'Monthly Performance Report' : selectedTemplate === 'seo' ? 'SEO Ranking Report' : selectedTemplate === 'paid' ? 'Paid Media Report' : selectedTemplate === 'exec' ? 'Executive Summary' : 'Custom'}</strong>
                
                <Text type="secondary" style={{ fontWeight: 500 }}>Client</Text>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedClient}</strong>
                
                <Text type="secondary" style={{ fontWeight: 500 }}>Date range</Text>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedDateRange.toLowerCase().replace(' ', '-')}</strong>
                
                <Text type="secondary" style={{ fontWeight: 500 }}>Sections</Text>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedSections.map(s => s === 'mos' ? 'MOS Score' : s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</strong>
                
                <Text type="secondary" style={{ fontWeight: 500 }}>Email</Text>
                <strong style={{ color: 'var(--text-primary)' }}>{emailRecipients}</strong>
                
                <Text type="secondary" style={{ fontWeight: 500 }}>WhatsApp</Text>
                <strong style={{ color: 'var(--text-primary)' }}>{whatsappNumber.includes('XXX') ? '—' : whatsappNumber}</strong>
                
                <Text type="secondary" style={{ fontWeight: 500 }}>Schedule</Text>
                <strong style={{ color: 'var(--text-primary)' }}>{deliveryMethod === 'Send now' ? 'now' : 'scheduled'}</strong>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={<Title level={3} style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>Create Report</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      bodyStyle={{ padding: '24px 32px 32px' }}
      className="create-report-modal"
    >
      {renderStepper()}

      <div style={{ minHeight: 300, padding: '16px 0 32px' }}>
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Footer Buttons */}
      <div style={{ display: 'flex', justifyContent: currentStep > 1 ? 'space-between' : 'flex-end', alignItems: 'center', marginTop: 16 }}>
        {currentStep > 1 && (
          <Button 
            onClick={prevStep} 
            icon={<ChevronLeft size={16} />} 
            style={{ borderRadius: 8, height: 44, padding: '0 20px', fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            Back
          </Button>
        )}
        <Button 
          type="primary" 
          onClick={currentStep === totalSteps ? onClose : nextStep} 
          style={{ borderRadius: 8, height: 44, padding: '0 24px', fontWeight: 700, background: 'var(--accent-primary)', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {currentStep === totalSteps ? <><Check size={16} /> Send Report</> : <>Next <ChevronRight size={16} /></>}
        </Button>
      </div>
    </Modal>
  );
};

export default CreateReportModal;
