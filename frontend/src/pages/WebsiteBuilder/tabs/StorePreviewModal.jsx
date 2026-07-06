import React, { useEffect, useMemo, useState } from "react";
import { Modal, Spin, Tooltip, Empty, Button } from "antd";
import { Monitor, Tablet, Smartphone, ExternalLink } from "lucide-react";
import { storeApi } from "../../../api/storeApi";
import { storeTemplateApi } from "../../../api/storeTemplateApi";
import { buildPreviewHtml } from "../utils/previewHtml";

// Store-module counterpart of the Desktop/Mobile viewport toggle in
// BccBuilder.jsx — adds a Tablet size and renders full storefront pages
// (fetched via storeApi.previewStore) instead of a single page under edit.
const VIEWPORTS = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%", height: "100%" },
  tablet: { label: "Tablet", icon: Tablet, width: 834, height: 1112 },
  mobile: { label: "Mobile", icon: Smartphone, width: 390, height: 844 },
};

// A page counts as "empty" if it has no real markup to show — happens for
// stores whose pages were never opened in the builder yet (content.html
// still '') or, historically, for stores created before
// resolveStoreBlockPlaceholders existed. In that case we fall back to the
// StoreTemplate this store was created from and render its page instead,
// or we render a lightweight placeholder so the preview never shows a blank
// iframe.
const isBlankContent = (content) => {
  if (!content) return true;
  if (typeof content === "string") return !content.replace(/<[^>]*>/g, "").trim();
  if (typeof content === "object") {
    const html = typeof content.html === "string" ? content.html : "";
    return !html.replace(/<[^>]*>/g, "").trim();
  }
  return true;
};

const buildFallbackPreviewPage = (storeName = "Store") => ({
  name: "Home",
  slug: "home",
  isHome: true,
  content: {
    html: `
      <div style="min-height:100vh;background:linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%);display:flex;align-items:center;justify-content:center;padding:32px;font-family:Inter,Segoe UI,sans-serif;">
        <div style="max-width:560px;width:100%;background:#fff;border-radius:24px;padding:32px;box-shadow:0 18px 60px rgba(15,23,42,0.12);border:1px solid #e2e8f0;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:999px;background:#2563eb;color:#fff;font-size:22px;font-weight:800;margin-bottom:16px;">S</div>
          <h1 style="margin:0 0 10px;font-size:30px;font-weight:800;color:#0f172a;">${storeName}</h1>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#475569;">This storefront preview is ready. Add pages or content in the builder and refresh the preview to see it here.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <span style="display:inline-flex;padding:8px 12px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700;">Storefront preview</span>
            <span style="display:inline-flex;padding:8px 12px;border-radius:999px;background:#f8fafc;color:#475569;font-size:12px;font-weight:700;">Responsive layout</span>
          </div>
        </div>
      </div>
    `,
    css: `body{margin:0;background:#f8fafc;} *{box-sizing:border-box;}`,
  },
});

const StorePreviewModal = ({ open, onClose, storeId, storeSlug }) => {
  const [viewport, setViewport] = useState("desktop");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState([]);
  const [fallbackPage, setFallbackPage] = useState(null);

  useEffect(() => {
    if (!open || !storeId) return;

    let cancelled = false;
    setLoading(true);
    setError("");
    setFallbackPage(null);

    storeApi
      .previewStore(storeId)
      .then(async ({ store, pages: fetchedPages }) => {
        if (cancelled) return;
        setPages(fetchedPages || []);

        const home =
          (fetchedPages || []).find((p) => p.isHome) || (fetchedPages || [])[0] || null;

        // Store page has no usable markup yet — fetch the template it was
        // created from and use that page's content as a stand-in. If no
        // template content is available, render a lightweight placeholder so
        // the preview still looks intentional instead of blank.
        const templateId = store?.templateId || store?.template?.templateId;
        if (!home || isBlankContent(home.content)) {
          if (!cancelled && templateId) {
            try {
              const templates = await storeTemplateApi.getAllStoreTemplates();
              const template = (templates || []).find((t) => String(t._id) === String(templateId));
              const templateHome =
                template?.pages?.find((p) => p.isHome) || template?.pages?.[0] || null;
              if (!cancelled && templateHome && !isBlankContent(templateHome.content)) {
                setFallbackPage({
                  name: templateHome.name,
                  slug: templateHome.slug,
                  isHome: true,
                  content: templateHome.content,
                });
                return;
              }
            } catch (err) {
              console.error("Failed to load fallback template preview", err);
            }
          }

          if (!cancelled) {
            setFallbackPage(buildFallbackPreviewPage(store?.storeName || store?.name || "Store"));
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Failed to load store preview.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, storeId]);

  const homePage = useMemo(() => {
    const own = pages.find((p) => p.isHome) || pages[0] || null;
    if (own && !isBlankContent(own.content)) return own;
    return fallbackPage || null;
  }, [pages, fallbackPage]);

  const srcDoc = useMemo(
    () => (homePage ? buildPreviewHtml(homePage) : ""),
    [homePage]
  );

  const active = VIEWPORTS[viewport];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
            Store Preview
          </div>
          <div style={{ display: "flex", gap: 4, background: "var(--bg-primary)", borderRadius: 10, padding: 4, marginRight: 12 }}>
            {Object.entries(VIEWPORTS).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isActive = viewport === key;
              return (
                <Tooltip key={key} title={`${cfg.label} view`}>
                  <div
                    onClick={() => setViewport(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      userSelect: "none",
                      background: isActive ? "var(--accent-primary)" : "transparent",
                      color: isActive ? "#fff" : "var(--text-secondary)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <Icon size={14} /> {cfg.label}
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ top: 24 }}
      bodyStyle={{ padding: 24, background: "var(--bg-primary)" }}
    >
      <div style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, marginBottom: 16 }}>
       /{storeSlug}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "var(--bg-secondary)",
          borderRadius: 16,
          border: "1px solid var(--border-color)",
          padding: 24,
          minHeight: 520,
        }}
      >
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 480 }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 480, color: "var(--accent-danger, #ef4444)", fontWeight: 600 }}>
            {error}
          </div>
        ) : !homePage ? (
          <Empty
            description={
              <span style={{ color: "var(--text-secondary)" }}>
                This store doesn't have any pages yet. Create pages under
                "Website pages" to see them here.
              </span>
            }
            style={{ padding: "60px 0" }}
          />
        ) : (
          <div
            style={{
              width: active.width,
              maxWidth: "100%",
              height: viewport === "desktop" ? 560 : active.height,
              maxHeight: "70vh",
              borderRadius: viewport === "desktop" ? 12 : 28,
              overflow: "hidden",
              border: "1px solid var(--border-color)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              background: "#fff",
              transition: "width 0.2s ease, height 0.2s ease, border-radius 0.2s ease",
            }}
          >
            <iframe
              title="store-preview"
              srcDoc={srcDoc}
              style={{ width: "100%", height: "100%", border: "none" }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}
      </div>

      {homePage && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Button
            icon={<ExternalLink size={14} />}
            onClick={() => {
              const win = window.open("", "_blank");
              if (win) {
                win.document.open();
                win.document.write(srcDoc);
                win.document.close();
                win.opener = null;
              }
            }}
            style={{ borderRadius: 8, fontWeight: 700, borderColor: "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
          >
            Open in new tab
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default StorePreviewModal;