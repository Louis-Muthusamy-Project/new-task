import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Button, Typography, Row, Col, Switch, Upload, message, Tabs } from "antd";
import { Package, Plus, X } from "lucide-react";
import { productApi } from "../../../api/storeApi";
import { optimizeStoreImageUrl } from "../utils/storeImageCdn";

const { Option } = Select;
const { TextArea } = Input;

const emptyForm = {
  title: "",
  description: "",
  images: [],
  price: "",
  compareAtPrice: "",
  currency: "INR",
  sku: "",
  inventoryQuantity: "",
  trackInventory: true,
  tags: [],
  status: "Draft",
  metaTitle: "",
  metaDescription: "",
};

// Create / Edit modal for the Products Module (StoresTab > Products tab).
// Covers all required feature areas: core details, Images, Price,
// Inventory, and SEO — each as its own tab so the form stays manageable.
const ProductFormModal = ({ open, onCancel, onSaved, storeId, product }) => {
  const isEdit = !!product?._id;
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              title: product.title || "",
              description: product.description || "",
              images: product.images || [],
              price: product.price ?? "",
              compareAtPrice: product.compareAtPrice ?? "",
              currency: product.currency || "INR",
              sku: product.sku || "",
              inventoryQuantity: product.inventoryQuantity ?? "",
              trackInventory: product.trackInventory ?? true,
              tags: product.tags || [],
              status: product.status || "Draft",
              metaTitle: product.seo?.metaTitle || "",
              metaDescription: product.seo?.metaDescription || "",
            }
          : emptyForm
      );
      setTagInput("");
    }
  }, [open, product]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleImageUpload = async ({ file }) => {
    setUploading(true);
    try {
      const uploaded = await productApi.uploadImage(file);
      setForm((f) => ({ ...f, images: [...f.images, uploaded.src] }));
    } catch (err) {
      message.error(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (t) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      message.error("Product title is required.");
      return;
    }
    if (!storeId) {
      message.error("This store isn't linked to a backend record yet, so products can't be saved.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        images: form.images,
        price: form.price === "" ? 0 : Number(form.price),
        compareAtPrice: form.compareAtPrice === "" ? null : Number(form.compareAtPrice),
        currency: form.currency,
        sku: form.sku,
        inventoryQuantity: form.inventoryQuantity === "" ? 0 : Number(form.inventoryQuantity),
        trackInventory: form.trackInventory,
        tags: form.tags,
        status: form.status,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
      };

      const saved = isEdit
        ? await productApi.update(storeId, product._id, payload)
        : await productApi.create(storeId, payload);

      message.success(isEdit ? "Product updated." : "Product created.");
      onSaved?.(saved);
    } catch (err) {
      message.error(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 };

  const detailsTab = (
    <div style={{ paddingTop: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Title</div>
        <Input
          size="large"
          placeholder="e.g. Ceramic Coating Kit"
          value={form.title}
          onChange={(e) => set("title")(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Description</div>
        <TextArea
          rows={4}
          placeholder="Describe this product…"
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </div>
      <Row gutter={16}>
        <Col span={12}>
          <div style={labelStyle}>Status</div>
          <Select size="large" value={form.status} onChange={set("status")} style={{ width: "100%" }}>
            <Option value="Draft">Draft</Option>
            <Option value="Active">Active</Option>
            <Option value="Archived">Archived</Option>
          </Select>
        </Col>
        <Col span={12}>
          <div style={labelStyle}>Tags</div>
          <div style={{ display: "flex", gap: 8 }}>
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
        </Col>
      </Row>
      {form.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
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
  );

  const imagesTab = (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        {form.images.map((src, idx) => (
          <div
            key={idx}
            style={{
              width: 96,
              height: 96,
              borderRadius: 10,
              overflow: "hidden",
              position: "relative",
              border: "1px solid var(--border-color)",
            }}
          >
            <img
              src={optimizeStoreImageUrl(src, "thumbnail")}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              onClick={() => removeImage(idx)}
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                background: "rgba(0,0,0,0.6)",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={12} color="#fff" />
            </div>
          </div>
        ))}
        <Upload showUploadList={false} customRequest={handleImageUpload} accept="image/*">
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 10,
              border: "1px dashed var(--border-color)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-tertiary)",
            }}
          >
            <Plus size={20} />
            <span style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>
              {uploading ? "Uploading…" : "Add image"}
            </span>
          </div>
        </Upload>
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Upload product photos. The first image is used as the primary/cover image.
      </Typography.Text>
    </div>
  );

  const priceTab = (
    <div style={{ paddingTop: 8 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <div style={labelStyle}>Price</div>
          <Input
            size="large"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set("price")(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col span={8}>
          <div style={labelStyle}>Compare-at price</div>
          <Input
            size="large"
            type="number"
            min={0}
            placeholder="Optional"
            value={form.compareAtPrice}
            onChange={(e) => set("compareAtPrice")(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col span={8}>
          <div style={labelStyle}>Currency</div>
          <Select size="large" value={form.currency} onChange={set("currency")} style={{ width: "100%" }}>
            <Option value="INR">INR</Option>
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
          </Select>
        </Col>
      </Row>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Set a compare-at price higher than the price to show a strikethrough discount on the storefront.
      </Typography.Text>
    </div>
  );

  const inventoryTab = (
    <div style={{ paddingTop: 8 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <div style={labelStyle}>SKU</div>
          <Input
            size="large"
            placeholder="e.g. PMP-001"
            value={form.sku}
            onChange={(e) => set("sku")(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col span={12}>
          <div style={labelStyle}>Quantity in stock</div>
          <Input
            size="large"
            type="number"
            min={0}
            value={form.inventoryQuantity}
            onChange={(e) => set("inventoryQuantity")(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </Col>
      </Row>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Switch checked={form.trackInventory} onChange={set("trackInventory")} />
        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
          Track inventory for this product
        </span>
      </div>
    </div>
  );

  const seoTab = (
    <div style={{ paddingTop: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>Meta title</div>
        <Input
          size="large"
          placeholder="Defaults to product title if left blank"
          value={form.metaTitle}
          onChange={(e) => set("metaTitle")(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </div>
      <div>
        <div style={labelStyle}>Meta description</div>
        <TextArea
          rows={3}
          placeholder="Shown in search engine results…"
          value={form.metaDescription}
          onChange={(e) => set("metaDescription")(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </div>
    </div>
  );

  return (
    <Modal
      title={
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <Package size={22} color="var(--accent-success)" /> {isEdit ? "Edit Product" : "New Product"}
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={680}
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
          {isEdit ? "Save changes" : "Create product"}
        </Button>,
      ]}
    >
      <Tabs
        items={[
          { key: "details", label: "Details", children: detailsTab },
          { key: "images", label: "Images", children: imagesTab },
          { key: "price", label: "Price", children: priceTab },
          { key: "inventory", label: "Inventory", children: inventoryTab },
          { key: "seo", label: "SEO", children: seoTab },
        ]}
      />
    </Modal>
  );
};

export default ProductFormModal;