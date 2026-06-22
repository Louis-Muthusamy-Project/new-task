import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button, Input, message, Select, Spin, Tag, Tooltip } from "antd";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  LayoutGrid,
  Monitor,
  RefreshCw,
  Save,
  Smartphone,
} from "lucide-react";
import { websiteWizardApi } from "../../../api/websiteWizardApi";

const { TextArea } = Input;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** True when a string looks like a 24-char MongoDB ObjectId */
const isMongoId = (s) => typeof s === "string" && /^[a-f\d]{24}$/i.test(s);

/**
 * Normalise whatever is stored in page.content into something the builder
 * can work with.
 *
 * Possible shapes coming from the backend:
 *   ZIP import  → { html: "<html>…</html>", sourcePath: "index.html" }
 *   Blank page  → {} or null
 *   Future JSON → { sections: […], … }
 */
function parseContent(raw) {
  if (!raw) return { type: "empty", html: "", json: null };

  // ZIP-imported HTML page
  if (typeof raw.html === "string" && raw.html.trim()) {
    return { type: "html", html: raw.html, json: null };
  }

  // Structured builder JSON (future / extensible)
  if (raw.sections || raw.blocks || raw.components) {
    return { type: "json", html: null, json: raw };
  }

  // Anything else: treat as empty
  return { type: "empty", html: "", json: null };
}

/** Persist the full page record to sessionStorage so refresh works */
const STORAGE_KEY = (pageId) => `jeema_page_${pageId}`;

function cachePage(pageId, data) {
  try {
    sessionStorage.setItem(STORAGE_KEY(pageId), JSON.stringify(data));
  } catch (_) {}
}

function getCachedPage(pageId) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY(pageId));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusBadge = ({ status }) => {
  const isPublished = status === "Published";
  return (
    <Tag
      style={{
        margin: 0,
        background: isPublished ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
        color: isPublished ? "var(--accent-success)" : "var(--accent-warning)",
        border: "none",
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 11,
        padding: "2px 8px",
      }}
    >
      {status || "Draft"}
    </Tag>
  );
};

/** Renders raw HTML inside a sandboxed iframe */
const HtmlCanvas = ({ html, viewport }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html || "<p style='padding:40px;color:#999;font-family:sans-serif'>Empty page</p>");
    doc.close();
  }, [html]);

  const width = viewport === "mobile" ? 390 : "100%";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        background: "#e5e7eb",
        overflowY: "auto",
        padding: viewport === "mobile" ? "24px 0" : 0,
      }}
    >
      <iframe
        ref={iframeRef}
        title="page-canvas"
        sandbox="allow-scripts allow-same-origin"
        style={{
          width,
          minHeight: "100%",
          border: "none",
          background: "#fff",
          boxShadow: viewport === "mobile" ? "0 4px 24px rgba(0,0,0,0.15)" : "none",
          display: "block",
        }}
      />
    </div>
  );
};

/** Editable HTML source view */
const HtmlEditor = ({ html, onChange }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <div
      style={{
        padding: "8px 16px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        fontSize: 12,
        fontFamily: "monospace",
        color: "var(--text-tertiary)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Code2 size={14} /> HTML source — edit directly or use the visual canvas above
    </div>
    <TextArea
      value={html}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1,
        fontFamily: "monospace",
        fontSize: 13,
        lineHeight: 1.6,
        resize: "none",
        border: "none",
        borderRadius: 0,
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        padding: 16,
        height: "100%",
      }}
      autoSize={false}
    />
  </div>
);

/** Empty / blank page state */
const EmptyCanvas = ({ pageName }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      background: "#f3f4f6",
      color: "#9ca3af",
    }}
  >
    <LayoutGrid size={56} strokeWidth={1} color="#d1d5db" />
    <div style={{ fontWeight: 700, fontSize: 18, color: "#6b7280" }}>
      {pageName} — blank page
    </div>
    <div style={{ fontSize: 14, color: "#9ca3af" }}>
      Add HTML in the source editor below, or import content from a ZIP.
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const BccBuilder = () => {
  const { websiteId, pageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Route state carries metadata the list already knows; use as fast initial values
  const routeState = location.state || {};

  // --------------- page data -----------------------------------------------
  const [page, setPage] = useState(null);           // full page record from API
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // --------------- editor state --------------------------------------------
  const [htmlContent, setHtmlContent] = useState("");
  const [contentType, setContentType] = useState("empty"); // "html" | "empty" | "json"
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // --------------- UI state ------------------------------------------------
  const [viewport, setViewport] = useState("desktop"); // "desktop" | "mobile"
  const [showSource, setShowSource] = useState(false);
  const [pageStatus, setPageStatus] = useState("Draft");

  // -------------------------------------------------------------------------
  // Load page on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    console.log("websiteId", websiteId);
    console.log("pageId", pageId);

    const load = async () => {
      setLoading(true);
      setLoadError(null);

      // 1. Check sessionStorage first — handles refresh without re-fetch
      const cached = getCachedPage(pageId);
      if (cached) {
        console.log("[JeemaBuilder] restored from sessionStorage cache");
        applyPageData(cached, false);
        setLoading(false);
        return;
      }

      // 2. If pageId is not a real Mongo ObjectId (e.g. local "pg-…" or slug)
      //    we can't hit the API; use whatever the router state has.
      if (!isMongoId(pageId)) {
        console.log("[JeemaBuilder] pageId is not a Mongo ObjectId — using route state");
        const synthetic = {
          _id: pageId,
          websiteId,
          name: routeState.pageName || "Page",
          slug: routeState.pageSlug || pageId,
          status: "Draft",
          isHome: false,
          content: null,
          seo: {},
        };
        applyPageData(synthetic, false);
        setLoading(false);
        return;
      }

      // 3. Fetch from API
      try {
        const data = await websiteWizardApi.getPage(pageId);
        console.log("[JeemaBuilder] page loaded from API:", data);
        applyPageData(data, true);
      } catch (err) {
        console.error("[JeemaBuilder] failed to load page:", err);
        setLoadError(err?.message || "Failed to load page.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId, pageId]);

  /** Unpack an API page record into editor state */
  const applyPageData = useCallback((data, cache) => {
    setPage(data);
    setPageStatus(data.status || "Draft");

    const parsed = parseContent(data.content);
    setContentType(parsed.type);
    setHtmlContent(parsed.html || "");

    if (cache) {
      cachePage(data._id || pageId, data);
    }
    setIsDirty(false);
  }, [pageId]);

  // -------------------------------------------------------------------------
  // HTML edits
  // -------------------------------------------------------------------------
  const handleHtmlChange = useCallback((value) => {
    setHtmlContent(value);
    setIsDirty(true);
    // Keep the cache up-to-date so refresh preserves unsaved edits too
    if (page) {
      const updated = { ...page, content: { html: value, sourcePath: page.content?.sourcePath || "index.html" } };
      cachePage(pageId, updated);
    }
  }, [page, pageId]);

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------
  const handleSave = useCallback(async () => {
    if (!isMongoId(pageId)) {
      message.warning("This page hasn't been saved to the database yet — save the website first.");
      return;
    }

    setSaving(true);
    try {
      const contentPayload =
        contentType === "html"
          ? { html: htmlContent, sourcePath: page?.content?.sourcePath || "index.html" }
          : contentType === "empty" && htmlContent.trim()
          ? { html: htmlContent, sourcePath: "index.html" }
          : page?.content || {};

      const payload = {
        content: contentPayload,
        status: pageStatus,
        ...(page?.name && { name: page.name }),
        ...(page?.slug && { slug: page.slug }),
        ...(page?.seo && { seo: page.seo }),
      };

      console.log("[JeemaBuilder] saving page", pageId, payload);
      const updated = await websiteWizardApi.updatePage(pageId, payload);
      console.log("[JeemaBuilder] save response:", updated);

      // Refresh local state from server response
      applyPageData(updated, true);
      setSavedAt(new Date());
      setIsDirty(false);
      message.success("Page saved.");
    } catch (err) {
      console.error("[JeemaBuilder] save failed:", err);
      message.error(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [pageId, page, contentType, htmlContent, pageStatus, applyPageData]);

  // Keyboard shortcut: Ctrl/Cmd + S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // -------------------------------------------------------------------------
  // Derived display values (use route state while loading for instant title)
  // -------------------------------------------------------------------------
  const displayName = page?.name || routeState.pageName || "Page";
  const displaySlug = page?.slug || routeState.pageSlug || pageId;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Toolbar                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          height: 56,
          flexShrink: 0,
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          gap: 12,
          zIndex: 100,
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Tooltip title="Back to pages">
            <Button
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate(-1)}
              style={{
                borderRadius: 8,
                height: 34,
                fontWeight: 600,
                borderColor: "var(--border-color)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                flexShrink: 0,
              }}
            />
          </Tooltip>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <LayoutGrid size={17} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </span>
            <Tag
              style={{
                margin: 0,
                background: "rgba(59,130,246,0.1)",
                color: "var(--accent-primary)",
                border: "none",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              /{displaySlug}
            </Tag>
            {page && <StatusBadge status={pageStatus} />}
          </div>
        </div>

        {/* Centre: viewport */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: "3px 4px",
            flexShrink: 0,
          }}
        >
          <Tooltip title="Desktop view">
            <button
              onClick={() => setViewport("desktop")}
              style={{
                background: viewport === "desktop" ? "var(--accent-primary)" : "transparent",
                color: viewport === "desktop" ? "#fff" : "var(--text-secondary)",
                border: "none",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <Monitor size={14} /> Desktop
            </button>
          </Tooltip>
          <Tooltip title="Mobile view">
            <button
              onClick={() => setViewport("mobile")}
              style={{
                background: viewport === "mobile" ? "var(--accent-primary)" : "transparent",
                color: viewport === "mobile" ? "#fff" : "var(--text-secondary)",
                border: "none",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              <Smartphone size={14} /> Mobile
            </button>
          </Tooltip>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Status selector */}
          <Select
            value={pageStatus}
            onChange={(v) => { setPageStatus(v); setIsDirty(true); }}
            size="small"
            style={{ width: 110 }}
            options={[
              { value: "Draft", label: "Draft" },
              { value: "Published", label: "Published" },
            ]}
          />

          {/* Source toggle */}
          <Tooltip title="Toggle HTML source editor">
            <Button
              icon={<Code2 size={15} />}
              onClick={() => setShowSource((s) => !s)}
              style={{
                borderRadius: 8,
                height: 34,
                background: showSource ? "rgba(59,130,246,0.1)" : "var(--bg-primary)",
                borderColor: showSource ? "var(--accent-primary)" : "var(--border-color)",
                color: showSource ? "var(--accent-primary)" : "var(--text-primary)",
              }}
            />
          </Tooltip>

          {/* Preview */}
          <Tooltip title="Open preview in new tab">
            <Button
              icon={<Eye size={15} />}
              onClick={() => {
                if (page?.slug) {
                  window.open(`/${page.slug}`, "_blank", "noopener,noreferrer");
                }
              }}
              style={{
                borderRadius: 8,
                height: 34,
                borderColor: "var(--border-color)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </Tooltip>

          {/* Save indicator */}
          {savedAt && !isDirty && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--accent-success)",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={14} />
              Saved
            </span>
          )}
          {isDirty && (
            <span style={{ fontSize: 12, color: "var(--accent-warning)", fontWeight: 600 }}>
              Unsaved changes
            </span>
          )}

          {/* Save button */}
          <Button
            type="primary"
            icon={saving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
            loading={saving}
            onClick={handleSave}
            disabled={!isDirty && !!savedAt}
            style={{
              borderRadius: 8,
              height: 34,
              background: isDirty ? "var(--accent-primary)" : "var(--bg-secondary)",
              border: isDirty ? "none" : "1px solid var(--border-color)",
              color: isDirty ? "#fff" : "var(--text-secondary)",
              fontWeight: 700,
              padding: "0 18px",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                */}
      {/* ------------------------------------------------------------------ */}
      {loading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            color: "var(--text-secondary)",
          }}
        >
          <Spin size="large" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Loading {routeState.pageName || "page"}…</span>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-tertiary)" }}>
            pageId: {pageId}
          </span>
        </div>
      ) : loadError ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            color: "var(--accent-danger)",
          }}
        >
          <AlertCircle size={48} strokeWidth={1.5} />
          <div style={{ fontWeight: 700, fontSize: 16 }}>Failed to load page</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 480, textAlign: "center" }}>
            {loadError}
          </div>
          <Button onClick={() => window.location.reload()} icon={<RefreshCw size={15} />}>
            Retry
          </Button>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Page metadata strip */}
          <div
            style={{
              padding: "8px 20px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              gap: 24,
              fontSize: 12,
              color: "var(--text-tertiary)",
              fontFamily: "monospace",
            }}
          >
            <span><b style={{ color: "var(--text-secondary)" }}>websiteId</b>: {websiteId}</span>
            <span><b style={{ color: "var(--text-secondary)" }}>pageId</b>: {pageId}</span>
            <span><b style={{ color: "var(--text-secondary)" }}>type</b>: {contentType}</span>
            {page?.isHome && (
              <Tag
                style={{
                  margin: 0,
                  background: "rgba(59,130,246,0.1)",
                  color: "var(--accent-primary)",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                HOME
              </Tag>
            )}
            <span style={{ marginLeft: "auto", color: "var(--text-tertiary)" }}>
              {contentType === "html"
                ? `${htmlContent.length.toLocaleString()} chars`
                : "blank page"}
            </span>
          </div>

          {/* Canvas area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {contentType === "html" || (contentType === "empty" && !showSource) ? (
              <HtmlCanvas
                html={htmlContent || "<p style='padding:40px;color:#aaa;font-family:sans-serif;font-size:15px'>This page has no content yet. Use the source editor to add HTML.</p>"}
                viewport={viewport}
              />
            ) : contentType === "empty" && !htmlContent ? (
              <EmptyCanvas pageName={displayName} />
            ) : null}

            {showSource && (
              <div
                style={{
                  height: showSource && contentType !== "html" ? "100%" : 320,
                  flexShrink: 0,
                  borderTop: contentType === "html" ? "1px solid var(--border-color)" : "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <HtmlEditor html={htmlContent} onChange={handleHtmlChange} />
              </div>
            )}
          </div>

          {/* SEO strip */}
          {page?.seo && (
            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: 24,
                fontSize: 12,
                color: "var(--text-tertiary)",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>SEO</span>
              {page.seo.title && <span>Title: <b style={{ color: "var(--text-primary)" }}>{page.seo.title}</b></span>}
              {page.seo.description && (
                <span>
                  Description:{" "}
                  <b style={{ color: "var(--text-primary)" }}>
                    {page.seo.description.slice(0, 60)}{page.seo.description.length > 60 ? "…" : ""}
                  </b>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BccBuilder;