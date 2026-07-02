import React, { useEffect, useState } from "react";
import { Modal, Input, Button, InputNumber, message, Typography } from "antd";
import { Truck, X, Plus } from "lucide-react";
import { shippingApi } from "../../../api/storeApi";

const { Text } = Typography;

const emptyRate = () => ({ name: "", price: 0, minOrderValue: null, maxOrderValue: null, deliveryTime: "" });
const emptyForm = { name: "", countries: [], rates: [emptyRate()] };

// Create / Edit modal for a Shipping Zone (StoresTab > Shipping tab).
// A zone groups countries under one or more Shipping Charges, each with
// its own price and Delivery Time estimate.
const ShippingZoneModal = ({ open, onCancel, onSaved, storeId, zone }) => {
  const isEdit = !!zone?._id;
  const [form, setForm] = useState(emptyForm);
  const [countryInput, setCountryInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        zone
          ? {
              name: zone.name || "",
              countries: zone.countries || [],
              rates: zone.rates?.length ? zone.rates.map((r) => ({ ...r })) : [emptyRate()],
            }
          : emptyForm
      );
      setCountryInput("");
    }
  }, [open, zone]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const addCountry = () => {
    const c = countryInput.trim();
    if (c && !form.countries.includes(c)) {
      setForm((f) => ({ ...f, countries: [...f.countries, c] }));
    }
    setCountryInput("");
  };

  const removeCountry = (c) => setForm((f) => ({ ...f, countries: f.countries.filter((x) => x !== c) }));

  const setRate = (idx, field) => (value) =>
    setForm((f) => ({
      ...f,
      rates: f.rates.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    }));

  const addRate = () => setForm((f) => ({ ...f, rates: [...f.rates, emptyRate()] }));
  const removeRate = (idx) => setForm((f) => ({ ...f, rates: f.rates.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      message.error("Zone name is required.");
      return;
    }
    if (!storeId) {
      message.error("This store isn't linked to a backend record yet, so shipping zones can't be saved.");
      return;
    }

    const rates = form.rates
      .filter((r) => r.name.trim())
      .map((r) => ({
        name: r.name.trim(),
        price: Number(r.price) || 0,
        minOrderValue: r.minOrderValue === "" || r.minOrderValue == null ? null : Number(r.minOrderValue),
        maxOrderValue: r.maxOrderValue === "" || r.maxOrderValue == null ? null : Number(r.maxOrderValue),
        deliveryTime: (r.deliveryTime || "").trim(),
      }));

    setSaving(true);
    try {
      const payload = { name: form.name.trim(), countries: form.countries, rates };
      const saved = isEdit
        ? await shippingApi.updateZone(storeId, zone._id, payload)
        : await shippingApi.createZone(storeId, payload);

      message.success(isEdit ? "Shipping zone updated." : "Shipping zone created.");
      onSaved?.(saved);
    } catch (err) {
      message.error(err.message || "Failed to save shipping zone.");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 };

  return (
    <Modal
      title={
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <Truck size={22} color="var(--accent-success)" /> {isEdit ? "Edit Shipping Zone" : "New Shipping Zone"}
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={640}
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
          {isEdit ? "Save changes" : "Create zone"}
        </Button>,
      ]}
    >
      <div style={{ paddingTop: 8 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Zone name</div>
          <Input
            size="large"
            placeholder="e.g. United States, Europe, Rest of world"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Countries</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <Input
              size="large"
              placeholder="Add a country…"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              onPressEnter={addCountry}
              style={{ borderRadius: 8 }}
            />
            <Button size="large" onClick={addCountry} style={{ borderRadius: 8 }}>Add</Button>
          </div>
          {form.countries.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {form.countries.map((c) => (
                <span
                  key={c}
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
                  {c}
                  <X size={12} style={{ cursor: "pointer" }} onClick={() => removeCountry(c)} />
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ ...labelStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Shipping charges &amp; delivery time</span>
            <Button size="small" icon={<Plus size={12} />} onClick={addRate} style={{ borderRadius: 6, fontWeight: 600 }}>
              Add rate
            </Button>
          </div>

          {form.rates.map((rate, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                background: "var(--bg-primary)",
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <Input
                  placeholder="Rate name, e.g. Standard"
                  value={rate.name}
                  onChange={(e) => setRate(idx, "name")(e.target.value)}
                  style={{ borderRadius: 8 }}
                />
                {form.rates.length > 1 && (
                  <Button danger icon={<X size={14} />} onClick={() => removeRate(idx)} style={{ borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", border: "none", flexShrink: 0 }} />
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>SHIPPING CHARGE</Text>
                  <InputNumber min={0} value={rate.price} onChange={setRate(idx, "price")} style={{ width: "100%", borderRadius: 8, marginTop: 4 }} />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>MIN. ORDER</Text>
                  <InputNumber min={0} value={rate.minOrderValue} onChange={setRate(idx, "minOrderValue")} style={{ width: "100%", borderRadius: 8, marginTop: 4 }} placeholder="No min" />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>MAX. ORDER</Text>
                  <InputNumber min={0} value={rate.maxOrderValue} onChange={setRate(idx, "maxOrderValue")} style={{ width: "100%", borderRadius: 8, marginTop: 4 }} placeholder="No max" />
                </div>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>DELIVERY TIME</Text>
                <Input
                  placeholder="e.g. 3-5 business days"
                  value={rate.deliveryTime}
                  onChange={(e) => setRate(idx, "deliveryTime")(e.target.value)}
                  style={{ borderRadius: 8, marginTop: 4 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ShippingZoneModal;
