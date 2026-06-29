import React, { useCallback, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button, message, Select, Spin, Tag, Tooltip } from "antd";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  LayoutGrid,
  Monitor,
  RefreshCw,
  Save,
  Smartphone,
} from "lucide-react";
import { websiteWizardApi } from "../../../api/websiteWizardApi";

import GrapesPageEditor from "./GrapesPageEditor";
import useUnsavedChangesWarning from "./useUnsavedChangesWarning";
import { openPagePreview } from "../utils/previewHtml";

const { Option } = Select;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** True when a string looks like a 24-char MongoDB ObjectId */
const isMongoId = (s) => typeof s === "string" && /^[a-f\d]{24}$/i.test(s);

/** Persist the full page record to sessionStorage so refresh works */
const STORAGE_KEY = (pageId) => `jeema_page_${pageId}`;

function cachePage(pageId, data) {
  console.log('[CACHE WRITE]', {
    pageId,
    htmlLen: data?.content?.html?.length || 0,
    cssLen: data?.content?.css?.length || 0,
  });
  try {
    sessionStorage.setItem(STORAGE_KEY(pageId), JSON.stringify(data));
  } catch (_) { }
}

function getCachedPage(pageId) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY(pageId));
    const parsed = raw ? JSON.parse(raw) : null;
    console.log('[CACHE READ]', {
      pageId,
      htmlLen: parsed?.content?.html?.length || 0,
      cssLen: parsed?.content?.css?.length || 0,
    });
    return parsed;
  } catch (_) {
    console.log('[CACHE READ]', { pageId, htmlLen: 0, cssLen: 0 });
    return null;
  }
}


function safeGetInitialContent(page) {

  const rawContent = page?.content || null;

  const html =
    typeof rawContent?.html === "string"
      ? rawContent.html
      : "";

  const css =
    typeof rawContent?.css === "string"
      ? rawContent.css
      : "";
  const headLinks =
    typeof rawContent?.headLinks === "string"
      ? rawContent.headLinks
      : "";

  console.log("[safeGetInitialContent RESULT]", {
    htmlLen: html.length,
    cssLen: css.length,
    headLinksLen: headLinks.length,
  });

  return { html, css, headLinks };
}

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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const BccBuilder = () => {
  const { websiteId, pageId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Route state carries metadata the list already knows
  const routeState = location.state || {};

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // GrapesJS content props (state lives here so refresh works)
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [headLinks, setHeadLinks] = useState("");

  // Dirty tracking
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const [viewport, setViewport] = useState("desktop"); // preserved UI selection
  const [pageStatus, setPageStatus] = useState("Draft");

  useUnsavedChangesWarning(isDirty);

  const displayName = page?.name || routeState.pageName || "Page";
  const displaySlug = page?.slug || routeState.pageSlug || pageId;


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);

      const cached = getCachedPage(pageId);
      if (cached) {
        setPage(cached);
        setPageStatus(cached?.status || "Draft");
        const initial = safeGetInitialContent(cached);
        console.log('[HTML SET]', { source: 'getCachedPage', length: initial.html?.length || 0 });
        setHtml(initial.html);
        console.log('[CSS SET]', { source: 'getCachedPage', length: initial.css?.length || 0 });
        setCss(initial.css);
        setHeadLinks(initial.headLinks);

        setIsDirty(false);
        setLoading(false);
        return;
      }

      // For non-mongo ids we can't call backend
      if (!isMongoId(pageId)) {
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

        setPage(synthetic);
        setPageStatus("Draft");
        console.log('[HTML SET]', { source: 'nonMongo_synthetic', length: 0 });
        setHtml("");
        console.log('[CSS SET]', { source: 'nonMongo_synthetic', length: 0 });
        setCss("");
        setHeadLinks("");
        setIsDirty(false);
        setLoading(false);
        return;

      }

      try {
        const data = await websiteWizardApi.getPage(pageId);


        setPage(data);
        setPageStatus(data?.status || "Draft");

        const initial = safeGetInitialContent(data);
        console.log('[HTML SET]', { source: 'websiteWizardApi.getPage', length: initial.html?.length || 0 });
        setHtml(initial.html);
        console.log('[CSS SET]', { source: 'websiteWizardApi.getPage', length: initial.css?.length || 0 });
        setCss(initial.css);
        setHeadLinks(initial.headLinks);

        cachePage(data._id || pageId, data);

      } catch (err) {
        console.error("[BccBuilder] failed to load page:", err);
        setLoadError(err?.message || "Failed to load page.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteId, pageId]);

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
      const payload = {
        content: { html, css, ...(headLinks ? { headLinks } : {}) },
        status: pageStatus,
        ...(page?.name && { name: page.name }),
        ...(page?.slug && { slug: page.slug }),
        ...(page?.seo && { seo: page.seo }),
      };

      console.log('[HTML SET]', { source: 'handleSave:payload', length: html?.length || 0 });
      console.log('[CSS SET]', { source: 'handleSave:payload', length: css?.length || 0 });

      const updated = await websiteWizardApi.updatePage(pageId, payload);


      // FIX: after a save we update metadata (page record, status, cache) but
      // do NOT call setHtml/setCss from the server response. The editor already
      // has the canonical content — the user just edited it. Overwriting html/css
      // state with server-normalised HTML would trigger a new prop delivery into
      // GrapesPageEditor, which (before the GPE fix) could blank the canvas.
      // The editor's onChange keeps html/css state current; no re-sync needed here.
      setPage(updated);
      setPageStatus(updated?.status || "Draft");

      cachePage(updated._id || pageId, {
        ...updated,
        // Keep the content the editor has, not whatever the server returned,
        // so a subsequent refresh rehydrates exactly what is on the canvas.
        content: { html, css, ...(headLinks ? { headLinks } : {}) },
      });

      setSavedAt(new Date());
      setIsDirty(false);
      message.success("Page saved.");
    } catch (err) {
      console.error("[BccBuilder] save failed:", err);
      message.error(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [pageId, page, html, css, headLinks, pageStatus]);

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

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Select
            value={pageStatus}
            onChange={(v) => {
              setPageStatus(v);
              setIsDirty(true);
            }}
            size="small"
            style={{ width: 110 }}
          >
            <Option value="Draft">Draft</Option>
            <Option value="Published">Published</Option>
          </Select>

          <Tooltip title="Open preview in new tab">
            <Button
              icon={<Eye size={15} />}
              onClick={() => {
                const opened = openPagePreview({
                  ...page,
                  content: { html, css, ...(headLinks ? { headLinks } : {}) },
                });
                if (!opened) message.error("Popup blocked. Allow popups to preview this page.");
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
            <span>
              <b style={{ color: "var(--text-secondary)" }}>websiteId</b>: {websiteId}
            </span>
            <span>
              <b style={{ color: "var(--text-secondary)" }}>pageId</b>: {pageId}
            </span>
            <span>
              <b style={{ color: "var(--text-secondary)" }}>type</b>: grapesjs
            </span>
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
              {html?.length ? `${html.length.toLocaleString()} chars` : "blank page"}
            </span>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <GrapesPageEditor
              height="100%"
              pageKey={pageId}
              websiteId={websiteId}
              initialHtml={html}
              initialCss={css}
              initialHeadLinks={headLinks}
              onChange={({ html: nextHtml, css: nextCss }) => {
                setHtml(nextHtml);
                setCss(nextCss);
                setIsDirty(true);
              }}
            />
          </div>

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
              {page.seo.title && (
                <span>
                  Title: <b style={{ color: "var(--text-primary)" }}>{page.seo.title}</b>
                </span>
              )}
              {page.seo.description && (
                <span>
                  Description:{" "}
                  <b style={{ color: "var(--text-primary)" }}>
                    {page.seo.description.slice(0, 60)}
                    {page.seo.description.length > 60 ? "…" : ""}
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
