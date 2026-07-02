import React, { useEffect, useState } from "react";
import { Modal, Input, Button, InputNumber, Select, DatePicker, Switch, Row, Col, message } from "antd";
import { Tag as TagIcon } from "lucide-react";
import dayjs from "dayjs";
import { discountApi, DISCOUNT_TYPES } from "../../../api/storeApi";

const { Option } = Select;

const emptyForm = {
  code: "",
  type: "Percentage",
  value: 0,
  minOrderAmount: 0,
  endsAt: null,
  isActive: true,
};

// Create / Edit modal for the Discounts Module (StoresTab > Discounts tab).
// Fields: Coupon code, Percentage/Flat/Free Shipping type + value,
// Expiry date, Minimum Order amount.
const DiscountFormModal = ({ open, onCancel, onSaved, storeId, discount }) => {
  const isEdit = !!discount?._id;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        discount
          ? {
              code: discount.code || "",
              type: discount.type || "Percentage",
              value: discount.value ?? 0,
              minOrderAmount: discount.minOrderAmount ?? 0,
              endsAt: discount.endsAt ? dayjs(discount.endsAt) : null,
              isActive: discount.isActive !== false,
            }
          : emptyForm
      );
    }
  }, [open, discount]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.code.trim()) {
      message.error("Coupon code is required.");
      return;
    }
    if (form.type === "Percentage" && form.value > 100) {
      message.error("Percentage value cannot exceed 100.");
      return;
    }
    if (!storeId) {
      message.error("This store isn't linked to a backend record yet, so discounts can't be saved.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        endsAt: form.endsAt ? form.endsAt.toISOString() : null,
        isActive: form.isActive,
      };

      const saved = isEdit
        ? await discountApi.update(storeId, discount._id, payload)
        : await discountApi.create(storeId, payload);

      message.success(isEdit ? "Discount updated." : "Discount created.");
      onSaved?.(saved);
    } catch (err) {
      message.error(err.message || "Failed to save discount.");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 };

  return (
    <Modal
      title={
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <TagIcon size={22} color="var(--accent-success)" /> {isEdit ? "Edit Discount" : "New Discount"}
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
          {isEdit ? "Save changes" : "Create discount"}
        </Button>,
      ]}
    >
      <div style={{ paddingTop: 8 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Coupon code</div>
          <Input
            size="large"
            placeholder="e.g. WELCOME10"
            value={form.code}
            onChange={(e) => set("code")(e.target.value.toUpperCase())}
            style={{ borderRadius: 8, textTransform: "uppercase" }}
          />
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <div style={labelStyle}>Type</div>
            <Select size="large" value={form.type} onChange={set("type")} style={{ width: "100%" }}>
              {DISCOUNT_TYPES.map((t) => (
                <Option key={t} value={t}>{t === "Flat" ? "Flat amount" : t === "Percentage" ? "Percentage" : "Free shipping"}</Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <div style={labelStyle}>{form.type === "Percentage" ? "Percentage (%)" : "Value"}</div>
            <InputNumber
              size="large"
              min={0}
              max={form.type === "Percentage" ? 100 : undefined}
              disabled={form.type === "FreeShipping"}
              value={form.type === "FreeShipping" ? 0 : form.value}
              onChange={set("value")}
              style={{ width: "100%", borderRadius: 8 }}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <div style={labelStyle}>Expiry date</div>
            <DatePicker
              size="large"
              value={form.endsAt}
              onChange={set("endsAt")}
              style={{ width: "100%", borderRadius: 8 }}
              placeholder="No expiry"
            />
          </Col>
          <Col span={12}>
            <div style={labelStyle}>Minimum order</div>
            <InputNumber
              size="large"
              min={0}
              value={form.minOrderAmount}
              onChange={set("minOrderAmount")}
              style={{ width: "100%", borderRadius: 8 }}
              placeholder="0"
            />
          </Col>
        </Row>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Switch checked={form.isActive} onChange={set("isActive")} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Active</span>
        </div>
      </div>
    </Modal>
  );
};

export default DiscountFormModal;
