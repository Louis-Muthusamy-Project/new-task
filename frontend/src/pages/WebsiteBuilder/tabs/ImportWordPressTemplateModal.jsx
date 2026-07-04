import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Upload, Progress, Alert, Typography, Tag, message } from "antd";
import {
  Globe,
  UploadCloud,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  RotateCcw,
  Store,
} from "lucide-react";
import { storeTemplateApi } from "../../../api/storeTemplateApi";

const { Dragger } = Upload;
const { Text } = Typography;

// Mirrors the backend's own multer limit in storeTemplateController.js
// (50 MB) so a too-large ZIP is rejected instantly, client-side, instead of
// only after a slow upload.
const MAX_FILE_MB = 50;

// Visual stages — line up with the WordPress Import Pipeline architecture
// doc's 8 stages, condensed to what's observable from the browser: real
// upload progress drives "Upload ZIP", the rest advance while the single
// POST /api/wordpress-import/upload request is in flight (same technique
// StorePublishModal.jsx uses for its own pipeline stages).
const STAGES = [
  { key: "upload", label: "Upload ZIP", icon: UploadCloud },
  { key: "validate", label: "Validate structure", icon: ShieldCheck },
  { key: "assets", label: "Upload assets & rewrite URLs", icon: ImageIcon },
  { key: "template", label: "Create store template", icon: FileText },
];

const STAGE_MIN_MS = 500;

// Mirrors backend/src/utils/storeBlockTemplates.js's COMPONENT_LABELS /
// MANUAL_MAPPING_TYPES so the summary below reads the same language a
// human sees in the pipeline's warnings[] — kept as a small display-only
// duplicate rather than an import, since this is a frontend bundle and
// that file is backend-only CommonJS.
const COMPONENT_LABELS = {
  header: "Header",
  footer: "Footer",
  navigation: "Navigation",
  hero: "Hero",
  "product-grid": "Product Grid",
  "category-grid": "Category Grid",
  "contact-form": "Contact Form",
  newsletter: "Newsletter",
  "blog-list": "Blog List",
  search: "Search Box",
  "cart-button": "Cart Button",
  "checkout-button": "Checkout Button",
};
const MANUAL_MAPPING_TYPES = new Set(["contact-form", "newsletter", "blog-list"]);

/**
 * Dedicated import modal for "Import WordPress Template" (Simply Static
 * exports). Reuses the same StoreTemplate library the manual "Upload
 * template" flow writes to (storeTemplateApi.importWordPressTemplate ->
 * POST /api/wordpress-import/upload -> StoreTemplate), so nothing about the
 * existing Store Template Library workflow changes — this only adds a new
 * way to populate it.
 *
 * Props:
 *  - open, onClose
 *  - onImported(template, warnings) — called once the StoreTemplate is
 *    created, so the caller (StoreTemplateLibraryModal) can refresh its list
 *    and select/highlight the new template.
 *  - onUseTemplate(template) — "Create store from this template": closes
 *    this modal and hands the template back so the caller can select it and
 *    reuse its existing Create Store flow.
 */
const ImportWordPressTemplateModal = ({ open, onClose, onImported, onUseTemplate }) => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  // phase: 'select' | 'importing' | 'success' | 'error'
  const [phase, setPhase] = useState("select");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [stageIndex, setStageIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [componentSummary, setComponentSummary] = useState(null);
  const [result, setResult] = useState(null); // created StoreTemplate

  const runId = useRef(0);

  // Reset all state whenever the modal is (re)opened, so a previous
  // import's success/error doesn't linger if it's reopened for another file.
  useEffect(() => {
    if (!open) return;
    runId.current++;
    setFile(null);
    setFileError("");
    setPhase("select");
    setUploadPercent(0);
    setStageIndex(-1);
    setErrorMessage("");
    setValidationErrors([]);
    setWarnings([]);
    setComponentSummary(null);
    setResult(null);
  }, [open]);

  // ── Client-side validation (Requirement: "Validation") ──────────────────
  // Catches the obvious cases instantly, before spending a network round
  // trip — the backend's own Stage 3 (Validate Structure) still runs as the
  // source of truth for everything that requires opening the ZIP.
  const validateFile = (candidate) => {
    if (!candidate) return "No file selected.";
    const isZip =
      /\.zip$/i.test(candidate.name || "") ||
      candidate.type === "application/zip" ||
      candidate.type === "application/x-zip-compressed";
    if (!isZip) return "Please select a .zip file exported from Simply Static.";
    if (candidate.size === 0) return "That file is empty.";
    if (candidate.size > MAX_FILE_MB * 1024 * 1024) {
      return `That file is larger than the ${MAX_FILE_MB} MB limit.`;
    }
    return "";
  };

  const handlePick = (candidate) => {
    const err = validateFile(candidate);
    setFile(candidate);
    setFileError(err);
    return false; // prevent antd's Upload from auto-uploading
  };

  const startImport = async () => {
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      return;
    }

    const thisRun = ++runId.current;
    setPhase("importing");
    setUploadPercent(0);
    setStageIndex(0);
    setErrorMessage("");
    setValidationErrors([]);
    setWarnings([]);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const displayName = file.name.replace(/\.[^/.]+$/, "");

    try {
      const apiCall = storeTemplateApi.importWordPressTemplate({
        file,
        name: displayName,
        category: "Other",
        description: "Imported from a WordPress (Simply Static) export.",
        status: "Published",
        onProgress: (pct) => {
          if (runId.current !== thisRun) return;
          setUploadPercent(pct);
          if (pct >= 100 && stageIndexRef.current < 1) {
            setStageIndex(1); // move into "Validate structure" once the file is fully sent
          }
        },
      });

      // Advance the remaining visual stages while the server does its work —
      // same "hold each stage a beat" technique StorePublishModal.jsx uses,
      // since a single request/response can't report granular server-side
      // progress without a streaming protocol this backend doesn't expose.
      for (let i = 1; i < STAGES.length - 1; i++) {
        if (runId.current !== thisRun) return;
        setStageIndex(i);
        await sleep(STAGE_MIN_MS);
      }

      if (runId.current !== thisRun) return;
      setStageIndex(STAGES.length - 1);
      const { template, warnings: importWarnings, componentSummary: summary } = await apiCall;
      await sleep(STAGE_MIN_MS);

      if (runId.current !== thisRun) return;
      setResult(template);
      setWarnings(importWarnings || []);
      setComponentSummary(summary || null);
      setPhase("success");
      message.success(`"${template?.name || displayName}" imported.`);
      onImported?.(template, importWarnings || []);
    } catch (e) {
      if (runId.current !== thisRun) return;
      setErrorMessage(e?.message || "Couldn't import this WordPress export.");
      setValidationErrors(Array.isArray(e?.errors) ? e.errors : []);
      setPhase("error");
    }
  };

  // Ref mirror of stageIndex so the onProgress callback (captured once per
  // startImport call) always reads the latest value.
  const stageIndexRef = useRef(-1);
  useEffect(() => {
    stageIndexRef.current = stageIndex;
  }, [stageIndex]);

  const handleTryAgain = () => {
    setPhase("select");
    setErrorMessage("");
    setValidationErrors([]);
    setStageIndex(-1);
    setUploadPercent(0);
    setComponentSummary(null);
  };

  const footer = (() => {
    if (phase === "select") {
      return [
        <Button
          key="cancel"
          onClick={onClose}
          style={{ borderRadius: 8, fontWeight: 700, borderColor: "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
        >
          Cancel
        </Button>,
        <Button
          key="start"
          type="primary"
          icon={<UploadCloud size={14} />}
          onClick={startImport}
          disabled={!file || !!fileError}
          style={{ background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}
        >
          Start import
        </Button>,
      ];
    }
    if (phase === "importing") return null; // no dismiss mid-flight — mirrors StorePublishModal
    if (phase === "success") {
      return [
        <Button
          key="close"
          onClick={onClose}
          style={{ borderRadius: 8, fontWeight: 700, borderColor: "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
        >
          Done
        </Button>,
        <Button
          key="use"
          type="primary"
          icon={<Store size={14} />}
          onClick={() => onUseTemplate?.(result)}
          style={{ background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}
        >
          Create store from this template
        </Button>,
      ];
    }
    // error
    return [
      <Button
        key="close"
        onClick={onClose}
        style={{ borderRadius: 8, fontWeight: 700, borderColor: "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
      >
        Close
      </Button>,
      <Button
        key="retry"
        type="primary"
        icon={<RotateCcw size={14} />}
        onClick={handleTryAgain}
        style={{ background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}
      >
        Try again
      </Button>,
    ];
  })();

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
          <Globe size={20} color="var(--accent-success)" />
          Import WordPress Template
        </div>
      }
      open={open}
      onCancel={phase === "importing" ? undefined : onClose}
      maskClosable={phase !== "importing"}
      closable={phase !== "importing"}
      footer={footer}
      width={520}
    >
      {phase === "select" && (
        <div>
          <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 16 }}>
            Upload a static export of a WordPress site produced by the{" "}
            <strong>Simply Static</strong> plugin. The export is treated purely as static
            HTML/CSS/assets — no PHP runs and WordPress itself is never installed.
          </Text>

          <Dragger
            multiple={false}
            accept=".zip"
            fileList={file ? [{ uid: "1", name: file.name, status: fileError ? "error" : "done" }] : []}
            beforeUpload={handlePick}
            onRemove={() => {
              setFile(null);
              setFileError("");
            }}
            style={{
              background: "var(--bg-secondary)",
              border: `1px dashed ${fileError ? "var(--accent-danger, #ef4444)" : "var(--border-color)"}`,
              borderRadius: 12,
            }}
          >
            <p style={{ margin: "8px 0" }}>
              <UploadCloud size={28} color="var(--accent-success)" />
            </p>
            <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14, margin: 0 }}>
              Click or drag a Simply Static ZIP here
            </p>
            <p style={{ color: "var(--text-tertiary)", fontSize: 12, marginTop: 4 }}>
              .zip only, up to {MAX_FILE_MB} MB — must contain index.html
            </p>
          </Dragger>

          {fileError && (
            <Alert
              type="error"
              showIcon
              icon={<AlertCircle size={14} />}
              message={fileError}
              style={{ marginTop: 12, borderRadius: 8 }}
            />
          )}
        </div>
      )}

      {phase === "importing" && (
        <div>
          <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 16 }}>
            Importing <strong style={{ color: "var(--text-primary)" }}>{file?.name}</strong> — this
            extracts the export, validates it, uploads every asset to the CDN, and creates a
            store template.
          </Text>

          <Progress
            percent={uploadPercent}
            status={uploadPercent < 100 ? "active" : "success"}
            strokeColor="var(--accent-success)"
            style={{ marginBottom: 20 }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isCurrent = i === stageIndex;
              const isComplete = i < stageIndex;

              let iconNode;
              if (isComplete) iconNode = <Check size={16} color="#fff" />;
              else if (isCurrent) iconNode = <Loader2 size={16} color="#fff" className="spin" />;
              else iconNode = <Icon size={14} color="var(--text-tertiary)" />;

              return (
                <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 4px" }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: isComplete || isCurrent ? "var(--accent-success)" : "var(--bg-secondary)",
                      border: isComplete || isCurrent ? "none" : "1px solid var(--border-color)",
                    }}
                  >
                    {iconNode}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 800 : 600,
                      color: isComplete || isCurrent ? "var(--text-primary)" : "var(--text-tertiary)",
                    }}
                  >
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>

          <style>{`
            .spin { animation: wp-import-spin 0.9s linear infinite; }
            @keyframes wp-import-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {phase === "success" && result && (
        <div>
          <Alert
            type="success"
            showIcon
            icon={<Check size={14} />}
            message={`"${result.name}" was imported successfully.`}
            description={`${(result.pages || []).length} page(s) were created and the template is now in your Store Template Library.`}
            style={{ borderRadius: 8, marginBottom: 16 }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: warnings.length ? 16 : 0 }}>
            <Tag style={{ borderRadius: 12, padding: "2px 10px" }}>{result.category || "Other"}</Tag>
            <Tag style={{ borderRadius: 12, padding: "2px 10px" }}>
              {(result.pages || []).length} page{(result.pages || []).length === 1 ? "" : "s"}
            </Tag>
            <Tag color="green" style={{ borderRadius: 12, padding: "2px 10px" }}>
              Imported from WordPress
            </Tag>
          </div>

          {componentSummary && componentSummary.totalDetected > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 12.5, display: "block", marginBottom: 8, color: "var(--text-primary)" }}>
                Detected components
              </Text>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.entries(componentSummary.byType || {}).map(([type, count]) => {
                  const needsManual = MANUAL_MAPPING_TYPES.has(type);
                  return (
                    <Tag
                      key={type}
                      color={needsManual ? "orange" : "green"}
                      style={{ borderRadius: 12, padding: "2px 10px", margin: 0 }}
                    >
                      {COMPONENT_LABELS[type] || type} × {count}
                      {needsManual ? " — Needs Manual Mapping" : ""}
                    </Tag>
                  );
                })}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <Alert
              type="warning"
              showIcon
              icon={<AlertCircle size={14} />}
              message="Review before publishing"
              description={
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {warnings.map((w, i) => (
                    <li key={i} style={{ fontSize: 12.5 }}>{w}</li>
                  ))}
                </ul>
              }
              style={{ borderRadius: 8 }}
            />
          )}
        </div>
      )}

      {phase === "error" && (
        <div>
          <Alert
            type="error"
            showIcon
            icon={<AlertCircle size={14} />}
            message="Import failed"
            description={errorMessage}
            style={{ borderRadius: 8, marginBottom: validationErrors.length ? 12 : 0 }}
          />
          {validationErrors.length > 0 && (
            <Alert
              type="error"
              showIcon={false}
              message="Details"
              description={
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {validationErrors.map((e, i) => (
                    <li key={i} style={{ fontSize: 12.5 }}>{e}</li>
                  ))}
                </ul>
              }
              style={{ borderRadius: 8 }}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default ImportWordPressTemplateModal;