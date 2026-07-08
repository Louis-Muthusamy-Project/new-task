import React, { useState } from "react";
import { Modal, Tooltip, Button } from "antd";
import { Monitor, Tablet, Smartphone, ExternalLink } from "lucide-react";
import StorefrontApp from "../storefront/StorefrontApp";

// Store-module counterpart of the Desktop/Mobile viewport toggle in
// BccBuilder.jsx — adds a Tablet size and renders the real, dynamic
// storefront (StorefrontApp — a mounted React tree that fetches live data
// from the Store Engine's public API) instead of a static HTML snapshot
// of a single stored page. Every section (Header/Menu, Home, Featured/
// Latest/Best Sellers, Collections, Product, Search, Footer) fetches its
// own data, so anything changed in Admin (e.g. a new product) shows up
// here the moment its query re-fetches — no iframe, no srcDoc, no cached
// HTML string.
const VIEWPORTS = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%" },
  tablet: { label: "Tablet", icon: Tablet, width: 834 },
  mobile: { label: "Mobile", icon: Smartphone, width: 390 },
};

const StorePreviewModal = ({ open, onClose, storeId, storeSlug }) => {
  const [viewport, setViewport] = useState("desktop");
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
      destroyOnClose
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
        <div
          style={{
            width: active.width,
            maxWidth: "100%",
            height: 620,
            maxHeight: "70vh",
            borderRadius: viewport === "desktop" ? 12 : 28,
            overflow: "auto",
            border: "1px solid var(--border-color)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            background: "#fff",
            transition: "width 0.2s ease, border-radius 0.2s ease",
          }}
        >
          {storeId ? (
            <StorefrontApp storeId={storeId} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
              No store selected.
            </div>
          )}
        </div>
      </div>

      {storeId && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Button
            icon={<ExternalLink size={14} />}
            onClick={() => window.open(`/preview/store/${storeId}`, "_blank", "noopener,noreferrer")}
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