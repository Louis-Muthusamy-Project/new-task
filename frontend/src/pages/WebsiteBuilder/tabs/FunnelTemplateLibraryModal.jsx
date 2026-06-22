import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Typography, Space, Row, Col, Card, Tag } from "antd";
import { LayoutTemplate, Layers, Search as SearchIcon, CheckCircle, X as CloseIcon } from "lucide-react";

const { Title, Text } = Typography;

const FunnelTemplateLibraryModal = ({ open, onCancel, onCreate, initialFunnelName }) => {
  const [funnelName, setFunnelName] = useState(initialFunnelName || "");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (initialFunnelName) {
      setFunnelName(initialFunnelName);
    }
  }, [initialFunnelName]);

  const templates = [
    { id: 1, name: "Premium Digital", type: "Digital Marketing Agency", bg: "linear-gradient(135deg, #1e293b, #0f172a)" },
    { id: 2, name: "Growth Spark Media", type: "Digital Marketing Agency", bg: "linear-gradient(135deg, #d97706, #b45309)" },
    { id: 3, name: "Pixel Reach Agency", type: "Digital Marketing Agency", bg: "linear-gradient(135deg, #334155, #1e293b)" },
  ];

  const handleCreate = () => {
    onCreate({ 
      name: funnelName, 
      template: selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name : null,
      type: "template"
    });
    setSelectedTemplate(null);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1200}
      closeIcon={<Button type="text" icon={<CloseIcon size={20} />} onClick={onCancel} style={{ color: "var(--text-secondary)" }} />}
      style={{ top: 20 }}
      styles={{ body: { padding: 0, borderRadius: 16, overflow: "hidden" } }}
      className="glassmorphism-modal"
    >
      <div style={{ display: "flex", height: "85vh", maxHeight: 900 }}>
        {/* Sidebar */}
        <div style={{ width: 260, borderRight: "1px solid var(--border-color)", padding: "24px 16px", overflowY: "auto", background: "var(--bg-secondary)", display: "flex", flexDirection: "column" }}>
          <Title level={4} style={{ marginBottom: 24, fontSize: 18, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
            <LayoutTemplate size={20} color="var(--accent-secondary)" /> Template Library
          </Title>
          
          <div style={{ background: "rgba(13, 148, 136, 0.1)", color: "var(--accent-secondary)", padding: "10px 16px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontWeight: 600 }}>
            <span>All Templates</span>
            <Tag style={{ margin: 0, borderRadius: 12, background: "rgba(13, 148, 136, 0.2)", border: "none", color: "var(--accent-secondary)" }}>500</Tag>
          </div>
          
          <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", color: "var(--text-primary)", marginBottom: 24, cursor: "pointer", fontWeight: 500 }}>
            <span>My Templates</span>
            <Text type="secondary" style={{ fontSize: 12 }}>12</Text>
          </div>

          <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 16, display: "block" }}>BROWSE CATEGORIES</Text>
          
          <Space direction="vertical" style={{ width: "100%", flex: 1 }}>
            {["Digital Marketing Agency", "Real Estate Company", "Hospital / Clinic", "Restaurant / Cafe", "Educational Institute", "IT / Software Company", "Construction Company", "Fashion / Boutique", "Beauty Salon / Spa", "Automobile / Garage"].map(cat => (
              <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", cursor: "pointer" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: 14 }}>{cat}</span>
                <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>50</span>
              </div>
            ))}
          </Space>

          <Button block style={{ marginTop: 24, borderRadius: 8, height: 40, fontWeight: 600, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
            Manage library
          </Button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
          <div style={{ padding: 24, borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Title level={4} style={{ margin: 0, fontSize: 18, color: "var(--text-primary)" }}>Funnels</Title>
                <Text type="secondary">Prebuilt templates & your uploads</Text>
              </div>
              <Space>
                <Button style={{ borderRadius: 8, height: 40, fontWeight: 600, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Upload ZIP</Button>
                <Input placeholder="Search templates..." prefix={<SearchIcon size={16} color="var(--text-tertiary)"/>} style={{ width: 250, borderRadius: 8, height: 40 }} />
              </Space>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>All funnel templates</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>System library & your uploads</div>
            
            <Row gutter={[24, 24]}>
              {templates.map(template => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <Col span={8} key={template.id}>
                    <Card 
                      hoverable 
                      onClick={() => setSelectedTemplate(template.id)}
                      style={{ 
                        borderRadius: 16, 
                        overflow: "hidden",
                        border: isSelected ? "2px solid var(--accent-secondary)" : "1px solid var(--border-color)",
                        boxShadow: isSelected ? "0 4px 20px rgba(13, 148, 136, 0.15)" : "var(--shadow-sm)",
                        background: "var(--bg-secondary)",
                        padding: 0
                      }}
                      bodyStyle={{ padding: 0 }}
                    >
                      <div style={{ height: 180, background: template.bg, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 24, background: 'rgba(255,255,255,0.15)', borderRadius: 6 }} />
                        <div style={{ position: 'absolute', top: 64, left: 20, right: 20, bottom: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }} />
                      </div>
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>{template.name}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: isSelected ? 8 : 0 }}>{template.type}</div>
                        
                        {isSelected && (
                          <div style={{ color: "var(--accent-secondary)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center" }}>
                            <CheckCircle size={14} style={{ marginRight: 6 }} /> SELECTED
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>

          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", background: "var(--bg-secondary)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ width: 350 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Funnel name</div>
              <Input 
                value={funnelName} 
                onChange={(e) => setFunnelName(e.target.value)} 
                style={{ borderRadius: 8, height: 44, fontSize: 15 }}
                size="large"
              />
            </div>
            
            <Space size="middle">
              <Button onClick={onCancel} style={{ borderRadius: 8, height: 44, fontWeight: 600, padding: "0 24px", borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Back</Button>
              <Button 
                type="primary" 
                onClick={handleCreate}
                disabled={!funnelName || !selectedTemplate}
                style={{ backgroundColor: "var(--accent-secondary)", border: "none", borderRadius: 8, height: 44, fontWeight: 600, padding: "0 24px" }}
              >
                Create Funnel
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FunnelTemplateLibraryModal;
