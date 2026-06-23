import React, { useState } from "react";
import { Modal, Input, Button } from "antd";
import { Sparkles, LayoutTemplate } from "lucide-react";

/**
 * CreateWebsiteModal
 *
 * Props:
 *   open          – boolean, controls visibility
 *   onCancel      – () => void, closes the modal without action
 *   onCreateBlank – (websiteName: string) => void, user chose "From blank"
 *   onCreateAI    – UI-only placeholder; kept for future wiring
 *   onOpenTemplates – () => void, user chose "From templates" → opens TemplateLibraryModal
 */
const CreateWebsiteModal = ({ open, onCancel, onCreateBlank, onOpenTemplates }) => {
  const [selectedType, setSelectedType] = useState("blank");
  const [websiteName, setWebsiteName] = useState("");

  const handleCreate = () => {
    if (!websiteName.trim()) return;

    if (selectedType === "blank") {
      onCreateBlank(websiteName.trim());
    } else if (selectedType === "templates") {
      onOpenTemplates();
    }
    // "ai" is UI-only for now — no action taken beyond selection

    // Reset internal state
    setWebsiteName("");
    setSelectedType("blank");
  };

  const isFormValid = websiteName.trim().length > 0 && selectedType !== "ai";

  /* ─── card style helpers ─── */
  const cardBase = {
    flex: 1,
    borderRadius: 16,
    padding: 24,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    flexDirection: "column",
  };

  const radioCircle = (active, color) => ({
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: active ? `6px solid ${color}` : "2px solid var(--border-color)",
    background: "#fff",
    flexShrink: 0,
  });

  return (
    <Modal
      open={open}
      onCancel={() => {
        setWebsiteName("");
        setSelectedType("blank");
        onCancel();
      }}
      footer={null}
      width={860}
      title={
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            paddingBottom: 16,
            borderBottom: "1px solid var(--border-color)",
            color: "var(--text-primary)",
          }}
        >
          Create New Website
        </div>
      }
      className="glassmorphism-modal"
      bodyStyle={{ padding: "24px 0 0" }}
      closeIcon={<span style={{ color: "var(--text-secondary)" }}>✕</span>}
    >
      {/* ── Option cards ── */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>

        {/* From blank */}
        <div
          onClick={() => setSelectedType("blank")}
          style={{
            ...cardBase,
            border:
              selectedType === "blank"
                ? "2px solid var(--accent-primary)"
                : "1px solid var(--border-color)",
            background:
              selectedType === "blank"
                ? "rgba(59,130,246,0.05)"
                : "var(--bg-secondary)",
            boxShadow:
              selectedType === "blank" ? "var(--shadow-md)" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              From blank
            </span>
            <div style={radioCircle(selectedType === "blank", "var(--accent-primary)")} />
          </div>

          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 28,
              minHeight: 36,
            }}
          >
            Design from scratch using the website builder
          </div>

          <div
            style={{
              textAlign: "center",
              color: "var(--text-tertiary)",
              fontSize: 13,
              fontWeight: 700,
              padding: "18px 0",
              background: "var(--bg-primary)",
              borderRadius: 12,
              marginTop: "auto",
              border: "1px dashed var(--border-color)",
            }}
          >
            Empty site with a home page
          </div>
        </div>

        {/* Create with AI – UI only */}
        <div
          onClick={() => setSelectedType("ai")}
          style={{
            ...cardBase,
            border:
              selectedType === "ai"
                ? "2px solid #7C3AED"
                : "1px solid var(--border-color)",
            background:
              selectedType === "ai"
                ? "rgba(124,58,237,0.05)"
                : "var(--bg-secondary)",
            boxShadow: selectedType === "ai" ? "var(--shadow-md)" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Create with AI
              </span>
              <span
                style={{
                  background: "rgba(124,58,237,0.12)",
                  color: "#7C3AED",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 12,
                }}
              >
                Beta
              </span>
            </div>
            <div style={radioCircle(selectedType === "ai", "#7C3AED")} />
          </div>

          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 28,
              minHeight: 36,
            }}
          >
            Generate content from your business brief
          </div>

          <div
            style={{
              background: "#7C3AED",
              color: "#fff",
              padding: "18px 0",
              textAlign: "center",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 13,
              marginTop: "auto",
            }}
          >
            Home + contact pages
          </div>
        </div>

        {/* From templates */}
        <div
          onClick={() => setSelectedType("templates")}
          style={{
            ...cardBase,
            border:
              selectedType === "templates"
                ? "2px solid var(--accent-info)"
                : "1px solid var(--border-color)",
            background:
              selectedType === "templates"
                ? "rgba(14,165,233,0.05)"
                : "var(--bg-secondary)",
            boxShadow:
              selectedType === "templates" ? "var(--shadow-md)" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <LayoutTemplate size={17} color="var(--accent-info)" />
              From templates
            </span>
            <div style={radioCircle(selectedType === "templates", "var(--accent-info)")} />
          </div>

          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 28,
              minHeight: 36,
            }}
          >
            Jump start with an awesome prebuilt Website
          </div>

          <div
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              padding: "14px 0",
              textAlign: "center",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 15,
              color: "var(--text-primary)",
              marginTop: "auto",
            }}
          >
            Over 500+<br />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>
              Templates
            </span>
          </div>
        </div>
      </div>

      {/* ── Website Name field ── */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 8,
            color: "var(--text-primary)",
          }}
        >
          Website name{" "}
          <span style={{ color: "var(--accent-danger)" }}>*</span>
        </div>
        <Input
          size="large"
          placeholder="e.g. Acme Plumbing"
          value={websiteName}
          onChange={(e) => setWebsiteName(e.target.value)}
          onPressEnter={isFormValid ? handleCreate : undefined}
          style={{ borderRadius: 8 }}
        />
      </div>

      {/* ── Footer buttons ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          paddingTop: 20,
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <Button
          size="large"
          onClick={() => {
            setWebsiteName("");
            setSelectedType("blank");
            onCancel();
          }}
          style={{
            borderRadius: 8,
            fontWeight: 700,
            padding: "0 28px",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
            background: "var(--bg-primary)",
          }}
        >
          Cancel
        </Button>

        <Button
          size="large"
          type="primary"
          onClick={handleCreate}
          disabled={!isFormValid}
          style={{
            background:
              selectedType === "templates"
                ? "var(--accent-info)"
                : "var(--accent-primary)",
            border: "none",
            borderRadius: 8,
            fontWeight: 800,
            padding: "0 32px",
          }}
        >
          Create
        </Button>
      </div>
    </Modal>
  );
};

export default CreateWebsiteModal;
