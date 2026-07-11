import React, { useState } from "react";
import { Tag, Popover, Input, Button, Space } from "antd";
import { Tags as TagsIcon, Plus } from "lucide-react";

/**
 * Shows a funnel's tags as small pills, with a "+" popover to add/remove
 * tags inline from the dashboard table — no separate page/modal needed.
 * Saves via the same PATCH /:id endpoint as everything else (funnelApi.setTags).
 */
const FunnelTagsEditor = ({ tags = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const commitAdd = () => {
    const value = draft.trim();
    if (!value) return;
    if (!tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
  };

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const content = (
    <div style={{ width: 220 }}>
      <Space wrap style={{ marginBottom: 8 }}>
        {tags.length === 0 && (
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No tags yet</span>
        )}
        {tags.map((tag) => (
          <Tag key={tag} closable onClose={() => removeTag(tag)} style={{ borderRadius: 8 }}>
            {tag}
          </Tag>
        ))}
      </Space>
      <Input
        size="small"
        placeholder="Add tag + Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onPressEnter={commitAdd}
        suffix={
          <Plus
            size={14}
            style={{ cursor: "pointer", color: "var(--accent-secondary)" }}
            onClick={commitAdd}
          />
        }
      />
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {tags.slice(0, 2).map((tag) => (
        <Tag key={tag} style={{ borderRadius: 8, margin: 0 }}>
          {tag}
        </Tag>
      ))}
      {tags.length > 2 && (
        <Tag style={{ borderRadius: 8, margin: 0 }}>+{tags.length - 2}</Tag>
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger="click"
        content={content}
        title="Tags"
      >
        <Button
          type="text"
          size="small"
          icon={<TagsIcon size={13} />}
          style={{ color: "var(--text-tertiary)", padding: "0 4px" }}
        />
      </Popover>
    </div>
  );
};

export default FunnelTagsEditor;
