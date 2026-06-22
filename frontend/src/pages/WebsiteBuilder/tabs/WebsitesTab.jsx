import React, { useState, useEffect } from "react";
import { Button, Input, Radio, Table, Typography, Space, Modal, Card, Select, Row, Col, Badge, Tag, Divider, Popconfirm, message } from "antd";
import { Plus, Search, Folder, Sparkles, LayoutTemplate, Link2, Settings, FileText, Monitor, Smartphone, UploadCloud, ChevronRight, PenTool, ExternalLink, ArrowLeft, ArrowRight, Info, Activity, Trash2 } from "lucide-react";

import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import TemplateLibraryModal from '../websiteWizard/TemplateLibraryModal';
import WebsiteTemplatePage from './WebsiteTemplatePage';
import WebsiteEditPage from './WebsiteEditPage';
import { websiteWizardApi } from "../../../api/websiteWizardApi";

const { Title, Text } = Typography;

const { Option } = Select;
const { TextArea } = Input;

const CreateWebsiteModal = ({ open, onCancel, onCreate }) => {
  const [selectedType, setSelectedType] = useState("ai");
  const [websiteName, setWebsiteName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("Professional");

  const handleCreate = () => {
    onCreate({ name: websiteName, type: selectedType, description });
    setWebsiteName("");
    setIndustry("");
    setDescription("");
    setSelectedType("ai");
  };

  const isFormValid = websiteName.trim().length > 0 && (selectedType !== "ai" || description.trim().length > 0);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      title={<div style={{ fontSize: 24, fontWeight: 900, paddingBottom: 16, borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Create New Website</div>}
      className="glassmorphism-modal"
      bodyStyle={{ maxHeight: "75vh", overflowY: "auto", padding: '24px 0' }}
      closeIcon={<span style={{ color: 'var(--text-secondary)' }}>✕</span>}
    >
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        {/* From blank */}
        <div
          onClick={() => setSelectedType("blank")}
          style={{
            flex: 1,
            border: selectedType === "blank" ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
            background: selectedType === "blank" ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: selectedType === "blank" ? 'var(--shadow-md)' : 'none',
            display: 'flex',
            flexDirection: 'column'
          }}
          className="hover-shadow-md"
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>From blank</div>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: selectedType === 'blank' ? '6px solid var(--accent-primary)' : '2px solid var(--border-color)', background: '#fff' }}></div>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 32, minHeight: 40, fontWeight: 500 }}>
            Design from scratch using the website builder
          </div>
          <div style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: 13, fontWeight: 700, padding: "20px 0", background: 'var(--bg-primary)', borderRadius: 12, marginTop: 'auto', border: '1px dashed var(--border-color)' }}>
            Empty site with a home page
          </div>
        </div>

        {/* Create with AI */}
        <div
          onClick={() => setSelectedType("ai")}
          style={{
            flex: 1,
            border: selectedType === "ai" ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
            background: selectedType === "ai" ? 'rgba(13, 148, 136, 0.05)' : 'var(--bg-secondary)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: selectedType === "ai" ? 'var(--shadow-md)' : 'none',
            display: 'flex',
            flexDirection: 'column'
          }}
          className="hover-shadow-md"
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={18} color="var(--accent-secondary)" /> AI generated</div>
              <div style={{ background: "rgba(13, 148, 136, 0.1)", color: "var(--accent-secondary)", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12 }}>BETA</div>
            </div>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: selectedType === 'ai' ? '6px solid var(--accent-secondary)' : '2px solid var(--border-color)', background: '#fff' }}></div>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, minHeight: 40, fontWeight: 500 }}>
            Generate content, layout, and images from your business brief
          </div>
          <div style={{ background: "var(--accent-secondary)", color: "#fff", padding: "16px", textAlign: "center", borderRadius: 12, fontWeight: 800, fontSize: 13, marginTop: 'auto' }}>
            Home + Contact + About pages
          </div>
        </div>

        {/* From templates */}
        <div
          onClick={() => setSelectedType("templates")}
          style={{
            flex: 1,
            border: selectedType === "templates" ? '2px solid var(--accent-info)' : '1px solid var(--border-color)',
            background: selectedType === "templates" ? 'rgba(14, 165, 233, 0.05)' : 'var(--bg-secondary)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: selectedType === "templates" ? 'var(--shadow-md)' : 'none',
            display: 'flex',
            flexDirection: 'column'
          }}
          className="hover-shadow-md"
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}><LayoutTemplate size={18} color="var(--accent-info)" /> Templates</div>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: selectedType === 'templates' ? '6px solid var(--accent-info)' : '2px solid var(--border-color)', background: '#fff' }}></div>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, minHeight: 40, fontWeight: 500 }}>
            Jump start with an awesome prebuilt website
          </div>
          <div style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", padding: "16px", textAlign: "center", borderRadius: 12, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginTop: 'auto' }}>
            100+<br /><span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Templates</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>WEBSITE NAME <span style={{ color: "var(--accent-danger)" }}>*</span></div>
        <Input
          size="large"
          placeholder="e.g. Prestige Estates Luxury Launch"
          value={websiteName}
          onChange={(e) => setWebsiteName(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </div>

      {selectedType === "ai" && (
        <div style={{ border: "2px solid rgba(13, 148, 136, 0.2)", background: "rgba(13, 148, 136, 0.05)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: "var(--accent-secondary)" }}>INDUSTRY</div>
            <Input
              size="large"
              placeholder="e.g. Dental clinic, Real estate"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: "var(--accent-secondary)" }}>DESCRIBE YOUR BUSINESS <span style={{ color: "var(--accent-danger)" }}>*</span></div>
            <TextArea
              size="large"
              placeholder="What you do, who you serve, and what visitors should do next."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: 120, borderRadius: 8 }}
            />
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: "var(--accent-secondary)" }}>TONE</div>
            <Select size="large" value={tone} onChange={setTone} style={{ width: "100%" }}>
              <Option value="Professional">Professional</Option>
              <Option value="Friendly">Friendly</Option>
              <Option value="Energetic">Energetic</Option>
              <Option value="Luxury">Luxury</Option>
            </Select>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
        <Button size="large" onClick={onCancel} style={{ borderRadius: 8, fontWeight: 700, padding: "0 32px", borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}>Cancel</Button>
        <Button
          size="large"
          type="primary"
          onClick={handleCreate}
          disabled={!isFormValid}
          style={{
            background: selectedType === "ai" ? "var(--accent-secondary)" : (selectedType === "templates" ? "var(--accent-info)" : "var(--accent-primary)"),
            border: "none",
            borderRadius: 8, fontWeight: 800, padding: "0 32px"
          }}
        >
          {selectedType === "ai" ? "Generate Website with AI" : (selectedType === "templates" ? "Browse Templates" : "Create Empty Site")}
        </Button>
      </div>
    </Modal>
  );
};

const ManageWebsiteView = ({ activeWebsite, setView, itemVariants }) => {
  const navigate = useNavigate();

  const handleEditInBuilder = (pageName, pageSlug, pageId) => {
    const websiteId = activeWebsite?._id || activeWebsite?.key;
    const resolvedPageId = pageId || pageSlug;
    console.log("websiteId", websiteId);
    console.log("pageId", resolvedPageId);
    navigate(
      `/workspace/website/builder/${websiteId}/${resolvedPageId}`,
      { state: { websiteId, pageId: resolvedPageId, pageName, pageSlug } }
    );
  };
  const [previewLoading, setPreviewLoading] = useState(false);

  const handlePreview = async () => {
    const id = activeWebsite?.key;
    // If backend uses Mongo ObjectId, length is 24.
    // If you store other id types, this guard may be too strict.
    if (!id || id.length < 1) {
      message.info("Save your website first to preview it.");
      return;
    }

    setPreviewLoading(true);
    try {
      if (!websiteWizardApi?.previewWebsite) {
        throw new Error("Preview API is not available.");
      }

      const previewData = await websiteWizardApi.previewWebsite(id);
      const pages = previewData?.pages || [];
      const homePage = pages.find((p) => p.isHome) || pages[0];

      const base = previewData?.website?.domain
        ? `https://${previewData.website.domain}`
        : window.location.origin;

      const url = homePage?.slug ? `${base}/${homePage.slug}` : base;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      message.error(err?.message || "Failed to load preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <motion.div variants={itemVariants} className="builder-view-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 700 }} onClick={() => setView("list")}>
        <ArrowLeft size={16} /> Back to Websites
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8, color: 'var(--text-primary)', fontWeight: 900 }}>{activeWebsite.name}</Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>Manage pages, settings, and tracking for this website.</Text>
        </div>
      </div>

      <div style={{ maxWidth: 1200 }}>

        {activeWebsite.isNew && (
          <div style={{ marginBottom: 32, padding: "16px 24px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 12, color: "var(--accent-success)", fontWeight: 600, fontSize: 14 }}>
            Website created successfully. Content was generated from your brief (add OPENAI_API_KEY for full AI generation).
          </div>
        )}

        <Row gutter={32}>
          {/* Left Sidebar */}
          <Col span={8}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              <Card bodyStyle={{ padding: 32 }} style={{ borderRadius: 24, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>WEBSITE NAME</div>
                  <Input size="large" defaultValue={activeWebsite.name} style={{ borderRadius: 8 }} />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>DESCRIPTION</div>
                  <TextArea size="large" defaultValue={activeWebsite.description || ""} style={{ borderRadius: 8, minHeight: 80 }} />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>STATUS</div>
                  <Select size="large" defaultValue="Draft" style={{ width: "100%" }}>
                    <Option value="Draft">Draft</Option>
                    <Option value="Published">Published</Option>
                  </Select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>FAVICON URL</div>
                  <Input size="large" placeholder="https://example.com/favicon.png" style={{ borderRadius: 8 }} />
                </div>

                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>UPLOAD FAVICON</div>
                  <div style={{ border: "1px dashed var(--border-color)", borderRadius: 12, padding: "16px", textAlign: 'center', background: "var(--bg-primary)" }}>
                    <Button size="middle" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", fontWeight: 600, marginBottom: 8 }}>Choose File</Button>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>Max 1MB. Recommended 32x32px.</div>
                  </div>
                </div>

                {/* Tracking Pixels */}
                <div style={{ border: "1px solid var(--border-color)", borderRadius: 16, padding: 24, marginBottom: 32, background: "var(--bg-primary)" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} color="var(--accent-primary)" /> Tracking pixels</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 20, fontWeight: 500 }}>Injected on every public page for this website.</div>

                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 6 }}>META (FB) PIXEL</div>
                      <Input placeholder="123456789012345" style={{ borderRadius: 6, fontSize: 13 }} />
                    </Col>
                    <Col span={12}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 6 }}>GA4 ID</div>
                      <Input placeholder="G-XXXXXXXXXX" style={{ borderRadius: 6, fontSize: 13 }} />
                    </Col>
                  </Row>

                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={12}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 6 }}>GTM ID</div>
                      <Input placeholder="GTM-XXXXXXX" style={{ borderRadius: 6, fontSize: 13 }} />
                    </Col>
                    <Col span={12}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 6 }}>TIKTOK PIXEL</div>
                      <Input placeholder="CXX000000000000X" style={{ borderRadius: 6, fontSize: 13 }} />
                    </Col>
                  </Row>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 6 }}>CUSTOM HEAD CODE</div>
                    <TextArea placeholder="<script>...</script> placed before </head>" style={{ borderRadius: 6, minHeight: 80, fontFamily: "monospace", fontSize: 12 }} />
                  </div>

                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 6 }}>CUSTOM BODY CODE</div>
                    <TextArea placeholder="<noscript>...</noscript> placed after <body>" style={{ borderRadius: 6, minHeight: 80, fontFamily: "monospace", fontSize: 12 }} />
                  </div>
                </div>

                <Button type="primary" size="large" block style={{ background: "var(--accent-primary)", border: "none", borderRadius: 12, fontWeight: 800, height: 48, marginBottom: 16, boxShadow: 'var(--shadow-md)' }}>
                  Save Website Settings
                </Button>

                <Row gutter={16}>
                  <Col span={12}>
                    <Button type="primary" size="large" block style={{ background: "var(--accent-success)", border: "none", borderRadius: 12, fontWeight: 700, height: 48 }}>
                      Publish
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button type="primary" size="large" block style={{ background: "var(--accent-warning)", border: "none", borderRadius: 12, fontWeight: 700, height: 48, color: '#fff' }}>
                      Revert to Draft
                    </Button>
                  </Col>
                </Row>
              </Card>

              <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 24, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15, color: 'var(--text-primary)' }}>Chat widget</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                  Assign a published chat widget to this property. It also appears in the page builder under Chat.
                </div>
                <Select size="large" defaultValue="none" style={{ width: "100%", marginBottom: 16 }}>
                  <Option value="none">— None —</Option>
                </Select>
                <Button size="large" type="primary" block style={{ background: "var(--accent-info)", border: "none", borderRadius: 12, fontWeight: 700, height: 48, marginBottom: 16 }}>
                  Save Widget Assignment
                </Button>
                <div style={{ textAlign: "center", color: "var(--accent-info)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  + Create new chat widget
                </div>
              </Card>

              <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 24, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15, color: 'var(--text-primary)' }}>Custom domain</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                  Connect a domain so visitors reach this property without /shop/ or /p/ paths.
                </div>
                <Button size="large" type="primary" block style={{ background: "var(--accent-primary)", border: "none", borderRadius: 12, fontWeight: 700, height: 48 }}>
                  Connect Domain
                </Button>
              </Card>

            </div>
          </Col>

          {/* Right Area */}
          <Col span={16}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              <div style={{ padding: "20px 24px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 16, fontSize: 14, fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Info size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>Header and footer are synced from your home page. Other pages use them automatically in the builder and when published.</div>
              </div>

              <Card bodyStyle={{ padding: 32 }} style={{ borderRadius: 24, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={22} color="var(--accent-primary)" /> Pages</div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: 13, fontWeight: 700 }}>{activeWebsite.pages} total</div>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32, fontWeight: 500 }}>Home page sets global header & footer for all other pages.</div>

                <div style={{ display: "flex", gap: 16, marginBottom: 40, background: 'var(--bg-primary)', padding: 16, borderRadius: 16, border: '1px solid var(--border-color)' }}>
                  <Input size="large" placeholder="New page title (e.g. Services)" style={{ flex: 1, borderRadius: 8 }} />
                  <Button size="large" type="primary" style={{ background: "var(--text-primary)", border: "none", borderRadius: 8, fontWeight: 800, padding: "0 32px" }}>
                    Add Page
                  </Button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {/* Home Page */}
                  <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 24, marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 10, color: 'var(--text-primary)' }}>
                            Home
                            <Tag style={{ margin: 0, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', border: 'none', fontWeight: 800, borderRadius: 6, fontSize: 10 }}>HOME</Tag>
                          </div>
                          <div style={{ color: "var(--text-tertiary)", fontSize: 13, fontWeight: 500 }}>/home</div>
                        </div>
                      </div>
                      <Select size="large" defaultValue="Draft" style={{ width: 120 }}>
                        <Option value="Draft">Draft</Option>
                        <Option value="Published">Published</Option>
                      </Select>
                    </div>
                    <div style={{ display: 'flex', gap: 12, paddingLeft: 64 }}>
                      <Button type="primary" onClick={() => handleEditInBuilder("Home", "home", null)} style={{ background: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700, padding: "0 20px" }} icon={<PenTool size={14} />}>Edit in Builder</Button>
                      <Button loading={previewLoading} onClick={handlePreview} style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: 'var(--text-primary)', borderRadius: 8, fontWeight: 600, padding: "0 20px" }} icon={<Monitor size={14} />}>Preview</Button>
                      <Button style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: 'var(--text-primary)', borderRadius: 8, fontWeight: 600, padding: "0 20px" }}>Duplicate</Button>
                      <Button danger style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "var(--accent-danger)", borderRadius: 8, fontWeight: 700, padding: "0 20px" }} icon={<Trash2 size={14} />}>Delete</Button>
                    </div>
                  </div>

                  {/* Contact Page */}
                  {(activeWebsite.pages >= 2) && (
                    <div style={{ paddingBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={24} />
                          </div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>Contact</div>
                            <div style={{ color: "var(--text-tertiary)", fontSize: 13, fontWeight: 500 }}>/contact</div>
                          </div>
                        </div>
                        <Select size="large" defaultValue="Draft" style={{ width: 120 }}>
                          <Option value="Draft">Draft</Option>
                          <Option value="Published">Published</Option>
                        </Select>
                      </div>
                      <div style={{ display: 'flex', gap: 12, paddingLeft: 64 }}>
                        <Button type="primary" style={{ background: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700, padding: "0 20px" }} icon={<PenTool size={14} />}>Edit in Builder</Button>
                        <Button loading={previewLoading} onClick={handlePreview} style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: 'var(--text-primary)', borderRadius: 8, fontWeight: 600, padding: "0 20px" }} icon={<Monitor size={14} />}>Preview</Button>
                        <Button style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)", color: 'var(--text-primary)', borderRadius: 8, fontWeight: 600, padding: "0 20px" }}>Duplicate</Button>
                        <Button danger style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "var(--accent-danger)", borderRadius: 8, fontWeight: 700, padding: "0 20px" }} icon={<Trash2 size={14} />}>Delete</Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

            </div>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

const WebsitesTab = ({ itemVariants }) => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState("list");
  const [folderView, setFolderView] = useState("home");
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [websites, setWebsites] = useState([]);
  const [activeWebsite, setActiveWebsite] = useState(null);
  const [view, setView] = useState("list");
  const [pendingWebsiteName, setPendingWebsiteName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("tunepath_websites");
    if (saved) {
      try {
        setWebsites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse websites");
      }
    } else {
      setWebsites([
        { key: '1', name: 'Prestige Estates — Main Website', description: 'Luxury real estate developer portfolio', lastUpdated: '2 days ago', pages: 48, isNew: false },
        { key: '2', name: 'NANA Academy', description: 'Online learning platform for kids', lastUpdated: '1 week ago', pages: 12, isNew: false },
      ])
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tunepath_websites", JSON.stringify(websites));
  }, [websites]);

  const handleCreateWebsite = (data) => {
    if (data.type === "blank" || data.type === "ai") {
      const newWebsite = {
        key: Date.now().toString(),
        name: data.name,
        description: data.description,
        lastUpdated: "Just now",
        pages: data.type === "ai" ? 2 : 1, // AI generates home+contact pages
        isNew: true
      };
      setWebsites([...websites, newWebsite]);
      setIsModalOpen(false);
      setActiveWebsite(newWebsite);
      setView("manage");
    } else if (data.type === "templates") {
      setPendingWebsiteName(data.name);
      setView("templates");
      setIsModalOpen(false);
    }
  };

  // Called once a template card is picked on WebsiteTemplatePage.
  const handleTemplateSelected = (website) => {
    const newWebsite = {
      key: website._id || website.id || Date.now().toString(),
      name: website.name,
      description: website.description || "",
      lastUpdated: "Just now",
      pages: (website.pages && website.pages.length) || 1,
      isNew: true,
      rawPages: website.pages, // full page objects for WebsiteEditPage
    };
    setWebsites((prev) => [...prev, newWebsite]);
    setActiveWebsite(newWebsite);
    setView("edit");
  };

  if (view === "templates") {
    return (
      <WebsiteTemplatePage
        websiteName={pendingWebsiteName}
        onBack={() => setView("list")}
        onSelectTemplate={handleTemplateSelected}
      />
    );
  }

  if (view === "edit" && activeWebsite) {
    return (
      <WebsiteEditPage
        website={{ ...activeWebsite, pages: activeWebsite.rawPages }}
        justCreated
        onBack={() => setView("list")}
        onChange={(next) =>
          setActiveWebsite((prev) => ({ ...prev, name: next.name, description: next.description, rawPages: next.pages }))
        }
      />
    );
  }

  if (view === "manage" && activeWebsite) {
    return <ManageWebsiteView activeWebsite={activeWebsite} setView={setView} itemVariants={itemVariants} />;
  }

  const columns = [
    {
      title: "NAME",
      dataIndex: "name",
      key: "name",
      render: (t, r) => (
        <div>
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 15 }}>{t}</span>
          {r.description && <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, fontWeight: 500 }}>{r.description}</div>}
        </div>
      )
    },
    {
      title: "LAST UPDATED",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      render: (t) => <Text style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t}</Text>
    },
    {
      title: "PAGES",
      dataIndex: "pages",
      key: "pages",
      render: (t) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t}</span>
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <Space>
          <span
            style={{ color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => {
              setActiveWebsite({ ...r, isNew: false });
              setView("manage");
            }}
          >
            Manage <ArrowRight size={14} />
          </span>
        </Space>
      )
    },
  ];

  return (
    <motion.div variants={itemVariants}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Monitor size={24} color="var(--accent-primary)" /> Websites
          </Title>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
            Build custom websites to showcase your products and build a trusted brand.
          </Text>
        </div>
        <Space>
          <Button size="large" icon={<Folder size={18} />} style={{ borderRadius: 8, fontWeight: 700, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)', height: 44 }}>Folders</Button>
          <Button
            size="large"
            icon={<Sparkles size={18} />}
            onClick={() => setIsModalOpen(true)}
            style={{ color: "var(--accent-secondary)", borderColor: "var(--accent-secondary)", background: "rgba(13, 148, 136, 0.05)", borderRadius: 8, fontWeight: 800, height: 44, padding: '0 20px' }}
          >
            Build with AI <Tag style={{ margin: '0 0 0 8px', background: 'var(--accent-secondary)', color: '#fff', border: 'none', borderRadius: 12, padding: '2px 8px', fontSize: 10 }}>BETA</Tag>
          </Button>
          <Button
            size="large"
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => setIsModalOpen(true)}
            style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: 8, fontWeight: 800, height: 44, padding: '0 24px', boxShadow: 'var(--shadow-md)' }}
          >
            New Website
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, borderBottom: '2px solid var(--border-color)' }}>
          <div style={{ padding: '8px 16px', fontWeight: folderView === 'home' ? 800 : 600, color: folderView === 'home' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: folderView === 'home' ? '3px solid var(--accent-primary)' : '3px solid transparent', marginBottom: -2, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setFolderView("home")}>Home</div>
          <div style={{ padding: '8px 16px', fontWeight: folderView === 'unfiled' ? 800 : 600, color: folderView === 'unfiled' ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: folderView === 'unfiled' ? '3px solid var(--accent-primary)' : '3px solid transparent', marginBottom: -2, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setFolderView("unfiled")}>Unfiled</div>
        </div>

        <Space>
          <Radio.Group value={viewType} onChange={(e) => setViewType(e.target.value)} size="large" style={{ background: 'var(--bg-secondary)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
            <Radio.Button value="recent" style={{ borderRadius: 8, border: 'none', background: viewType === 'recent' ? 'var(--bg-primary)' : 'transparent', color: viewType === 'recent' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, boxShadow: viewType === 'recent' ? 'var(--shadow-sm)' : 'none' }}>Recent</Radio.Button>
            <Radio.Button value="list" style={{ borderRadius: 8, border: 'none', background: viewType === 'list' ? 'var(--bg-primary)' : 'transparent', color: viewType === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, boxShadow: viewType === 'list' ? 'var(--shadow-sm)' : 'none' }}>List</Radio.Button>
          </Radio.Group>

          <Input
            size="large"
            placeholder="Search for Websites"
            prefix={<Search size={16} color="var(--text-tertiary)" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 10 }}
          />
        </Space>
      </div>

      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <Table
          columns={columns}
          dataSource={websites.filter(w => w.name.toLowerCase().includes(searchText.toLowerCase()))}
          pagination={false}
          locale={{
            emptyText: (
              <div style={{ padding: "80px 0", textAlign: "center" }}>
                <div style={{ width: 80, height: 80, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Monitor size={40} />
                </div>
                <Title level={4} style={{ marginBottom: 12, color: 'var(--text-primary)', fontWeight: 800 }}>No websites yet</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 15, fontWeight: 500 }}>
                  Create your first website from blank or from a template.
                </Text>
                <Button type="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)} style={{ borderRadius: 8, height: 44, background: 'var(--accent-primary)', border: 'none', fontWeight: 700, padding: '0 32px' }}>New Website</Button>
              </div>
            )
          }}
        />
      </Card>


      <TemplateLibraryModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onCreate={(payload) => {
          // payload shape from TemplateLibraryModal:
          //   { website, websiteName, description, source, templateName,
          //     templateZipCloudinaryUrl, pages }
          // For ZIP uploads, payload.website is the MongoDB Website doc returned
          // by the backend; payload.pages are the persisted WebsitePage docs.
          const backendWebsite = payload.website; // may be undefined for prebuilt templates
          const newWebsite = {
            // Use real MongoDB _id if available so WebsiteEditPage.fetchPages() works
            _id: backendWebsite?._id || null,
            key: backendWebsite?._id || Date.now().toString(),
            name: payload.websiteName || backendWebsite?.name || "Untitled Website",
            description: payload.description || backendWebsite?.description || "Website Template",
            lastUpdated: "Just now",
            pages: (payload.pages && payload.pages.length) || 1,
            isNew: true,
            rawPages: payload.pages || [], // persisted or locally-parsed page objects
          };
          setWebsites((prev) => [...prev, newWebsite]);
          setActiveWebsite(newWebsite);
          setView("edit");
          setIsModalOpen(false);
        }}
      />
    </motion.div>
  );
};

export default WebsitesTab;