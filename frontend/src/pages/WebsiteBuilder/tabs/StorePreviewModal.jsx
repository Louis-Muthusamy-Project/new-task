import React, { useEffect, useMemo, useState } from "react";
import { Modal, Spin, Tooltip, Empty, Button } from "antd";
import { Monitor, Tablet, Smartphone, ExternalLink } from "lucide-react";
import { storeApi } from "../../../api/storeApi";
import { buildPreviewHtml } from "../utils/previewHtml";

// Store-module counterpart of the Desktop/Mobile viewport toggle in
// BccBuilder.jsx — adds a Tablet size and renders full storefront pages
// (fetched via storeApi.previewStore) instead of a single page under edit.
const VIEWPORTS = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%", height: "100%" },
  tablet: { label: "Tablet", icon: Tablet, width: 834, height: 1112 },
  mobile: { label: "Mobile", icon: Smartphone, width: 390, height: 844 },
};

const StorePreviewModal = ({ open, onClose, storeId, storeSlug }) => {
  const [viewport, setViewport] = useState("desktop");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (!open || !storeId) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    storeApi
      .previewStore(storeId)
      .then(({ pages: fetchedPages }) => {
        if (cancelled) return;
        setPages(fetchedPages || []);
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

  const homePage = useMemo(
    () => pages.find((p) => p.isHome) || pages[0] || null,
    [pages]
  );

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
        https://jeema.one/shop/{storeSlug}
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
