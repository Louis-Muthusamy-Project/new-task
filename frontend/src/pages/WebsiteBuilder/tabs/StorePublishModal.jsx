import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, message } from "antd";
import { Hammer, UploadCloud, Save, Link2, Check, Loader2, Copy, ExternalLink } from "lucide-react";
import { storeApi } from "../../../api/storeApi";

// Store-module counterpart of publishService.js's publishWebsite() —
// walks the person through the same pipeline the backend actually runs
// (Fetch Store/Pages -> Build Snapshot -> Resolve URL -> Save -> Mark
// Published), relabelled to match the Publish module's stages.
const STAGES = [
  { key: "build", label: "Generate Build", icon: Hammer },
  { key: "upload", label: "Upload Assets", icon: UploadCloud },
  { key: "save", label: "Save", icon: Save },
  { key: "live", label: "Live URL", icon: Link2 },
];

// Minimum time (ms) to visually hold each stage so the pipeline reads as
// real steps even when the API call resolves quickly.
const STAGE_MIN_MS = 550;

const StorePublishModal = ({ open, onClose, storeId, storeSlug }) => {
  const [stageIndex, setStageIndex] = useState(-1); // -1 = not started
  const [error, setError] = useState("");
  const [publishUrl, setPublishUrl] = useState("");
  const runId = useRef(0);

  useEffect(() => {
    if (!open || !storeId) return;

    const thisRun = ++runId.current;
    setError("");
    setPublishUrl("");
    setStageIndex(0);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    (async () => {
      try {
        // Advance through Generate Build / Upload Assets visually while the
        // real request is in flight.
        const apiCall = storeApi.publishStore(storeId);

        for (let i = 0; i < STAGES.length - 2; i++) {
          if (runId.current !== thisRun) return;
          setStageIndex(i);
          await sleep(STAGE_MIN_MS);
        }

        if (runId.current !== thisRun) return;
        setStageIndex(STAGES.length - 2); // "Save"
        const url = await apiCall;
        await sleep(STAGE_MIN_MS);

        if (runId.current !== thisRun) return;
        setStageIndex(STAGES.length - 1); // "Live URL"
        setPublishUrl(url);
      } catch (err) {
        if (runId.current !== thisRun) return;
        setError(err?.message || "Failed to publish store.");
      }
    })();

    return () => {
      runId.current++;
    };
  }, [open, storeId]);

  const isDone = !!publishUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publishUrl);
      message.success("Live URL copied.");
    } catch (_) {
      message.error("Couldn't copy — copy it manually.");
    }
  };

  return (
    <Modal
      title={
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
          {isDone ? "Store published" : error ? "Publish failed" : "Publishing store…"}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        isDone
          ? [
              <Button
                key="close"
                onClick={onClose}
                style={{ borderRadius: 8, fontWeight: 700, borderColor: "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              >
                Close
              </Button>,
              <Button
                key="open"
                type="primary"
                icon={<ExternalLink size={14} />}
                onClick={() => window.open(publishUrl, "_blank", "noopener")}
                style={{ background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}
              >
                Visit live store
              </Button>,
            ]
          : error
          ? [
              <Button
                key="close"
                onClick={onClose}
                style={{ borderRadius: 8, fontWeight: 700, borderColor: "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              >
                Close
              </Button>,
            ]
          : null
      }
      maskClosable={false}
      closable={isDone || !!error}
      width={480}
    >
      <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
        Publishing <strong style={{ color: "var(--text-primary)" }}>{storeSlug}</strong> — this
        builds every page, uploads the assets, and puts your storefront live.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isCurrent = !error && !isDone && i === stageIndex;
          const isComplete = isDone || i < stageIndex || (i === stageIndex && stage.key === "live" && isDone);
          const isFailedHere = error && i === stageIndex;

          let iconNode;
          if (isFailedHere) {
            iconNode = <span style={{ color: "var(--accent-danger, #ef4444)", fontWeight: 800 }}>✕</span>;
          } else if (isComplete) {
            iconNode = <Check size={16} color="#fff" />;
          } else if (isCurrent) {
            iconNode = <Loader2 size={16} color="#fff" className="spin" />;
          } else {
            iconNode = <Icon size={14} color="var(--text-tertiary)" />;
          }

          return (
            <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 4px" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isFailedHere
                    ? "rgba(239, 68, 68, 0.15)"
                    : isComplete || isCurrent
                    ? "var(--accent-success)"
                    : "var(--bg-secondary)",
                  border: isComplete || isCurrent || isFailedHere ? "none" : "1px solid var(--border-color)",
                }}
              >
                {iconNode}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: isCurrent ? 800 : 600,
                  color: isFailedHere
                    ? "var(--accent-danger, #ef4444)"
                    : isComplete || isCurrent
                    ? "var(--text-primary)"
                    : "var(--text-tertiary)",
                }}
              >
                {stage.label}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(239, 68, 68, 0.08)",
            color: "var(--accent-danger, #ef4444)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {isDone && (
        <div
          style={{
            marginTop: 20,
            padding: "14px 16px",
            borderRadius: 10,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-primary)", wordBreak: "break-all" }}>
            {publishUrl}
          </span>
          <Button
            size="small"
            icon={<Copy size={13} />}
            onClick={handleCopy}
            style={{ borderRadius: 6, fontWeight: 600, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", flexShrink: 0 }}
          >
            Copy
          </Button>
        </div>
      )}

      <style>{`
        .spin { animation: store-publish-spin 0.9s linear infinite; }
        @keyframes store-publish-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Modal>
  );
};

export default StorePublishModal;
