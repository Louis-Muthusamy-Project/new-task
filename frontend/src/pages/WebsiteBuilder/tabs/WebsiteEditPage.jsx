import React, { useState } from "react";
import { Typography, Input, Select, Button, Row, Col, Space } from "antd";
import {
  CheckCircle2,
  Pencil,
  Eye,
  Copy,
  Trash2,
  Plus,
  Home as HomeIcon,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

let idCounter = 0;
const nextId = () => `pg-${Date.now()}-${idCounter++}`;

const WebsiteEditPage = ({ website: initialWebsite, onBack, onChange, justCreated = true }) => {
  const [website, setWebsite] = useState(() => ({
    name: initialWebsite?.name || "Untitled Website",
    description: initialWebsite?.description || "Website Template",
    status: initialWebsite?.status || "Draft",
    faviconUrl: initialWebsite?.faviconUrl || "",
    tracking: {
      metaPixelId: "",
      ga4Id: "",
      gtmId: "",
      tiktokPixelId: "",
      customHeadCode: "",
      customBodyCode: "",
      ...(initialWebsite?.tracking || {}),
    },
    chatWidgetId: initialWebsite?.chatWidgetId || null,
    domain: initialWebsite?.domain || null,
    pages: initialWebsite?.pages || []
  }));

  const [newPageTitle, setNewPageTitle] = useState("");
  const [showBanner, setShowBanner] = useState(justCreated);
  const [savedNotice, setSavedNotice] = useState(null);

  const commit = (next) => {
    setWebsite(next);
    onChange && onChange(next);
  };

  const updateField = (field, value) => {
    commit({ ...website, [field]: value });
    console.log(website)
  };

  const updateTracking = (field, value) => {
    commit({ ...website, tracking: { ...website.tracking, [field]: value } });
  };

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page";

  const addPage = () => {
    const title = newPageTitle.trim();
    if (!title) return;
    const baseSlug = slugify(website.name);
    const page = {
      id: nextId(),
      name: title,
      slug: `${baseSlug}-${slugify(title)}`,
      isHome: false,

      status: "Draft",
    };
    commit({ ...website, pages: [...website.pages, page] });
    setNewPageTitle("");
  };

  const setHomePage = (id) => {
    commit({
      ...website,
      pages: website.pages.map((p) => ({ ...p, isHome: p.id === id })),
    });
  };

  const updatePageStatus = (id, status) => {
    commit({
      ...website,
      pages: website.pages.map((p) => (p.id === id ? { ...p, status } : p)),
    });
  };

  const duplicatePage = (id) => {
    const source = website.pages.find((p) => p.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: nextId(),
      name: `${source.name} Copy`,
      slug: source.slug.endsWith('-copy') ? source.slug : `${source.slug}-copy`,

      isHome: false,
    };
    commit({ ...website, pages: [...website.pages, copy] });
  };

  const deletePage = (id) => {
    const remaining = website.pages.filter((p) => p.id !== id);
    commit({ ...website, pages: remaining });
  };

  const handleSaveWebsite = () => {
    setSavedNotice("Website saved.");
    setTimeout(() => setSavedNotice(null), 2500);
    console.log("hgjgj")
  };

  const handlePublishToggle = (status) => {
    updateField("status", status);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 20,
          borderBottom: "1px solid var(--border-color)",
          marginBottom: 20,
        }}
      >
        <Title level={3} style={{ margin: 0, color: "var(--text-primary)" }}>
          {website.name}
        </Title>
        <Button
          onClick={onBack}
          style={{
            borderRadius: 8,
            height: 40,
            fontWeight: 600,
            borderColor: "var(--border-color)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            padding: "0 20px",
          }}
        >
          Back
        </Button>
      </div>

      {showBanner && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "var(--accent-success)",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={18} /> Website created successfully.
          </span>
          <Button type="text" onClick={() => setShowBanner(false)} style={{ color: "var(--accent-success)", fontWeight: 600 }}>
            Dismiss
          </Button>
        </div>
      )}

      <Row gutter={24}>
        {/* Left column: website details + tracking + chat widget + domain */}
        <Col xs={24} lg={11}>
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Field label="Website Name">
              <Input value={website.name} onChange={(e) => updateField("name", e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Description">
              <TextArea
                value={website.description}
                onChange={(e) => updateField("description", e.target.value)}
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ borderRadius: 8 }}
              />
            </Field>

            <Field label="Status">
              <Select
                value={website.status}
                onChange={(v) => updateField("status", v)}
                style={{ width: "100%" }}
                options={[
                  { value: "Draft", label: "Draft" },
                  { value: "Published", label: "Published" },
                ]}
              />
            </Field>

            <Field label="Favicon URL">
              <Input
                placeholder="https://example.com/favicon.png"
                value={website.faviconUrl}
                onChange={(e) => updateField("faviconUrl", e.target.value)}
                style={inputStyle}
              />
            </Field>

            <Field label="Upload Favicon">
              <input
                type="file"
                accept="image/*"
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </Field>

            {/* Tracking pixels */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <Title level={5} style={{ margin: 0, color: "var(--text-primary)" }}>Tracking pixels</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>Injected on every public page for this website.</Text>

              <Row gutter={12} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Field label="META (FACEBOOK) PIXEL ID" small>
                    <Input
                      placeholder="1234567890123456"
                      value={website.tracking.metaPixelId}
                      onChange={(e) => updateTracking("metaPixelId", e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                </Col>
                <Col span={12}>
                  <Field label="GOOGLE ANALYTICS 4 ID" small>
                    <Input
                      placeholder="G-XXXXXXXXXX"
                      value={website.tracking.ga4Id}
                      onChange={(e) => updateTracking("ga4Id", e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                </Col>
                <Col span={12}>
                  <Field label="GOOGLE TAG MANAGER ID" small>
                    <Input
                      placeholder="GTM-XXXXXXX"
                      value={website.tracking.gtmId}
                      onChange={(e) => updateTracking("gtmId", e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                </Col>
                <Col span={12}>
                  <Field label="TIKTOK PIXEL ID" small>
                    <Input
                      placeholder="CXXXXXXXXXXXXXXXXXXX"
                      value={website.tracking.tiktokPixelId}
                      onChange={(e) => updateTracking("tiktokPixelId", e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                </Col>
              </Row>

              <Field label="CUSTOM HEAD CODE" small>
                <TextArea
                  placeholder="<script>...</script> placed before </head>"
                  value={website.tracking.customHeadCode}
                  onChange={(e) => updateTracking("customHeadCode", e.target.value)}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  style={{ borderRadius: 8, fontFamily: "monospace", fontSize: 13 }}
                />
              </Field>

              <Field label="CUSTOM BODY CODE" small>
                <TextArea
                  placeholder="<noscript>...</noscript> placed after <body>"
                  value={website.tracking.customBodyCode}
                  onChange={(e) => updateTracking("customBodyCode", e.target.value)}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  style={{ borderRadius: 8, fontFamily: "monospace", fontSize: 13 }}
                />
              </Field>
            </div>

            <Button
              block
              onClick={handleSaveWebsite}
              style={{
                marginTop: 20,
                height: 46,
                borderRadius: 10,
                background: "var(--accent-secondary)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Save Website
            </Button>
            {savedNotice && (
              <Text style={{ display: "block", marginTop: 8, color: "var(--accent-success)", fontWeight: 600, fontSize: 13 }}>
                {savedNotice}
              </Text>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <Button
                onClick={() => handlePublishToggle("Published")}
                style={{ flex: 1, height: 46, borderRadius: 10, background: "var(--accent-success)", color: "#fff", border: "none", fontWeight: 700 }}
              >
                Publish
              </Button>
              <Button
                onClick={() => handlePublishToggle("Draft")}
                style={{ flex: 1, height: 46, borderRadius: 10, background: "var(--accent-warning)", color: "#fff", border: "none", fontWeight: 700 }}
              >
                Draft
              </Button>
            </div>

            {/* Chat widget */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-color)" }}>
              <Title level={5} style={{ margin: 0, color: "var(--text-primary)" }}>Chat widget</Title>
              <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 14 }}>
                Assign a published chat widget to this property. It also appears in the page builder under Chat.
              </Text>
              <Select
                value={website.chatWidgetId}
                onChange={(v) => updateField("chatWidgetId", v)}
                style={{ width: "100%", marginBottom: 14 }}
                placeholder="— None —"
                options={[{ value: null, label: "— None —" }]}
              />
              <Button block style={{ height: 44, borderRadius: 10, background: "var(--accent-info)", color: "#fff", border: "none", fontWeight: 700 }}>
                Save chat widget
              </Button>
              <Button type="link" style={{ display: "block", textAlign: "center", marginTop: 8, fontWeight: 600 }}>
                + Create new chat widget
              </Button>
            </div>

            {/* Custom domain */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-color)" }}>
              <Title level={5} style={{ margin: 0, color: "var(--text-primary)" }}>Custom domain</Title>
              <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 14 }}>
                Connect a domain so visitors reach this property without /shop/ or /p/ paths.
              </Text>
              <Button block style={{ height: 46, borderRadius: 10, background: "var(--accent-secondary)", color: "#fff", border: "none", fontWeight: 700 }}>
                Connect domain
              </Button>
            </div>
          </div>
        </Col>

        {/* Right column: pages */}
        <Col xs={24} lg={13}>
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                color: "var(--accent-warning)",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              Mark one page as <strong>Home</strong> and save it in the builder so other pages can reuse its header and footer.
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <Title level={5} style={{ margin: 0, color: "var(--text-primary)" }}>Pages</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{website.pages.length} total</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 16 }}>
              Home page sets global header &amp; footer for all other pages.
            </Text>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <Input
                placeholder="New page title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                onPressEnter={addPage}
                style={{ ...inputStyle, flex: 1 }}
              />
              <Button
                icon={<Plus size={16} />}
                onClick={addPage}
                style={{ height: 44, borderRadius: 10, background: "#111827", color: "#fff", border: "none", fontWeight: 700, padding: "0 18px" }}
              >
                Add page
              </Button>
            </div>

            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              {website.pages.map((page) => (
                <div
                  key={page.id}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: 12,
                    padding: 18,
                    background: "var(--bg-primary)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Text strong style={{ fontSize: 16, color: "var(--text-primary)" }}>{page.name}</Text>
                        {page.isHome && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              letterSpacing: 0.5,
                              color: "var(--accent-secondary)",
                              background: "rgba(99, 102, 241, 0.12)",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            HOME
                          </span>
                        )}
                      </div>
                      <Text type="secondary" style={{ fontSize: 13, fontFamily: "monospace" }}>{page.slug}</Text>
                    </div>
                    <Select
                      value={page.status}
                      onChange={(v) => updatePageStatus(page.id, v)}
                      size="small"
                      style={{ width: 110 }}
                      options={[
                        { value: "Draft", label: "Draft" },
                        { value: "Published", label: "Published" },
                      ]}
                    />
                  </div>

                  <Space wrap>
                    <Button
                      size="small"
                      icon={<Pencil size={13} />}
                      style={{ borderRadius: 8, background: "var(--accent-secondary)", color: "#fff", border: "none", fontWeight: 600 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      icon={<Eye size={13} />}
                      style={{ borderRadius: 8, background: "var(--accent-success)", color: "#fff", border: "none", fontWeight: 600 }}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      icon={<Copy size={13} />}
                      onClick={() => duplicatePage(page.id)}
                      style={{ borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", fontWeight: 600 }}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="small"
                      icon={<Trash2 size={13} />}
                      onClick={() => deletePage(page.id)}
                      style={{ borderRadius: 8, background: "transparent", color: "var(--accent-danger)", border: "1px solid var(--accent-danger)", fontWeight: 600 }}
                    >
                      Delete
                    </Button>
                    {!page.isHome && (
                      <Button
                        size="small"
                        icon={<HomeIcon size={13} />}
                        onClick={() => setHomePage(page.id)}
                        style={{ borderRadius: 8, borderColor: "var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}
                      >
                        Make Home
                      </Button>
                    )}
                  </Space>
                </div>
              ))}
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
};

const Field = ({ label, small, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div
      style={{
        fontSize: small ? 11 : 12,
        fontWeight: 700,
        letterSpacing: small ? 0.5 : 0,
        color: small ? "var(--text-secondary)" : "var(--text-primary)",
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

const inputStyle = { borderRadius: 8, height: 40 };

export default WebsiteEditPage;
