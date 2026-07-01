import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  Button, Input, Radio, Table, Typography, Space,
  Card, Select, Row, Col, Tag, Spin, Popconfirm, message, Tooltip,
} from "antd";
import {
  Plus, Search, Folder, Sparkles, Monitor, ArrowLeft,
  ArrowRight, PenTool, Eye, Trash2, RefreshCw,
} from "lucide-react";

import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";


import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ─── ActionButton (reusable) ───────────────────────────────────────────────
const ActionButton = ({
  icon,
  label,
  onClick,
  disabled,
  loading,
  color,
}) => {
  const isPreview = color === "preview";
  const isEdit = color === "edit";
  const isDelete = color === "delete";

  const baseStyle = {
    borderRadius: 7,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 28,
    padding: "0 10px",
    lineHeight: 1,
  };

  if (isPreview) {
    return (
      <Button
        size="small"
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        style={{
          ...baseStyle,
          border: "1px solid var(--border-color)",
          background: "var(--bg-primary)",
          color: "var(--text-secondary)",
        }}
        className="action-btn-preview"
      >
        {icon}
        {label}
      </Button>
    );
  }

  if (isEdit) {
    return (
      <Button
        size="small"
        type="primary"
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        style={{
          ...baseStyle,
          border: "none",
          background: "var(--accent-primary)",
          color: "#fff",
        }}
        className="action-btn-edit"
      >
        {icon}
        {label}
      </Button>
    );
  }

  // delete
  return (
    <Button
      size="small"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      danger
      style={{
        ...baseStyle,
        border: "1px solid var(--accent-danger)",
        background: "rgba(239,68,68,0.06)",
        color: "var(--accent-danger)",
      }}
    >
      {icon}
      {label}
    </Button>
  );
};

import CreateWebsiteModal from "./CreateWebsiteModal";
import TemplateLibraryModal from "../websiteWizard/TemplateLibraryModal";
import WebsiteTemplatePage from "./WebsiteTemplatePage";
import WebsiteEditPage from "./WebsiteEditPage";
import { websiteWizardApi } from "../../../api/websiteWizardApi";
import { openPagePreview } from "../utils/previewHtml";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normalise a raw MongoDB Website document into the shape the table expects. */
function normalizeWebsite(doc) {
  const id = doc._id || doc.id || String(Date.now());
  const name = doc.websiteName || doc.name || "Untitled Website";
  const pageCount =
    typeof doc.pageCount === "number"
      ? doc.pageCount
      : Array.isArray(doc.pages)
        ? doc.pages.length
        : doc.pages || 0;

  return {
    // Keep both _id (MongoDB) and key (Ant Design Table rowKey)
    _id: id,
    key: id,
    name,
    description: doc.description || "",
    status: doc.status || "Draft",
    faviconUrl: doc.faviconUrl || "",
    tracking: doc.tracking || {},
    // FIX: chatWidgetId was being dropped here, so re-opening a website after
    // returning to the list view always showed the dropdown as unset even
    // though it was saved correctly in the database.
    chatWidgetId: doc.chatWidgetId || null,
    domain: doc.domain || null,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "—",
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      : "Just now",
    pages: pageCount,
    // Preserve raw page objects so WebsiteEditPage can use them immediately
    rawPages: Array.isArray(doc.rawPages)
      ? doc.rawPages
      : Array.isArray(doc.pages)
        ? doc.pages
        : [],
    isNew: doc.isNew || false,
  };
}


const ManageWebsiteView = ({ activeWebsite, setView, itemVariants }) => {
  const navigate = useNavigate();
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleEditInBuilder = (pageName, pageSlug, pageId) => {
    const websiteId = activeWebsite?._id || activeWebsite?.key;
    // FIX: Safe pageId resolution — never navigate with undefined pageId
    const resolvedPageId = pageId || pageSlug;

    if (!websiteId || !resolvedPageId) {
      console.warn("[EDIT NAVIGATION] Missing websiteId or pageId", { websiteId, resolvedPageId });
      message.error("Cannot open builder: missing website or page ID.");
      return;
    }

    navigate(`/websites/${websiteId}/pages/${resolvedPageId}`, {
      state: { websiteId, pageId: resolvedPageId, pageName, pageSlug },
    });
  };

  const handlePreview = async () => {
    const id = activeWebsite?._id || activeWebsite?.key;
    if (!id) {
      message.info("Save your website first to preview it.");
      return;
    }
    setPreviewLoading(true);
    try {
      const previewData = await websiteWizardApi.previewWebsite(id);
      const pages = previewData?.pages || [];
      const homePage = pages.find((p) => p.isHome) || pages[0];
      if (!homePage?.content?.html) {
        message.info("No HTML content found for this website.");
        return;
      }
      const opened = openPagePreview(homePage);
      if (!opened) message.error("Popup blocked. Allow popups to preview this website.");
    } catch (err) {
      message.error(err?.message || "Failed to load preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <motion.div variants={itemVariants} className="builder-view-container">
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
        onClick={() => setView("list")}
      >
        <ArrowLeft size={16} /> Back to Websites
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8, color: "var(--text-primary)", fontWeight: 900 }}>
            {activeWebsite.name}
          </Title>
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500 }}>
            Manage pages, settings, and tracking for this website.
          </Text>
        </div>
      </div>

      <div style={{ maxWidth: 1200 }}>
        {activeWebsite.isNew && (
          <div
            style={{
              marginBottom: 32,
              padding: "16px 24px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: 12,
              color: "var(--accent-success)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Website created successfully.
          </div>
        )}

        <Row gutter={32}>
          <Col span={8}>
            <Card bodyStyle={{ padding: 32 }} style={{ borderRadius: 24, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>WEBSITE NAME</div>
                <Input size="large" defaultValue={activeWebsite.name} style={{ borderRadius: 8 }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>STATUS</div>
                <Select size="large" defaultValue={activeWebsite.status || "Draft"} style={{ width: "100%" }}>
                  <Option value="Draft">Draft</Option>
                  <Option value="Published">Published</Option>
                </Select>
              </div>
              <Button
                type="primary"
                size="large"
                block
                style={{ background: "var(--accent-primary)", border: "none", borderRadius: 12, fontWeight: 800, height: 48, marginBottom: 16, boxShadow: "var(--shadow-md)" }}
              >
                Save Website Settings
              </Button>
              <Row gutter={16}>
                <Col span={12}>
                  <Button type="primary" size="large" block style={{ background: "var(--accent-success)", border: "none", borderRadius: 12, fontWeight: 700, height: 48 }}>
                    Publish
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="large"
                    block
                    loading={previewLoading}
                    onClick={handlePreview}
                    style={{ background: "var(--accent-warning)", border: "none", borderRadius: 12, fontWeight: 700, height: 48, color: "#fff" }}
                  >
                    Preview
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={16}>
            <Card bodyStyle={{ padding: 32 }} style={{ borderRadius: 24, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Pages</div>
              <Text type="secondary" style={{ fontSize: 14, marginBottom: 32, display: "block" }}>
                Home page sets global header &amp; footer for all other pages.
              </Text>
              <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
                <Input size="large" placeholder="New page title" style={{ flex: 1, borderRadius: 8 }} />
                <Button size="large" type="primary" style={{ background: "var(--text-primary)", border: "none", borderRadius: 8, fontWeight: 800, padding: "0 32px" }}>
                  Add Page
                </Button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 24, marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(59,130,246,0.1)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Monitor size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: "var(--text-primary)" }}>
                          Home{" "}
                          <Tag style={{ margin: 0, background: "rgba(59,130,246,0.1)", color: "var(--accent-primary)", border: "none", fontWeight: 800, borderRadius: 6, fontSize: 10 }}>HOME</Tag>
                        </div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>/home</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      {/* FIX: canonical route used via handleEditInBuilder */}
                      <Button type="primary" onClick={() => handleEditInBuilder("Home", "home", null)} style={{ background: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700 }} icon={<PenTool size={14} />}>
                        Edit in Builder
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

// ─── Main WebsitesTab ────────────────────────────────────────────────────────

const WebsitesTab = ({ itemVariants }) => {
  // Only one kebab dropdown can be open at a time
  const [openMenu, setOpenMenu] = useState(null);
  const menuRootRef = useRef(null);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!openMenu) return;
      const root = menuRootRef.current;
      if (!root) return;

      const target = e.target;
      if (target && root.contains(target)) return;

      setOpenMenu(null);
    };

    document.addEventListener("mousedown", onDocMouseDown, true);
    return () => document.removeEventListener("mousedown", onDocMouseDown, true);
  }, [openMenu]);


  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [viewType, setViewType] = useState("list");
  const [folderView, setFolderView] = useState("home");
  const [searchText, setSearchText] = useState("");

  // ── Modal state ───────────────────────────────────────────────────────────
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // ── Data state ────────────────────────────────────────────────────────────
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ── View routing ──────────────────────────────────────────────────────────
  const [view, setView] = useState("list"); // "list" | "edit" | "manage"
  const [activeWebsite, setActiveWebsite] = useState(null);

  // ── Fetch all websites from backend ───────────────────────────────────────
  const fetchWebsites = useCallback(async () => {
    setLoading(true);
    try {
      const json = await websiteWizardApi.getAllWebsites();
      const raw = Array.isArray(json?.data) ? json.data : [];
      setWebsites(raw.map(normalizeWebsite));
    } catch (err) {
      console.error("[WebsitesTab] fetchWebsites failed:", err);
      message.error("Could not load websites. Check your backend connection.");
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and whenever we return to the list view
  useEffect(() => {
    if (view === "list") fetchWebsites();
  }, [view, fetchWebsites]);

  // ── Create blank website ──────────────────────────────────────────────────
  const handleCreateBlank = async (websiteName) => {
    try {
      const savedWebsite = await websiteWizardApi.createWebsite({
        name: websiteName,
        websiteName,
        description: "",
        status: "Draft",
      });

      const websiteId = savedWebsite._id || savedWebsite.id;

      let homePage = null;
      try {
        homePage = await websiteWizardApi.createPage({
          websiteId,
          name: "Home",
          title: "Home",
          slug: "home",
          isHome: true,
          status: "Draft",
          content: {},
        });
      } catch (pageErr) {
        console.warn("[WebsitesTab] Home page creation failed:", pageErr);
      }

      const normalized = normalizeWebsite({
        ...savedWebsite,
        isNew: true,
        rawPages: homePage ? [homePage] : [],
      });

      setCreateModalOpen(false);
      setActiveWebsite(normalized);
      setView("edit");

      fetchWebsites();
    } catch (err) {
      console.error("[WebsitesTab] handleCreateBlank failed:", err);
      message.error(err?.message || "Failed to create website.");
    }
  };

  // ── Open template modal ───────────────────────────────────────────────────
  const handleOpenTemplates = () => {
    setCreateModalOpen(false);
    setTemplateModalOpen(true);
  };

  // ── Template / ZIP onCreate callback ─────────────────────────────────────
  const handleTemplateCreated = async (payload) => {
    const backendWebsite = payload.website;

    let normalized;

    if (backendWebsite?._id) {
      // ── [VERIFY 7] Pages landing in Websites tab ────────────────────────
      console.group('%c[VERIFY 7] handleTemplateCreated — fast path (backendWebsite._id exists)', 'color:#10b981;font-weight:bold');

      console.table((payload.pages || []).map((p) => ({ _id: p._id || p.id, name: p.name, slug: p.slug, isHome: p.isHome })));
      console.groupEnd();

      normalized = normalizeWebsite({
        ...backendWebsite,
        isNew: true,
        rawPages: payload.pages || [],
      });
    } else {
      try {
        const saved = await websiteWizardApi.createWebsite({
          name: payload.websiteName || "Untitled Website",
          websiteName: payload.websiteName || "Untitled Website",
          description: payload.description || "Website Template",
          status: "Draft",
        });
        normalized = normalizeWebsite({
          ...saved,
          isNew: true,
          rawPages: payload.pages || [],
        });
      } catch (err) {
        console.error("[WebsitesTab] handleTemplateCreated – createWebsite failed:", err);
        message.error(err?.message || "Failed to save website.");
        return;
      }
    }

    setTemplateModalOpen(false);
    setActiveWebsite(normalized);
    setView("edit");

    fetchWebsites();
  };

  // ── Delete website ────────────────────────────────────────────────────────
  const handleDelete = async (record) => {
    const id = record._id || record.key;
    setDeletingId(id);
    try {
      await websiteWizardApi.deleteWebsite(id);
      message.success(`"${record.name}" deleted.`);
      setWebsites((prev) => prev.filter((w) => w._id !== id && w.key !== id));
      fetchWebsites();
    } catch (err) {
      console.error("[WebsitesTab] handleDelete failed:", err);
      message.error(err?.message || "Failed to delete website.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Navigate to edit page ─────────────────────────────────────────────────
  const handleEditWebsite = (record) => {
    setActiveWebsite(record);
    setView("edit");
  };

  // ── Preview website ───────────────────────────────────────────────────────
  const handlePreviewWebsite = async (record) => {
    const id = record._id || record.key;
    if (!id || id.length < 24) {
      message.info("Website not yet saved to database.");
      return;
    }
    try {
      const previewData = await websiteWizardApi.previewWebsite(id);
      const pages = previewData?.pages || [];
      const homePage = pages.find((p) => p.isHome) || pages[0];
      if (!homePage?.content?.html) {
        message.info("No published HTML content found for this website.");
        return;
      }
      const opened = openPagePreview(homePage);
      if (!opened) message.error("Popup blocked. Allow popups to preview this website.");
    } catch (err) {
      message.error(err?.message || "Preview failed.");
    }
  };

  // ── Subview rendering ─────────────────────────────────────────────────────

  if (view === "edit" && activeWebsite) {
    return (
      <WebsiteEditPage
        website={{ ...activeWebsite, pages: activeWebsite.rawPages }}
        justCreated={activeWebsite.isNew}
        onBack={() => {
          setView("list");
          setActiveWebsite(null);
        }}
        onChange={(next) =>
          setActiveWebsite((prev) => ({
            ...prev,
            name: next.name,
            description: next.description,
            status: next.status,
            faviconUrl: next.faviconUrl,
            tracking: next.tracking,
            chatWidgetId: next.chatWidgetId,
            domain: next.domain,
            rawPages: next.pages,
          }))
        }
      />
    );
  }

  if (view === "manage" && activeWebsite) {
    return (
      <ManageWebsiteView
        activeWebsite={activeWebsite}
        setView={(v) => {
          setView(v);
          if (v === "list") setActiveWebsite(null);
        }}
        itemVariants={itemVariants}
      />
    );
  }

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns = [
    {
      title: "NAME",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: 15 }}>{name}</div>
          {record.description && (
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 3, fontWeight: 500 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 110,
      filters: [
        { text: "Draft", value: "Draft" },
        { text: "Published", value: "Published" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag
          style={{
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 12,
            border: "none",
            background:
              status === "Published"
                ? "rgba(16,185,129,0.12)"
                : "rgba(245,158,11,0.12)",
            color:
              status === "Published"
                ? "var(--accent-success)"
                : "var(--accent-warning)",
          }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "CREATED",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (v) => <Text style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "UPDATED",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 130,
      render: (v) => <Text style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "PAGES",
      dataIndex: "pages",
      key: "pages",
      width: 80,
      align: "center",
      render: (n) => (
        <span
          style={{
            fontWeight: 700,
            color: "var(--text-primary)",
            background: "rgba(59,130,246,0.08)",
            padding: "2px 10px",
            borderRadius: 8,
          }}
        >
          {n}
        </span>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right",
      width: 60,
      render: (_, record) => {
        const id = record._id || record.key;
        const isValidId = typeof id === "string" && id.length >= 24;

        const isOpen = openMenu === id;

        const closeMenu = () => setOpenMenu(null);

        return (
          <div
            ref={isOpen ? menuRootRef : undefined}
            style={{ position: "relative" }}
          >
            <button

              type="button"
              aria-label="More Options"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((prev) => (prev === id ? null : id));
              }}
              className="flex items-center justify-center rounded hover:bg-gray-100"
              style={{
                background: "transparent",
                width: 32,
                height: 32,
                border: "none",
                cursor: "pointer",
              }}
            >
              <FiMoreVertical size={18} />
            </button>

            {isOpen && (
              <div
                className="absolute right-0 mt-2"
                style={{
                  width: 180,
                  background: "#fff",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  zIndex: 9999,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="py-1"
                  onMouseLeave={() => {
                    // no-op; keep menu open until outside click or selection
                  }}
                >
                  <button
                    type="button"
                    disabled={!isValidId}
                    onClick={() => {
                      closeMenu();
                      if (!isValidId) return;
                      handlePreviewWebsite(record);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "transparent",
                      border: "none",
                      cursor: isValidId ? "pointer" : "not-allowed",
                      color: "#111827",
                      opacity: isValidId ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(243,244,246,1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <FiEye size={16} />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      handleEditWebsite(record);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#111827",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(243,244,246,1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <FiEdit2 size={16} />
                    <span>Edit</span>
                  </button>

                  <Popconfirm
                    title={`Delete "${record.name}"?`}
                    description="This cannot be undone."
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                    onConfirm={() => {
                      closeMenu();
                      handleDelete(record);
                    }}
                    disabled={!isValidId}
                  >
                    <button
                      type="button"
                      disabled={!isValidId}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "transparent",
                        border: "none",
                        cursor: isValidId ? "pointer" : "not-allowed",
                        color: !isValidId ? "rgba(239,68,68,0.5)" : "#ef4444",
                        opacity: isValidId ? 1 : 0.6,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(254,226,226,1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <FiTrash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </Popconfirm>
                </div>
              </div>
            )}
          </div>
        );
      },
    },

  ];

  // ── Filtered data ─────────────────────────────────────────────────────────

  const tableData = websites.filter((w) =>
    (w.name || "").toLowerCase().includes(searchText.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div variants={itemVariants}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Title level={4} style={{ margin: "0 0 8px", color: "var(--text-primary)", fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
            <Monitor size={24} color="var(--accent-primary)" /> Websites
          </Title>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
            Build custom websites to showcase your products and build a trusted brand.
          </Text>
        </div>

        <Space>
          <Tooltip title="Refresh list">
            <Button
              size="large"
              icon={<RefreshCw size={16} />}
              onClick={fetchWebsites}
              loading={loading}
              style={{ borderRadius: 8, borderColor: "var(--border-color)", color: "var(--text-secondary)", background: "var(--bg-secondary)", height: 44 }}
            />
          </Tooltip>

          <Button
            size="large"
            icon={<Sparkles size={18} />}
            onClick={() => setCreateModalOpen(true)}
            style={{ color: "var(--accent-secondary)", borderColor: "var(--accent-secondary)", background: "rgba(13,148,136,0.05)", borderRadius: 8, fontWeight: 800, height: 44, padding: "0 20px" }}
          >
            Build with AI{" "}
            <Tag style={{ margin: "0 0 0 8px", background: "var(--accent-secondary)", color: "#fff", border: "none", borderRadius: 12, padding: "2px 8px", fontSize: 10 }}>
              BETA
            </Tag>
          </Button>

          <Button
            size="large"
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => setCreateModalOpen(true)}
            style={{ background: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 800, height: 44, padding: "0 24px", boxShadow: "var(--shadow-md)" }}
          >
            New Website
          </Button>
        </Space>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, borderBottom: "2px solid var(--border-color)" }}>
          {["home", "unfiled"].map((tab) => (
            <div
              key={tab}
              onClick={() => setFolderView(tab)}
              style={{
                padding: "8px 16px",
                fontWeight: folderView === tab ? 800 : 600,
                color: folderView === tab ? "var(--text-primary)" : "var(--text-secondary)",
                borderBottom: folderView === tab ? "3px solid var(--accent-primary)" : "3px solid transparent",
                marginBottom: -2,
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        <Space>
          <Radio.Group
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            size="large"
            style={{ background: "var(--bg-secondary)", padding: 4, borderRadius: 10, border: "1px solid var(--border-color)" }}
          >
            {["recent", "list"].map((v) => (
              <Radio.Button
                key={v}
                value={v}
                style={{
                  borderRadius: 8,
                  border: "none",
                  background: viewType === v ? "var(--bg-primary)" : "transparent",
                  color: viewType === v ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: 700,
                  boxShadow: viewType === v ? "var(--shadow-sm)" : "none",
                  textTransform: "capitalize",
                }}
              >
                {v}
              </Radio.Button>
            ))}
          </Radio.Group>

          <Input
            size="large"
            placeholder="Search websites…"
            prefix={<Search size={16} color="var(--text-tertiary)" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 280, borderRadius: 10 }}
          />
        </Space>
      </div>

      {/* Table */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}
      >
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="key"
          loading={{
            spinning: loading,
            indicator: (
              <div style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: "var(--text-secondary)", fontWeight: 600 }}>Loading websites…</div>
              </div>
            ),
          }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `${total} website${total !== 1 ? "s" : ""}`,
            style: { padding: "16px 24px" },
          }}
          locale={{
            emptyText: (
              <div style={{ padding: "80px 0", textAlign: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: "rgba(59,130,246,0.1)",
                    color: "var(--accent-primary)",
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                  }}
                >
                  <Monitor size={40} />
                </div>
                <Title level={4} style={{ marginBottom: 12, color: "var(--text-primary)", fontWeight: 800 }}>
                  No websites yet
                </Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 32, fontSize: 15, fontWeight: 500 }}>
                  Create your first website from blank or choose a template.
                </Text>
                <Button
                  type="primary"
                  icon={<Plus size={18} />}
                  onClick={() => setCreateModalOpen(true)}
                  style={{ borderRadius: 8, height: 44, background: "var(--accent-primary)", border: "none", fontWeight: 700, padding: "0 32px" }}
                >
                  New Website
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* Modals */}
      <CreateWebsiteModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onCreateBlank={handleCreateBlank}
        onOpenTemplates={handleOpenTemplates}
      />

      <TemplateLibraryModal
        open={templateModalOpen}
        onCancel={() => setTemplateModalOpen(false)}
        onCreate={handleTemplateCreated}
      />
    </motion.div>
  );
};

export default WebsitesTab;