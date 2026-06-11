import React, { useState } from "react";
import { Modal, Radio, Input, Select, Checkbox, Button, Typography, Row, Col, Tag } from "antd";
import { Store, LayoutTemplate } from "lucide-react";

const { Option } = Select;

const CreateStoreModal = ({ open, onCancel, onContinue }) => {
  const [method, setMethod] = useState("templates");
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState("Draft");
  const [installDemo, setInstallDemo] = useState(true);

  const handleContinue = () => {
    onContinue({ method, storeName, currency, status, installDemo });
  };

  return (
    <Modal
      title={<div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><Store size={24} color="var(--accent-success)" /> Create New Store</div>}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          Cancel
        </Button>,
        <Button 
          key="continue" 
          type="primary" 
          onClick={handleContinue}
          style={{ backgroundColor: "var(--accent-success)", borderColor: "var(--accent-success)", borderRadius: 8, fontWeight: 700 }}
          disabled={!storeName}
        >
          Continue
        </Button>
      ]}
      width={700}
      className="glassmorphism-modal"
    >
      <div style={{ padding: "16px 0" }}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div 
              onClick={() => setMethod("scratch")}
              style={{
                border: method === "scratch" ? "2px solid var(--accent-success)" : "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                borderRadius: 16,
                padding: 24,
                cursor: "pointer",
                height: "100%",
                transition: "all 0.2s",
                boxShadow: method === "scratch" ? "0 4px 20px rgba(16, 185, 129, 0.15)" : "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Start from scratch</div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: method === 'scratch' ? '6px solid var(--accent-success)' : '2px solid var(--border-color)' }}></div>
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>
                Empty catalog — optionally add demo products
              </div>
              <div style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: 24, fontWeight: 300, background: 'var(--bg-primary)', borderRadius: 8, padding: '12px 0', border: '1px solid var(--border-color)' }}>+</div>
            </div>
          </Col>
          <Col span={12}>
            <div 
              onClick={() => setMethod("templates")}
              style={{
                border: method === "templates" ? "2px solid var(--accent-success)" : "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                borderRadius: 16,
                padding: 24,
                cursor: "pointer",
                height: "100%",
                transition: "all 0.2s",
                boxShadow: method === "templates" ? "0 4px 20px rgba(16, 185, 129, 0.15)" : "none"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>From templates</div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: method === 'templates' ? '6px solid var(--accent-success)' : '2px solid var(--border-color)' }}></div>
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>
                Industry layout with optional demo catalog
              </div>
              <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--accent-success)", padding: "16px", borderRadius: 8, textAlign: "center", fontWeight: 700 }}>
                275+ store templates
              </div>
            </div>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Store name</div>
          <Input 
            size="large"
            placeholder="e.g. Luxe Thread Co." 
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            style={{ borderRadius: 8, height: 44, fontSize: 15 }}
          />
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Currency</div>
            <Select 
              size="large"
              value={currency} 
              onChange={setCurrency}
              style={{ width: "100%", height: 44 }}
            >
              <Option value="INR">INR</Option>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Status</div>
            <Select 
              size="large"
              value={status} 
              onChange={setStatus}
              style={{ width: "100%", height: 44 }}
            >
              <Option value="Draft">Draft</Option>
              <Option value="Published">Published</Option>
            </Select>
          </Col>
        </Row>

        <div style={{ backgroundColor: "var(--bg-secondary)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)", marginBottom: 16 }}>
          <Checkbox 
            checked={installDemo} 
            onChange={(e) => setInstallDemo(e.target.checked)}
            style={{ fontWeight: 700, color: 'var(--text-primary)' }}
          >
            Install demo products
          </Checkbox>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, marginLeft: 24, marginTop: 8 }}>
            Adds sample categories, products, and a discount code. Opens a live storefront preview after install.
          </div>
        </div>

        <div>
          <span style={{ color: "var(--accent-success)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Advanced options</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}> — SEO, slug, and contact email on the full create form.</span>
        </div>
      </div>
    </Modal>
  );
};

export default CreateStoreModal;
