import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Typography, message, Row, Col } from "antd";
import { Users, X } from "lucide-react";
import { customerApi } from "../../../api/storeApi";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  tags: [],
};

// Create / Edit modal for the Customer Module (StoresTab > Customers tab).
const CustomerFormModal = ({ open, onCancel, onSaved, storeId, customer }) => {
  const isEdit = !!customer?._id;
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? {
              firstName: customer.firstName || "",
              lastName: customer.lastName || "",
              email: customer.email || "",
              phone: customer.phone || "",
              tags: customer.tags || [],
            }
          : emptyForm
      );
      setTagInput("");
    }
  }, [open, customer]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (t) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const handleSave = async () => {
    if (!form.firstName.trim() && !form.lastName.trim()) {
      message.error("First or last name is required.");
      return;
    }
    if (!storeId) {
      message.error("This store isn't linked to a backend record yet, so customers can't be saved.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        tags: form.tags,
      };

      const saved = isEdit
        ? await customerApi.update(storeId, customer._id, payload)
        : await customerApi.create(storeId, payload);

      message.success(isEdit ? "Customer updated." : "Customer created.");
      onSaved?.(saved);
    } catch (err) {
      message.error(err.message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 };

  return (
    <Modal
      title={
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <Users size={22} color="var(--accent-success)" /> {isEdit ? "Edit Customer" : "New Customer"}
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={560}
      className="glassmorphism-modal"
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ borderRadius: 8, fontWeight: 600, borderColor: "var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={handleSave}
          style={{ backgroundColor: "var(--accent-success)", borderColor: "var(--accent-success)", borderRadius: 8, fontWeight: 700 }}
        >
          {isEdit ? "Save changes" : "Create customer"}
        </Button>,
      ]}
    >
      <div style={{ paddingTop: 8 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <div style={labelStyle}>First name</div>
            <Input
              size="large"
              placeholder="e.g. Jordan"
              value={form.firstName}
              onChange={(e) => set("firstName")(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col span={12}>
            <div style={labelStyle}>Last name</div>
            <Input
              size="large"
              placeholder="e.g. Rivera"
              value={form.lastName}
              onChange={(e) => set("lastName")(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <div style={labelStyle}>Email</div>
            <Input
              size="large"
              type="email"
              placeholder="jordan@email.com"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col span={12}>
            <div style={labelStyle}>Phone</div>
            <Input
              size="large"
              placeholder="Optional"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
        </Row>

        <div>
          <div style={labelStyle}>Tags</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input
              size="large"
              placeholder="Add a tag…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onPressEnter={addTag}
              style={{ borderRadius: 8 }}
            />
            <Button size="large" onClick={addTag} style={{ borderRadius: 8 }}>Add</Button>
          </div>
          {form.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {form.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {t}
                  <X size={12} style={{ cursor: "pointer" }} onClick={() => removeTag(t)} />
                </span>
              ))}
            </div>
          )}
        </div>

        {isEdit && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-color)", display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>ORDERS</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{customer.ordersCount ?? 0}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>LIFETIME SPENT</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{customer.totalSpent ?? 0}</div>
            </div>
          </div>
        )}
        {isEdit && (
          <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
            Orders and lifetime spend update automatically from checkout activity.
          </Typography.Text>
        )}
      </div>
    </Modal>
  );
};

export default CustomerFormModal;
