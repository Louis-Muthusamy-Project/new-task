import React from "react";
import { Dropdown, Button, Popconfirm } from "antd";
import {
  MoreHorizontal, ChevronRight, Eye, Copy, FilesIcon, Star,
  Archive, ArchiveRestore, Trash2,
} from "lucide-react";

/**
 * Single reusable "Quick Actions" dropdown, used from the dashboard table.
 * Every action here calls straight into the same funnelApi wrappers used
 * elsewhere (list handlers own the actual API calls) — this component is
 * purely presentation + wiring.
 */
const FunnelQuickActions = ({
  funnel,
  onManage,
  onPreview,
  onDuplicate,
  onClone,
  onToggleFavorite,
  onArchive,
  onRestore,
  onDelete,
}) => {
  const isArchived = funnel.status === "Archived";

  const items = [
    { key: "manage", label: "Manage", icon: <ChevronRight size={14} /> },
    { key: "preview", label: "Preview", icon: <Eye size={14} /> },
    { type: "divider" },
    { key: "favorite", label: funnel.isFavorite ? "Remove from favorites" : "Add to favorites", icon: <Star size={14} /> },
    { key: "duplicate", label: "Duplicate", icon: <Copy size={14} /> },
    { key: "clone", label: "Clone as new", icon: <FilesIcon size={14} /> },
    { type: "divider" },
    isArchived
      ? { key: "restore", label: "Restore", icon: <ArchiveRestore size={14} /> }
      : { key: "archive", label: "Archive", icon: <Archive size={14} /> },
    {
      key: "delete",
      danger: true,
      icon: <Trash2 size={14} />,
      // Wrapped in its own Popconfirm so deleting always asks first, same
      // as the existing "Delete Funnel" button in ManageFunnelView.
      label: (
        <Popconfirm
          title="Delete this funnel?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(funnel)}
        >
          <span onClick={(e) => e.stopPropagation()}>Delete</span>
        </Popconfirm>
      ),
    },
  ];

  const handleClick = ({ key, domEvent }) => {
    switch (key) {
      case "manage": return onManage(funnel);
      case "preview": return onPreview(funnel);
      case "favorite": return onToggleFavorite(funnel);
      case "duplicate": return onDuplicate(funnel);
      case "clone": return onClone(funnel);
      case "archive": return onArchive(funnel);
      case "restore": return onRestore(funnel);
      default: return null; // 'delete' is handled entirely by its Popconfirm
    }
  };

  return (
    <Dropdown menu={{ items, onClick: handleClick }} trigger={["click"]}>
      <Button type="text" icon={<MoreHorizontal size={16} />} onClick={(e) => e.stopPropagation()} />
    </Dropdown>
  );
};

export default FunnelQuickActions;
