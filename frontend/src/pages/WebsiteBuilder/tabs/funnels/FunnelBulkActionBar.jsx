import React from "react";
import { Button, Popconfirm, Space, Typography } from "antd";
import { Trash2, UploadCloud, Archive, X } from "lucide-react";

const { Text } = Typography;

const FunnelBulkActionBar = ({ selectedCount, onClear, onBulkDelete, onBulkPublish, onBulkArchive }) => {
  if (!selectedCount) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 16px",
        marginBottom: 16,
        borderRadius: 10,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
      }}
    >
      <Space>
        <Button type="text" size="small" icon={<X size={14} />} onClick={onClear} />
        <Text style={{ fontWeight: 700, color: "var(--text-primary)" }}>
          {selectedCount} funnel{selectedCount > 1 ? "s" : ""} selected
        </Text>
      </Space>
      <Space size="small">
        <Popconfirm title={`Publish ${selectedCount} funnel(s)?`} onConfirm={onBulkPublish}>
          <Button icon={<UploadCloud size={14} />}>Publish</Button>
        </Popconfirm>
        <Popconfirm title={`Archive ${selectedCount} funnel(s)?`} onConfirm={onBulkArchive}>
          <Button icon={<Archive size={14} />}>Archive</Button>
        </Popconfirm>
        <Popconfirm title={`Delete ${selectedCount} funnel(s)? This cannot be undone.`} onConfirm={onBulkDelete}>
          <Button danger icon={<Trash2 size={14} />}>Delete</Button>
        </Popconfirm>
      </Space>
    </div>
  );
};

export default FunnelBulkActionBar;
