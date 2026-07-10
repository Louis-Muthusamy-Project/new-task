import React, { useState, useEffect, useRef } from "react";
import { Modal, Input, Button, Typography, Space, Row, Col, Card, Tag, message } from "antd";
import { LayoutTemplate, Search as SearchIcon, CheckCircle, X as CloseIcon, UploadCloud } from "lucide-react";
import { funnelApi } from "../../../api/funnelApi";
import { useAuth } from "../../../contexts/AuthContext";

const { Title, Text } = Typography;

const FunnelTemplateLibraryModal = ({ open, onCancel, onCreate, initialFunnelName }) => {
  const { role } = useAuth();
  // Only admins and super admins are allowed to upload funnel templates to
  // the library — mirrors StoreTemplateLibraryModal's canUploadTemplate gate.
  const canUploadTemplate = role === "admin" || role === "superadmin";

  const [funnelName, setFunnelName] = useState(initialFunnelName || "");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const categories = [
    "All",
    "Lead Generation",
    "Sales",
    "Course",
    "Agency",
    "Appointment",
    "Webinar",
    "Ecommerce",
  ];

  useEffect(() => {
    if (initialFunnelName) {
      setFunnelName(initialFunnelName);
    }
  }, [initialFunnelName]);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, activeCategory, searchText]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const categoryFilter = activeCategory === "All" ? undefined : activeCategory;
      const data = await funnelApi.listTemplates({ category: categoryFilter, search: searchText || undefined });
      setTemplates(data || []);
    } catch (err) {
      message.error(err.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  };

  // Funnel templates are structured JSON (name/category/steps) rather than
  // HTML/asset bundles, so "upload" here means a .json blueprint file,
  // parsed client-side and persisted via funnelApi.createTemplate — no
  // multipart/ZIP pipeline needed, unlike the Store template importer.
  const handleUploadClick = () => {
    if (!canUploadTemplate) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !canUploadTemplate) return;

    if (!/\.json$/i.test(file.name)) {
      message.error("Please upload a .json funnel template file.");
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (parseErr) {
        throw new Error("That file isn't valid JSON.");
      }

      const name = parsed.name || file.name.replace(/\.[^/.]+$/, "");
      if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        throw new Error("The template JSON must include a non-empty \"steps\" array.");
      }

      const saved = await funnelApi.createTemplate({
        name,
        description: parsed.description || "",
        category: parsed.category || "Other",
        thumbnailUrl: parsed.thumbnailUrl || "",
        steps: parsed.steps,
        tags: parsed.tags || [],
        isSystem: false,
      });

      setTemplates((prev) => [saved, ...prev]);
      message.success(`"${saved.name}" was uploaded to the funnel template library.`);
    } catch (err) {
      console.error("Failed to upload funnel template", err);
      message.error(err.message || `Couldn't upload "${file.name}".`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = () => {
    if (!funnelName.trim()) {
      return message.warning("Please enter a funnel name.");
    }
    if (!selectedTemplate) {
      return message.warning("Please select a template.");
    }

    onCreate({ 
      name: funnelName, 
      templateId: selectedTemplate,
      type: "template"
    });
    setSelectedTemplate(null);
  };

  const fallbackGradients = [
    "linear-gradient(135deg, #1e293b, #0f172a)",
    "linear-gradient(135deg, #d97706, #b45309)",
    "linear-gradient(135deg, #334155, #1e293b)",
    "linear-gradient(135deg, #4f46e5, #3730a3)",
    "linear-gradient(135deg, #0891b2, #155e75)",
  ];

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

          <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 16, display: "block" }}>BROWSE CATEGORIES</Text>
          
          <Space direction="vertical" style={{ width: "100%", flex: 1 }} size={4}>
            {categories.map(cat => (
              <div 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "8px 12px", 
                  cursor: "pointer",
                  borderRadius: 8,
                  background: activeCategory === cat ? "rgba(13, 148, 136, 0.1)" : "transparent",
                  color: activeCategory === cat ? "var(--accent-secondary)" : "var(--text-secondary)",
                  fontWeight: activeCategory === cat ? 700 : 500,
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: 14 }}>{cat}</span>
              </div>
            ))}
          </Space>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
          <div style={{ padding: 24, borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Title level={4} style={{ margin: 0, fontSize: 18, color: "var(--text-primary)" }}>Funnels</Title>
                <Text type="secondary">Prebuilt funnel structures & templates</Text>
              </div>
              <Space>
                {canUploadTemplate && (
                  <>
                    <Button
                      icon={<UploadCloud size={16} />}
                      onClick={handleUploadClick}
                      loading={uploading}
                      style={{ borderRadius: 8, height: 40, fontWeight: 600, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
                    >
                      Upload template
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelected}
                      style={{ display: "none" }}
                    />
                  </>
                )}
                <Input 
                  placeholder="Search templates..." 
                  prefix={<SearchIcon size={16} color="var(--text-tertiary)"/>} 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250, borderRadius: 8, height: 40 }} 
                />
              </Space>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
              {activeCategory} Templates
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24 }}>
              Select a funnel journey blueprint to clone
            </div>
            
            {loading ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <Text>Loading templates...</Text>
              </div>
            ) : templates.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", border: "2px dashed var(--border-color)", borderRadius: 16 }}>
                <Text type="secondary">No templates found in this category.</Text>
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {templates.map((template, idx) => {
                  const isSelected = selectedTemplate === template._id;
                  const bgGradient = fallbackGradients[idx % fallbackGradients.length];
                  return (
                    <Col span={8} key={template._id}>
                      <Card 
                        hoverable 
                        onClick={() => setSelectedTemplate(template._id)}
                        style={{ 
                          borderRadius: 16, 
                          overflow: "hidden",
                          border: isSelected ? "2px solid var(--accent-secondary)" : "1px solid var(--border-color)",
                          boxShadow: isSelected ? "0 4px 20px rgba(13, 148, 136, 0.15)" : "var(--shadow-sm)",
                          background: "var(--bg-secondary)",
                          padding: 0
                        }}
                        styles={{ body: { padding: 0 } }}
                      >
                        <div style={{ height: 180, background: template.thumbnailUrl ? `url(${template.thumbnailUrl}) center/cover no-repeat` : bgGradient, position: 'relative', overflow: 'hidden' }}>
                          {!template.thumbnailUrl && (
                            <>
                              <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 24, background: 'rgba(255,255,255,0.15)', borderRadius: 6 }} />
                              <div style={{ position: 'absolute', top: 64, left: 20, right: 20, bottom: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }} />
                            </>
                          )}
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>{template.name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: isSelected ? 8 : 0 }}>
                            {template.category} ({template.steps?.length || 0} Steps)
                          </div>
                          
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
            )}
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