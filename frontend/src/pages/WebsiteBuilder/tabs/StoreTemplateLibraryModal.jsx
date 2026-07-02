import React, { useState, useRef, useEffect, useMemo } from "react";
import { Modal, Input, Checkbox, Button, Typography, Space, Row, Col, Card, Tag, Empty, message } from "antd";
import { Store, X as CloseIcon, Search as SearchIcon, CheckCircle, UploadCloud, Eye } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { storeTemplateApi } from "../../../api/storeTemplateApi";
import { storeApi } from "../../../api/storeApi";

const { Title, Text } = Typography;

const CATEGORIES = [
  "Automotive",
  "Baby & Kids",
  "Beauty & Personal Care",
  "Electronics",
  "Fashion & Apparel",
  "Grocery & Food",
  "Health & Wellness",
  "Home & Living",
];

const PALETTE = [
  "linear-gradient(135deg, #7f1d1d, #450a0a)",
  "linear-gradient(135deg, #1f2937, #030712)",
  "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
  "linear-gradient(135deg, #374151, #111827)",
  "linear-gradient(135deg, #0d9488, #134e4a)",
];

// Local demo set — shown immediately and kept as a fallback if the
// /api/store-templates library fetch fails or is empty.
const FALLBACK_TEMPLATES = [
  { id: 1, name: "AutoSphere", type: "Automotive", bg: PALETTE[0] },
  { id: 2, name: "DriveNest", type: "Automotive", bg: PALETTE[1] },
  { id: 3, name: "TurboKart", type: "Automotive", bg: PALETTE[2] },
  { id: 4, name: "MotoCraft", type: "Automotive", bg: PALETTE[3] },
];

const StoreTemplateLibraryModal = ({ open, onCancel, onCreate, initialStoreName }) => {
  const { role } = useAuth();
  // Only admins and super admins are allowed to upload store templates to the library
  const canUploadTemplate = role === "admin" || role === "superadmin";

  const [storeName, setStoreName] = useState(initialStoreName || "");
  const [installDemo, setInstallDemo] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null); // null = "All templates"
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Pull the real library from the backend (StoreTemplate collection) each
  // time the modal opens. Falls back to the local demo set on error so the
  // modal still works if the API isn't reachable.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingTemplates(true);

    storeTemplateApi
      .getAllStoreTemplates()
      .then((data) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setTemplates(
          data.map((t, i) => ({
            id: t._id || t.id,
            name: t.name,
            type: t.category || "Other",
            thumbnail: t.thumbnail || "",
            preview: t.preview || "",
            bg: PALETTE[i % PALETTE.length],
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to load store template library", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingTemplates(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // ── Search + category filter ──────────────────────────────────────────
  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      const matchesCategory = !activeCategory || t.type === activeCategory;
      const matchesSearch =
        !q ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.type || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [templates, search, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    templates.forEach((t) => {
      counts[t.type] = (counts[t.type] || 0) + 1;
    });
    return counts;
  }, [templates]);

  const handleUploadClick = () => {
    if (!canUploadTemplate) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !canUploadTemplate) return;

    const displayName = file.name.replace(/\.[^/.]+$/, "");

    // Reflect the upload in the grid immediately for a snappy UI.
    const newTemplate = {
      id: `pending-${Date.now()}`,
      name: displayName,
      type: "Other",
      bg: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    };
    setTemplates((prev) => [newTemplate, ...prev]);

    // Persist to the backend store-template library (StoreTemplate collection),
    // same import pipeline used by the website module, separate collections.
    setUploading(true);
    try {
      const saved = await storeTemplateApi.createStoreTemplate({
        file,
        name: displayName,
        category: "Other",
        description: "",
        pages: [],
        status: "Published",
        uploadedByRole: role,
      });

      // Reconcile the placeholder card with the persisted StoreTemplate record.
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === newTemplate.id
            ? {
                ...t,
                id: saved?._id || t.id,
                type: saved?.category || t.type,
                thumbnail: saved?.thumbnail,
                preview: saved?.preview,
              }
            : t
        )
      );
      message.success(`"${file.name}" was uploaded to the store template library.`);
    } catch (err) {
      console.error("Failed to persist store template", err);
      message.error(`Couldn't save "${file.name}" to the server. It's shown locally only.`);
    } finally {
      setUploading(false);
    }
  };

  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!storeName || !template) return;

    setCreating(true);
    try {
      // Flow: Choose Template -> Clone Template -> Create Store ->
      //       Create Default Pages -> Copy Demo Products -> Return Store
      const result = await storeApi.createStoreFromTemplate({
        templateId: template.id,
        storeName,
        installDemo,
      });
      message.success(`"${storeName}" was created.`);
      onCreate({ storeName, template: template.name, installDemo, ...result });
    } catch (err) {
      console.error("Failed to create store from template", err);
      message.error(`Couldn't create the store: ${err.message || "unknown error"}`);
    } finally {
      setCreating(false);
    }
  };

  const openPreview = (e, template) => {
    e.stopPropagation();
    setPreviewTemplate(template);
  };

  const useTemplateFromPreview = () => {
    if (previewTemplate) setSelectedTemplate(previewTemplate.id);
    setPreviewTemplate(null);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      closeIcon={<Button type="text" icon={<CloseIcon size={20} />} onClick={onCancel} style={{ color: "var(--text-secondary)" }} />}
      style={{ top: 40 }}
      bodyStyle={{ padding: 0, borderRadius: 16, overflow: "hidden" }}
      className="glassmorphism-modal"
    >
      <div style={{ display: "flex", height: "80vh", maxHeight: 800 }}>
        {/* Sidebar */}
        <div style={{ width: 250, borderRight: "1px solid var(--border-color)", padding: "24px 16px", overflowY: "auto", background: "var(--bg-secondary)", display: "flex", flexDirection: "column" }}>
          <Title level={4} style={{ marginBottom: 24, fontSize: 18, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
            <Store size={20} color="var(--accent-success)" /> Store Templates
          </Title>

          {/* Category filter: "All templates" */}
          <div
            onClick={() => setActiveCategory(null)}
            style={{
              background: !activeCategory ? "rgba(16, 185, 129, 0.1)" : "transparent",
              color: !activeCategory ? "var(--accent-success)" : "var(--text-primary)",
              padding: "10px 16px",
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={16} /> All templates</span>
            <Tag style={{ margin: 0, borderRadius: 12, background: !activeCategory ? "rgba(16, 185, 129, 0.2)" : "var(--bg-primary)", border: "none", color: !activeCategory ? "var(--accent-success)" : "var(--text-tertiary)" }}>
              {templates.length}
            </Tag>
          </div>

          <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 16, display: "block" }}>BROWSE CATEGORIES</Text>

          {/* Category filter: individual categories */}
          <Space direction="vertical" style={{ width: "100%" }}>
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                onClick={() => setActiveCategory((prev) => (prev === cat ? null : cat))}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: activeCategory === cat ? "rgba(16, 185, 129, 0.1)" : "transparent",
                }}
              >
                <span style={{ color: activeCategory === cat ? "var(--accent-success)" : "var(--text-secondary)", fontWeight: 500, fontSize: 14 }}>{cat}</span>
                <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{categoryCounts[cat] || 0}</span>
              </div>
            ))}
          </Space>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
          <div style={{ padding: 24, borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Title level={4} style={{ margin: 0, fontSize: 18, color: "var(--text-primary)" }}>Store templates</Title>
                <Text type="secondary">
                  Showing {filteredTemplates.length} of {templates.length} template(s)
                  {activeCategory ? ` in ${activeCategory}` : ""} — demo catalog adds sample products when enabled
                </Text>
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
                      accept=".zip"
                      onChange={handleFileSelected}
                      style={{ display: "none" }}
                    />
                  </>
                )}
                {/* Search */}
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                  placeholder="Search templates..."
                  prefix={<SearchIcon size={16} color="var(--text-tertiary)" />}
                  style={{ width: 250, borderRadius: 8, height: 40 }}
                />
              </Space>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            {filteredTemplates.length === 0 ? (
              <Empty
                description={loadingTemplates ? "Loading templates…" : "No templates match your search."}
                style={{ marginTop: 80 }}
              />
            ) : (
              <Row gutter={[24, 24]}>
                {filteredTemplates.map((template) => (
                  <Col span={12} key={template.id}>
                    <Card
                      hoverable
                      onClick={() => setSelectedTemplate(template.id)}
                      style={{
                        borderRadius: 16,
                        overflow: "hidden",
                        border: selectedTemplate === template.id ? "2px solid var(--accent-success)" : "1px solid var(--border-color)",
                        boxShadow: selectedTemplate === template.id ? "0 4px 20px rgba(16, 185, 129, 0.15)" : "var(--shadow-sm)",
                        background: "var(--bg-secondary)",
                        padding: 0,
                      }}
                      bodyStyle={{ padding: 0 }}
                    >
                      <div style={{ height: 160, background: template.bg, padding: 24, color: "#fff", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, position: "relative", zIndex: 2 }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ width: 28, height: 28, background: "rgba(255,255,255,0.2)", borderRadius: 6, marginRight: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{template.name.charAt(0)}</div>
                            <span style={{ fontWeight: 800, fontSize: 16 }}>{template.name}</span>
                          </div>
                          <Space>
                            {/* Preview */}
                            <Button
                              size="small"
                              onClick={(e) => openPreview(e, template)}
                              icon={<Eye size={14} />}
                              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", fontWeight: 600, borderRadius: 6 }}
                            >
                              Preview
                            </Button>
                          </Space>
                        </div>
                        <div style={{ position: "relative", zIndex: 2 }}>
                          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, marginBottom: 4, color: "rgba(255,255,255,0.8)" }}>ONLINE STORE</div>
                          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{template.name}</div>
                          <div style={{ fontSize: 12, opacity: 0.8, maxWidth: "80%", fontWeight: 500 }}>Parts, care & accessories. Shop {template.name} for curated {template.type} products.</div>
                        </div>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)", zIndex: 1 }} />
                      </div>
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 16, color: "var(--text-primary)" }}>{template.name}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>{template.type} · 3 collections · 6 products</div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>

          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", background: "var(--bg-secondary)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ width: 300 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Store name</div>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                style={{ borderRadius: 8, height: 44, fontSize: 15 }}
              />
            </div>

            <Space size="large">
              {/* Install Demo */}
              <Checkbox checked={installDemo} onChange={(e) => setInstallDemo(e.target.checked)} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Install demo products & preview storefront
              </Checkbox>
              <Space>
                <Button onClick={onCancel} style={{ borderRadius: 8, height: 44, fontWeight: 600, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", padding: "0 24px" }}>Back</Button>
                {/* Create Store */}
                <Button
                  type="primary"
                  onClick={handleCreate}
                  disabled={!storeName || !selectedTemplate}
                  loading={creating}
                  style={{ backgroundColor: "var(--accent-success)", border: "none", borderRadius: 8, height: 44, fontWeight: 700, padding: "0 24px" }}
                  icon={<CheckCircle size={16} />}
                >
                  Create store
                </Button>
              </Space>
            </Space>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        open={!!previewTemplate}
        onCancel={() => setPreviewTemplate(null)}
        footer={null}
        width={720}
        title={previewTemplate?.name}
      >
        {previewTemplate && (
          <div>
            {previewTemplate.preview ? (
              <iframe
                title={`${previewTemplate.name} preview`}
                src={previewTemplate.preview}
                style={{ width: "100%", height: 420, border: "1px solid var(--border-color)", borderRadius: 8 }}
              />
            ) : (
              <div style={{ height: 240, borderRadius: 12, background: previewTemplate.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 28 }}>
                {previewTemplate.name}
              </div>
            )}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Text type="secondary">{previewTemplate.type} template</Text>
              <Button type="primary" onClick={useTemplateFromPreview} style={{ backgroundColor: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}>
                Use this template
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Modal>
  );
};

export default StoreTemplateLibraryModal;