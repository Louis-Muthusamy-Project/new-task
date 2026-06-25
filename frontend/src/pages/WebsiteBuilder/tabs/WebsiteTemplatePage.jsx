import React, { useEffect, useMemo, useState } from "react";
import { Input, Select, Button, Row, Col, Typography, Empty, Spin, Tag } from "antd";
import { Search, ArrowLeft, LayoutTemplate, CheckCircle2 } from "lucide-react";

const { Title, Text } = Typography;

const CATEGORIES = [
  "All",
  "Real Estate",
  "E-commerce",
  "Education",
  "Restaurant",
  "Health & Wellness",
  "Portfolio",
  "SaaS / Tech",
  "Nonprofit",
];

import { websiteWizardApi } from '../../../api/websiteWizardApi';

// Used only if the /api/templates request fails (e.g. backend not wired up yet)
const FALLBACK_TEMPLATES = [
  { id: "t1", name: "Prestige Realty", category: "Real Estate", description: "Luxury listings + agent bios", pages: ["Home", "Listings", "About", "Contact"] },
  { id: "t2", name: "Daily Grind Cafe", category: "Restaurant", description: "Menu, hours, and location", pages: ["Home", "Menu", "Contact"] },
  { id: "t3", name: "Bright Minds Academy", category: "Education", description: "Courses + enrollment", pages: ["Home", "Courses", "About", "Contact"] },
  { id: "t4", name: "Pulse Fitness", category: "Health & Wellness", description: "Classes and trainer profiles", pages: ["Home", "Classes", "Trainers", "Contact"] },
  { id: "t5", name: "Nimbus SaaS", category: "SaaS / Tech", description: "Product landing + pricing", pages: ["Home", "Pricing", "Features", "Contact"] },
  { id: "t6", name: "Studio Folio", category: "Portfolio", description: "Minimal creative portfolio", pages: ["Home", "Work", "About"] },
];

const WebsiteTemplatePage = ({
  websiteName: initialWebsiteName = "",
  onBack,
  onSelectTemplate,
  apiBaseUrl = "/api",
}) => {


  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [websiteName, setWebsiteName] = useState(initialWebsiteName);


  useEffect(() => {
    let cancelled = false;
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await websiteWizardApi.listTemplates();
        if (!cancelled) setTemplates(Array.isArray(data) ? data : data.templates || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setTemplates(FALLBACK_TEMPLATES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTemplates();
    return () => {
      cancelled = true;
    };
  }, []);


  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = category === "All" || t.category === category;
      const matchesSearch =
        !search.trim() ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, category, search]);

  const handleUseTemplate = async () => {
    if (!selectedId || !websiteName.trim()) return;
    setCreating(true);
    try {
      const website = await websiteWizardApi.createWebsite({
        name: websiteName.trim(),
        description: "",
        status: "Draft",
        templateId: selectedId,
      });

      onSelectTemplate && onSelectTemplate(website);
    } catch (err) {
      const template = templates.find((t) => t._id === selectedId || t.id === selectedId);
      onSelectTemplate &&
        onSelectTemplate({
          name: websiteName.trim(),
          description: template?.name ? `Built from "${template.name}" template` : "",
          status: "Draft",
          pages: (template?.pages || ["Home"]).map((p, i) => ({
            id: `pg-${Date.now()}-${i}`,
            name: p,
            slug: p === "Home" ? "/" : `/${p.toLowerCase()}`,
            isHome: p === "Home",
            status: "Draft",
          })),
        });
    } finally {
      setCreating(false);
    }
  };


  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          cursor: "pointer",
          color: "var(--accent-primary)",
          fontWeight: 700,
        }}
        onClick={onBack}
      >
        <ArrowLeft size={16} /> Back
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: "0 0 6px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
            <LayoutTemplate size={22} color="var(--accent-info)" /> Choose a template
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Pick a starting point for <strong>{websiteName || "your new website"}</strong>. You can customize everything afterwards.
          </Text>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <Input
          value={websiteName}
          onChange={(e) => setWebsiteName(e.target.value)}
          placeholder="Website name"
          style={{ width: 260, borderRadius: 8, height: 42 }}
        />
        <Input
          placeholder="Search templates"
          prefix={<Search size={16} color="var(--text-tertiary)" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260, borderRadius: 8, height: 42 }}
        />
        <Select
          value={category}
          onChange={setCategory}
          style={{ width: 200, height: 42 }}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          disabled={!selectedId || !websiteName.trim() || creating}
          loading={creating}
          onClick={handleUseTemplate}
          style={{ height: 42, borderRadius: 8, fontWeight: 700, padding: "0 24px", background: "var(--accent-info)", border: "none" }}
        >
          Use this template
        </Button>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            color: "var(--accent-warning)",
            borderRadius: 10,
            padding: "10px 16px",
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Couldn't reach the templates API ({error}). Showing sample templates instead.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <Empty description="No templates match your search" style={{ padding: "80px 0" }} />
      ) : (
        <Row gutter={[20, 20]}>
          {filtered.map((t) => {
            const id = t._id || t.id;
            const isSelected = selectedId === id;
            return (
              <Col xs={24} sm={12} lg={8} key={id}>
                <div
                  onClick={() => setSelectedId(id)}
                  style={{
                    border: isSelected ? "2px solid var(--accent-info)" : "1px solid var(--border-color)",
                    borderRadius: 16,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "var(--bg-secondary)",
                    boxShadow: isSelected ? "var(--shadow-md)" : "none",
                    position: "relative",
                    transition: "all 0.15s",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "var(--accent-info)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 26,
                        height: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  <div
                    style={{
                      height: 150,
                      background: t.thumbnailUrl ? `url(${t.thumbnailUrl}) center/cover` : "var(--bg-primary)",
                      borderBottom: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {!t.thumbnailUrl && <LayoutTemplate size={32} />}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <Text strong style={{ fontSize: 15, color: "var(--text-primary)" }}>{t.name}</Text>
                      {t.category && (
                        <Tag style={{ borderRadius: 6, fontWeight: 600, border: "none", background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                          {t.category}
                        </Tag>
                      )}
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {t.description || `${(t.pages || []).length || 1} page starter`}
                    </Text>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default WebsiteTemplatePage;
