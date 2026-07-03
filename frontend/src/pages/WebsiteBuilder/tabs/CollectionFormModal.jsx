import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Typography, Switch, Upload, message, Select, Spin } from "antd";
import { LayoutGrid, Plus, X } from "lucide-react";
import { collectionApi, productApi } from "../../../api/storeApi";
import { optimizeStoreImageUrl } from "../utils/storeImageCdn";

const { TextArea } = Input;

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  isActive: true,
  productIds: [],
};

// Create / Edit modal for the Collections Module (StoresTab > Collections
// tab). Covers title/description/image/active-state, plus a Products link
// so a collection can be attached to any number of StoreProduct documents.
const CollectionFormModal = ({ open, onCancel, onSaved, storeId, collection }) => {
  const isEdit = !!collection?._id;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        collection
          ? {
              title: collection.title || "",
              description: collection.description || "",
              imageUrl: collection.imageUrl || "",
              isActive: collection.isActive ?? true,
              productIds: (collection.productIds || []).map((p) => (typeof p === "string" ? p : p._id)),
            }
          : emptyForm
      );
    }
  }, [open, collection]);

  // Load this store's products so the "Products" link picker has options.
  useEffect(() => {
    if (!open || !storeId) return;
    setProductsLoading(true);
    productApi
      .list(storeId)
      .then((data) => setAvailableProducts(data || []))
      .catch((err) => message.error(err.message || "Failed to load products."))
      .finally(() => setProductsLoading(false));
  }, [open, storeId]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleImageUpload = async ({ file }) => {
    setUploading(true);
    try {
      const uploaded = await productApi.uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: uploaded.src }));
    } catch (err) {
      message.error(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      message.error("Collection title is required.");
      return;
    }
    if (!storeId) {
      message.error("This store isn't linked to a backend record yet, so collections can't be saved.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        imageUrl: form.imageUrl,
        isActive: form.isActive,
        productIds: form.productIds,
      };

      const saved = isEdit
        ? await collectionApi.update(storeId, collection._id, payload)
        : await collectionApi.create(storeId, payload);

      message.success(isEdit ? "Collection updated." : "Collection created.");
      onSaved?.(saved);
    } catch (err) {
      message.error(err.message || "Failed to save collection.");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 };

  return (
    <Modal
      title={
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <LayoutGrid size={22} color="var(--accent-success)" /> {isEdit ? "Edit Collection" : "New Collection"}
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={600}
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
          {isEdit ? "Save changes" : "Create collection"}
        </Button>,
      ]}
    >
      <div style={{ paddingTop: 8 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Title</div>
          <Input
            size="large"
            placeholder="e.g. Interior"
            value={form.title}
            onChange={(e) => set("title")(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Description</div>
          <TextArea
            rows={3}
            placeholder="Describe this collection…"
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            style={{ borderRadius: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Cover image</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {form.imageUrl ? (
              <div style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-color)", position: "relative" }}>
                <img
                  src={optimizeStoreImageUrl(form.imageUrl, "thumbnail")}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  onClick={() => set("imageUrl")("")}
                  style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X size={11} color="#fff" />
                </div>
              </div>
            ) : (
              <Upload showUploadList={false} customRequest={handleImageUpload} accept="image/*">
                <div
                  style={{
                    width: 72,
                    height: 72,
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
                  <Plus size={18} />
                  <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{uploading ? "Uploading…" : "Add"}</span>
                </div>
              </Upload>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>Products</div>
          <Select
            mode="multiple"
            size="large"
            allowClear
            placeholder="Link products to this collection"
            value={form.productIds}
            onChange={set("productIds")}
            style={{ width: "100%" }}
            notFoundContent={productsLoading ? <Spin size="small" /> : "No products yet"}
            optionFilterProp="label"
            options={availableProducts.map((p) => ({ value: p._id, label: p.title }))}
          />
          <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
            Products shown here come from this store's Products tab.
          </Typography.Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Switch checked={form.isActive} onChange={set("isActive")} />
          <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>Active</span>
        </div>
      </div>
    </Modal>
  );
};

export default CollectionFormModal;