import React from "react";
import { Tag } from "antd";

// Central place for funnel status -> color mapping so every surface in the
// dashboard (table rows, cards, quick actions) renders status identically.
const STATUS_COLORS = {
  Draft: "orange",
  Published: "green",
  Archived: "default",
};

const FunnelStatusBadge = ({ status }) => (
  <Tag
    color={STATUS_COLORS[status] || "default"}
    style={{ borderRadius: 12, fontWeight: 700, margin: 0 }}
  >
    {(status || "Draft").toUpperCase()}
  </Tag>
);

export default FunnelStatusBadge;
