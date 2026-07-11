import React, { useState, useEffect } from "react";
import { 
  Button, Input, Radio, Table, Typography, Space, Modal, Card, 
  Select, Row, Col, Tag, message, Popconfirm, Form, Tooltip, Empty, Spin,
  Tabs, Switch, Upload, Divider
} from "antd";
import { 
  FolderPlus, Plus, Search, CheckCircle2, ChevronRight, BarChart3, 
  Edit3, Eye, Trash2, Smartphone, Monitor, ArrowLeft, ArrowRight,
  TrendingUp, Users, DollarSign, Globe, Settings, FileText, Share2, Copy,
  Star, ArrowUpDown, Filter as FilterIcon, Image as ImageIcon, Lock,
  Wrench, Languages, Code2, UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FunnelTemplateLibraryModal from "./FunnelTemplateLibraryModal";
import { funnelApi } from "../../../api/funnelApi";
import { storeApi, productApi } from "../../../api/storeApi";
import { useAuth } from "../../../contexts/AuthContext";
import FunnelStatusBadge from "./funnels/FunnelStatusBadge";
import FunnelTagsEditor from "./funnels/FunnelTagsEditor";
import FunnelQuickActions from "./funnels/FunnelQuickActions";
import FunnelBulkActionBar from "./funnels/FunnelBulkActionBar";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const formatCurrency = (n) =>
  `$${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (n) => (Number(n) || 0).toLocaleString();
const formatPercent = (n) => `${(Number(n) || 0).toFixed(1)}%`;

// ── CREATE FUNNEL MODAL ──────────────────────────────────────────────────────
const CreateFunnelModal = ({ open, onCancel, onCreate }) => {
  const [selectedType, setSelectedType] = useState("blank");
  const [funnelName, setFunnelName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    onCreate({ name: funnelName, type: selectedType, description });
    setFunnelName("");
    setDescription("");
    setSelectedType("blank");
  };

  const isFormValid = funnelName.trim().length > 0;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      title={<div style={{ fontSize: 20, fontWeight: 800, paddingBottom: 16, color: 'var(--text-primary)' }}>Create New Funnel</div>}
      className="glassmorphism-modal"
    >
      <div style={{ display: "flex", gap: 20, marginBottom: 24, marginTop: 16 }}>
        {/* From blank */}
        <div 
          onClick={() => setSelectedType("blank")}
          style={{ 
            flex: 1, 
            borderRadius: 12, 
            border: selectedType === "blank" ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)', 
            background: 'var(--bg-secondary)', 
            padding: 20, 
            cursor: 'pointer', 
            transition: 'all 0.2s' 
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>From blank</div>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: selectedType === 'blank' ? '5px solid var(--accent-secondary)' : '2px solid var(--border-color)' }}></div>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 12, minHeight: 40 }}>
            Create an empty conversion flow with a single default landing step.
          </div>
        </div>

        {/* From templates */}
        <div 
          onClick={() => setSelectedType("templates")}
          style={{ 
            flex: 1, 
            borderRadius: 12, 
            border: selectedType === "templates" ? '2px solid var(--accent-info)' : '1px solid var(--border-color)', 
            background: 'var(--bg-secondary)', 
            padding: 20, 
            cursor: 'pointer', 
            transition: 'all 0.2s' 
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>From templates</div>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: selectedType === 'templates' ? '5px solid var(--accent-info)' : '2px solid var(--border-color)' }}></div>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 12, minHeight: 40 }}>
            Jumpstart with a pre-configured multi-step funnel structure.
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Funnel name <span style={{ color: "var(--accent-danger)" }}>*</span></div>
        <Input 
          size="large"
          placeholder="e.g. Lead Generation Campaign" 
          value={funnelName}
          onChange={(e) => setFunnelName(e.target.value)}
          style={{ borderRadius: 8, fontSize: 15 }} 
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button onClick={onCancel} style={{ height: 40, borderRadius: 8 }}>Cancel</Button>
        <Button 
          type="primary" 
          onClick={handleCreate}
          disabled={!isFormValid}
          style={{ 
            background: selectedType === "templates" ? "var(--accent-info)" : "var(--accent-secondary)", 
            border: 'none',
            height: 40, 
            borderRadius: 8, 
            fontWeight: 600 
          }}
        >
          {selectedType === "templates" ? "Next" : "Create"}
        </Button>
      </div>
    </Modal>
  );
};

// ── STEP SETTINGS MODAL ──────────────────────────────────────────────────────
const StepSettingsModal = ({ open, step, funnelId, onCancel, onSave }) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("landing");
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  // Offer layer (Store Product → Funnel Offer → Checkout). Saved via its
  // own endpoint, independent of the step's own Save/OK button, since an
  // offer is a separate resource (FunnelOffer) — see funnelOfferService.
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerHeadline, setOfferHeadline] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerDisplayPrice, setOfferDisplayPrice] = useState("");
  const [offerCompareAtPrice, setOfferCompareAtPrice] = useState("");
  const [offerBadgeText, setOfferBadgeText] = useState("");
  const [offerCountdownEnabled, setOfferCountdownEnabled] = useState(false);
  const [offerCountdownEndsAt, setOfferCountdownEndsAt] = useState("");

  useEffect(() => {
    if (step) {
      setName(step.name || "");
      setSlug(step.slug || "");
      setType(step.type || "landing");
      setSelectedStoreId(step.settings?.storeId || "");
      setSelectedProductId(step.settings?.productId || "");
    }
  }, [step]);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      loadProducts(selectedStoreId);
    } else {
      setProducts([]);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    if (step?.type === "checkout" && step?._id && funnelId) {
      loadOffer();
    }
  }, [step?._id, funnelId]);

  const loadStores = async () => {
    try {
      const data = await storeApi.list();
      setStores(data || []);
    } catch (_) {}
  };

  const loadProducts = async (storeId) => {
    try {
      const data = await productApi.list(storeId);
      setProducts(data || []);
    } catch (_) {}
  };

  const loadOffer = async () => {
    setOfferLoading(true);
    try {
      const { offer } = await funnelApi.getOffer(funnelId, step._id);
      if (offer) {
        setOfferHeadline(offer.headline || "");
        setOfferDescription(offer.description || "");
        setOfferDisplayPrice(offer.displayPrice ?? "");
        setOfferCompareAtPrice(offer.compareAtPrice ?? "");
        setOfferBadgeText(offer.badgeText || "");
        setOfferCountdownEnabled(!!offer.countdown?.enabled);
        setOfferCountdownEndsAt(offer.countdown?.endsAt ? offer.countdown.endsAt.slice(0, 16) : "");
      }
    } catch (_) {
      // No offer yet is expected for most steps — stay on defaults.
    } finally {
      setOfferLoading(false);
    }
  };

  const handleSaveOffer = async () => {
    if (!selectedStoreId || !selectedProductId) {
      return message.warning("Select a store and product before saving an offer.");
    }
    setOfferSaving(true);
    try {
      await funnelApi.saveOffer(funnelId, step._id, {
        storeId: selectedStoreId,
        productId: selectedProductId,
        headline: offerHeadline,
        description: offerDescription,
        displayPrice: offerDisplayPrice === "" ? null : Number(offerDisplayPrice),
        compareAtPrice: offerCompareAtPrice === "" ? null : Number(offerCompareAtPrice),
        badgeText: offerBadgeText,
        countdown: { enabled: offerCountdownEnabled, endsAt: offerCountdownEndsAt || null },
      });
      message.success("Offer saved.");
    } catch (err) {
      message.error(err.message || "Failed to save offer.");
    } finally {
      setOfferSaving(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);
  const isOutOfStock = selectedProduct && selectedProduct.trackInventory && (selectedProduct.inventoryQuantity || 0) <= 0;

  const handleSave = () => {
    onSave({
      name,
      slug,
      type,
      settings: {
        storeId: selectedStoreId || null,
        productId: selectedProductId || null,
      }
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      title="Step Settings"
      destroyOnClose
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Step Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Path slug</label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Step Type</label>
          <Select value={type} onChange={setType} style={{ width: "100%" }}>
            <Option value="landing">Landing</Option>
            <Option value="sales">Sales</Option>
            <Option value="checkout">Checkout</Option>
            <Option value="upsell">Upsell</Option>
            <Option value="downsell">Downsell</Option>
            <Option value="thankyou">Thank You</Option>
            <Option value="optin">Opt-in</Option>
            <Option value="webinar">Webinar</Option>
            <Option value="appointment">Appointment</Option>
          </Select>
        </div>

        {type === "checkout" && (
          <div style={{ padding: 12, background: "var(--bg-secondary)", borderRadius: 8, display: "flex", flexDirection: "column", gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>CHECKOUT STORE INTEGRATION</Text>
            <div>
              <label style={{ fontWeight: 500, display: "block", marginBottom: 4, fontSize: 13 }}>Select Store</label>
              <Select 
                value={selectedStoreId || undefined} 
                onChange={(v) => { setSelectedStoreId(v); setSelectedProductId(""); }}
                style={{ width: "100%" }}
                placeholder="Choose Store"
              >
                {stores.map(s => <Option key={s._id} value={s._id}>{s.storeName}</Option>)}
              </Select>
            </div>
            {selectedStoreId && (
              <div>
                <label style={{ fontWeight: 500, display: "block", marginBottom: 4, fontSize: 13 }}>Select Product</label>
                <Select 
                  value={selectedProductId || undefined} 
                  onChange={setSelectedProductId}
                  style={{ width: "100%" }}
                  placeholder="Choose Product"
                >
                  {products.map(p => <Option key={p._id} value={p._id}>{p.title} (${p.price})</Option>)}
                </Select>
                {selectedProduct && (
                  <Tag color={isOutOfStock ? "red" : "green"} style={{ marginTop: 8 }}>
                    {isOutOfStock ? "Out of stock" : selectedProduct.trackInventory ? `${selectedProduct.inventoryQuantity} in stock` : "Not tracked"}
                  </Tag>
                )}
              </div>
            )}

            {selectedStoreId && selectedProductId && (
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 12, marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                  FUNNEL OFFER <span style={{ fontWeight: 400 }}>(optional — overrides display only, never the product itself)</span>
                </Text>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  <Input
                    placeholder="Headline (defaults to product title)"
                    value={offerHeadline}
                    onChange={(e) => setOfferHeadline(e.target.value)}
                    disabled={offerLoading}
                  />
                  <TextArea
                    placeholder="Offer description (defaults to product description)"
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    rows={2}
                    disabled={offerLoading}
                  />
                  <Row gutter={8}>
                    <Col span={12}>
                      <Input
                        type="number"
                        placeholder="Display price"
                        value={offerDisplayPrice}
                        onChange={(e) => setOfferDisplayPrice(e.target.value)}
                        disabled={offerLoading}
                      />
                    </Col>
                    <Col span={12}>
                      <Input
                        type="number"
                        placeholder="Compare-at price"
                        value={offerCompareAtPrice}
                        onChange={(e) => setOfferCompareAtPrice(e.target.value)}
                        disabled={offerLoading}
                      />
                    </Col>
                  </Row>
                  <Input
                    placeholder="Badge text (e.g. Limited Time)"
                    value={offerBadgeText}
                    onChange={(e) => setOfferBadgeText(e.target.value)}
                    disabled={offerLoading}
                  />
                  <Row gutter={8} align="middle">
                    <Col span={12}>
                      <Select
                        value={offerCountdownEnabled}
                        onChange={setOfferCountdownEnabled}
                        style={{ width: "100%" }}
                        disabled={offerLoading}
                      >
                        <Option value={false}>Countdown off</Option>
                        <Option value={true}>Countdown on</Option>
                      </Select>
                    </Col>
                    <Col span={12}>
                      <Input
                        type="datetime-local"
                        value={offerCountdownEndsAt}
                        onChange={(e) => setOfferCountdownEndsAt(e.target.value)}
                        disabled={offerLoading || !offerCountdownEnabled}
                      />
                    </Col>
                  </Row>
                  <Button onClick={handleSaveOffer} loading={offerSaving} disabled={offerLoading}>
                    Save Offer
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ── IMAGE FIELD (url input + upload, reused across General/SEO settings) ────
const ImageField = ({ label, value, onChange, hint, previewShape = "square" }) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    setUploading(true);
    try {
      const data = await funnelApi.uploadImage(file);
      onChange(data.src);
      message.success(`${label} uploaded.`);
    } catch (err) {
      message.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
    return false; // prevent antd Upload's own auto-submit
  };

  return (
    <div>
      <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: previewShape === "round" ? "50%" : 8,
            border: "1px dashed var(--border-color)",
            background: "var(--bg-secondary)",
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value ? (
            <img src={value} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <ImageIcon size={16} color="var(--text-tertiary)" />
          )}
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          style={{ flex: 1 }}
        />
        <Upload showUploadList={false} beforeUpload={handleFile} accept="image/*">
          <Button icon={<UploadCloud size={14} />} loading={uploading}>Upload</Button>
        </Upload>
      </div>
      {hint && <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
};


const ManageFunnelView = ({ activeFunnel, setView, itemVariants }) => {
  const [activeTab, setActiveTab] = useState("steps");
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStepName, setNewStepName] = useState("");
  const [newStepType, setNewStepType] = useState("landing");
  const [editingStep, setEditingStep] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactsMeta, setContactsMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);

  // ── Settings tab state ──────────────────────────────────────────────────
  // General
  const [funnelName, setFunnelName] = useState(activeFunnel.name || "");
  const [description, setDescription] = useState(activeFunnel.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(activeFunnel.thumbnailUrl || "");
  const [iconUrl, setIconUrl] = useState(activeFunnel.iconUrl || "");

  // Publishing
  const [customSlug, setCustomSlug] = useState(activeFunnel.slug || "");
  const [funnelDomain, setFunnelDomain] = useState(activeFunnel.settings?.domain || "");
  const [passwordEnabled, setPasswordEnabled] = useState(!!activeFunnel.publishing?.passwordProtection?.enabled);
  const [hasPassword, setHasPassword] = useState(!!activeFunnel.publishing?.passwordProtection?.hasPassword);
  const [newPassword, setNewPassword] = useState("");
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(!!activeFunnel.publishing?.maintenanceMode?.enabled);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    activeFunnel.publishing?.maintenanceMode?.message || "This funnel is temporarily down for maintenance. Please check back soon."
  );

  // SEO (Meta Pixel / GA4 / GTM stay part of this tab too, unchanged)
  const [seoTitle, setSeoTitle] = useState(activeFunnel.seo?.title || "");
  const [seoDescription, setSeoDescription] = useState(activeFunnel.seo?.description || "");
  const [seoKeywords, setSeoKeywords] = useState(activeFunnel.seo?.keywords || []);
  const [canonicalUrl, setCanonicalUrl] = useState(activeFunnel.seo?.canonicalUrl || "");
  const [ogEnabled, setOgEnabled] = useState(activeFunnel.seo?.ogEnabled !== false);
  const [twitterCard, setTwitterCard] = useState(activeFunnel.seo?.twitterCard || "summary_large_image");
  const [socialImage, setSocialImage] = useState(activeFunnel.seo?.ogImageUrl || "");
  const [faviconUrl, setFaviconUrl] = useState(activeFunnel.settings?.faviconUrl || "");
  const [metaPixel, setMetaPixel] = useState(activeFunnel.settings?.tracking?.metaPixelId || "");
  const [ga4Id, setGa4Id] = useState(activeFunnel.settings?.tracking?.ga4Id || "");
  const [gtmId, setGtmId] = useState(activeFunnel.settings?.tracking?.gtmId || "");

  // Localization
  const [language, setLanguage] = useState(activeFunnel.localization?.language || "en");
  const [timezone, setTimezone] = useState(activeFunnel.localization?.timezone || "UTC");
  const [currency, setCurrency] = useState(activeFunnel.localization?.currency || "USD");

  // Advanced
  const [headerScripts, setHeaderScripts] = useState(activeFunnel.advanced?.headerScripts || "");
  const [footerScripts, setFooterScripts] = useState(activeFunnel.advanced?.footerScripts || "");
  const [customCss, setCustomCss] = useState(activeFunnel.advanced?.customCss || "");
  const [customJs, setCustomJs] = useState(activeFunnel.advanced?.customJs || "");

  const [savingSection, setSavingSection] = useState("");

  useEffect(() => {
    loadSteps();
    loadAnalytics();
  }, [activeFunnel._id]);

  useEffect(() => {
    loadAnalytics();
  }, [analyticsDays]);

  useEffect(() => {
    if (activeTab === "contacts") {
      loadContacts(1);
    }
  }, [activeTab]);

  const loadSteps = async () => {
    setLoading(true);
    try {
      const data = await funnelApi.listSteps(activeFunnel._id);
      setSteps(data || []);
    } catch (_) {
      message.error("Failed to load funnel steps.");
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async (page = 1) => {
    try {
      const res = await funnelApi.listContacts(activeFunnel._id, { page, limit: 10 });
      setContacts(res.data || []);
      setContactsMeta(res.meta || { page, limit: 10, total: 0 });
    } catch (_) {}
  };

  const loadAnalytics = async () => {
    try {
      const res = await funnelApi.getAnalytics(activeFunnel._id, { days: analyticsDays });
      setAnalytics(res);
    } catch (_) {}
  };

  const handleAddStep = async () => {
    if (!newStepName.trim()) return message.warning("Please enter a step name.");
    try {
      await funnelApi.createStep(activeFunnel._id, {
        name: newStepName,
        type: newStepType,
      });
      setNewStepName("");
      message.success("Step added.");
      loadSteps();
    } catch (err) {
      message.error(err.message || "Failed to create step.");
    }
  };

  const handleDeleteStep = async (stepId) => {
    try {
      await funnelApi.deleteStep(stepId);
      message.success("Step deleted.");
      loadSteps();
    } catch (_) {}
  };

  const handleSaveStepSettings = async (payload) => {
    try {
      await funnelApi.updateStep(editingStep._id, payload);
      message.success("Step updated.");
      setEditingStep(null);
      loadSteps();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleReorderStep = async (index, direction) => {
    const newSteps = [...steps];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    // Swap positions
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    setSteps(newSteps);
    try {
      await funnelApi.reorderSteps(activeFunnel._id, newSteps.map(s => s._id));
      message.success("Order updated.");
    } catch (_) {
      loadSteps();
    }
  };

  const handlePublish = async () => {
    try {
      const res = await funnelApi.publish(activeFunnel._id);
      message.success("Funnel published live!");
      activeFunnel.status = "Published";
      loadSteps();
    } catch (err) {
      message.error(err.message);
    }
  };

  // Applies a successful update response to the local activeFunnel object
  // and mirrors it into React state so the header (name/slug/status) and
  // other tabs stay in sync without a full reload.
  const applyFunnelUpdate = (updated) => {
    Object.assign(activeFunnel, updated);
    if (updated.publishing?.passwordProtection) {
      setHasPassword(!!updated.publishing.passwordProtection.hasPassword);
    }
    setNewPassword("");
  };

  const handleSaveGeneral = async () => {
    if (!funnelName.trim()) return message.warning("Funnel name is required.");
    setSavingSection("general");
    try {
      const updated = await funnelApi.update(activeFunnel._id, {
        name: funnelName,
        description,
        thumbnailUrl,
        iconUrl,
      });
      applyFunnelUpdate(updated);
      setCustomSlug(updated.slug || customSlug);
      message.success("General settings saved.");
    } catch (err) {
      message.error(err.message || "Failed to save general settings.");
    } finally {
      setSavingSection("");
    }
  };

  const handleSavePublishing = async () => {
    setSavingSection("publishing");
    try {
      const publishing = {
        passwordProtection: { enabled: passwordEnabled },
        maintenanceMode: { enabled: maintenanceEnabled, message: maintenanceMessage },
      };
      if (newPassword) {
        publishing.passwordProtection.password = newPassword;
      }
      const updated = await funnelApi.update(activeFunnel._id, {
        slug: customSlug,
        settings: { domain: funnelDomain },
        publishing,
      });
      applyFunnelUpdate(updated);
      message.success("Publishing settings saved.");
    } catch (err) {
      message.error(err.message || "Failed to save publishing settings.");
    } finally {
      setSavingSection("");
    }
  };

  const handleSaveSeo = async () => {
    setSavingSection("seo");
    try {
      const updated = await funnelApi.update(activeFunnel._id, {
        settings: { faviconUrl, tracking: { metaPixelId: metaPixel, ga4Id, gtmId } },
        seo: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
          canonicalUrl,
          ogEnabled,
          twitterCard,
          ogImageUrl: socialImage,
        },
      });
      applyFunnelUpdate(updated);
      message.success("SEO settings saved.");
    } catch (err) {
      message.error(err.message || "Failed to save SEO settings.");
    } finally {
      setSavingSection("");
    }
  };

  const handleSaveLocalization = async () => {
    setSavingSection("localization");
    try {
      const updated = await funnelApi.update(activeFunnel._id, {
        localization: { language, timezone, currency },
      });
      applyFunnelUpdate(updated);
      message.success("Localization settings saved.");
    } catch (err) {
      message.error(err.message || "Failed to save localization settings.");
    } finally {
      setSavingSection("");
    }
  };

  const handleSaveAdvanced = async () => {
    setSavingSection("advanced");
    try {
      const updated = await funnelApi.update(activeFunnel._id, {
        advanced: { headerScripts, footerScripts, customCss, customJs },
      });
      applyFunnelUpdate(updated);
      message.success("Advanced settings saved.");
    } catch (err) {
      message.error(err.message || "Failed to save advanced settings.");
    } finally {
      setSavingSection("");
    }
  };

  const handleDeleteFunnel = async () => {
    try {
      await funnelApi.delete(activeFunnel._id);
      message.success("Funnel deleted.");
      setView("list");
    } catch (_) {}
  };

  return (
    <motion.div variants={itemVariants} className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <Title level={3} style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontWeight: 800 }}>{activeFunnel.name}</Title>
          <Space>
            <Text type="secondary">/{activeFunnel.slug}</Text>
            <Tag color={activeFunnel.status === "Published" ? "green" : "orange"} style={{ borderRadius: 12, fontWeight: 700 }}>
              {activeFunnel.status.toUpperCase()}
            </Tag>
          </Space>
        </div>
        <Button style={{ borderRadius: 8 }} onClick={() => setView("list")}>Back to Funnels</Button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, background: "var(--bg-secondary)", padding: "12px 32px", borderBottom: '1px solid var(--border-color)' }}>
        {[
          { id: "steps", label: "Steps & Flow", icon: <Smartphone size={16} /> },
          { id: "contacts", label: "Contacts & Leads", icon: <Users size={16} /> },
          { id: "analytics", label: "Analytics Summary", icon: <BarChart3 size={16} /> },
          { id: "publish", label: "Deployment", icon: <Globe size={16} /> },
          { id: "settings", label: "Settings", icon: <Settings size={16} /> },
        ].map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: "8px 16px", 
              cursor: "pointer", 
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent-primary)" : "2px solid transparent"
            }}
          >
            <Space size={6}>{tab.icon} {tab.label}</Space>
          </div>
        ))}
      </div>

      <div style={{ padding: 32 }}>
        {/* STEPS TAB */}
        {activeTab === "steps" && (
          <Row gutter={24}>
            <Col span={16}>
              <Card title="Funnel Steps Structure" style={{ borderRadius: 12 }}>
                {loading ? (
                  <div style={{ padding: 40, textAlign: "center" }}><Spin /></div>
                ) : steps.length === 0 ? (
                  <Empty description="No steps found. Add your first step." />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {steps.map((step, idx) => (
                      <div 
                        key={step._id}
                        style={{ 
                          padding: 16, 
                          borderRadius: 8, 
                          background: "var(--bg-primary)", 
                          border: "1px solid var(--border-color)", 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center" 
                        }}
                      >
                        <Space size={16}>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <Button 
                              type="text" 
                              icon={<ArrowRight style={{ transform: "rotate(-90deg)" }} size={14} />} 
                              onClick={() => handleReorderStep(idx, -1)} 
                              disabled={idx === 0} 
                            />
                            <Button 
                              type="text" 
                              icon={<ArrowRight style={{ transform: "rotate(90deg)" }} size={14} />} 
                              onClick={() => handleReorderStep(idx, 1)} 
                              disabled={idx === steps.length - 1} 
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{step.name}</div>
                            <Space size={8}>
                              <Tag color="cyan">{step.type.toUpperCase()}</Tag>
                              <Text type="secondary" style={{ fontSize: 12 }}>/{step.slug}</Text>
                            </Space>
                          </div>
                        </Space>

                        <Space>
                          <Button 
                            icon={<Edit3 size={14} />} 
                            onClick={() => window.open(`/funnels/${activeFunnel._id}/steps/${step._id}`, "_blank")}
                          >
                            Edit Page
                          </Button>
                          <Button icon={<Settings size={14} />} onClick={() => setEditingStep(step)} />
                          <Popconfirm title="Delete step?" onConfirm={() => handleDeleteStep(step._id)}>
                            <Button danger icon={<Trash2 size={14} />} />
                          </Popconfirm>
                        </Space>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Add Funnel Step" style={{ borderRadius: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Step Name</label>
                    <Input value={newStepName} onChange={(e) => setNewStepName(e.target.value)} placeholder="e.g. Sales checkout" />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Step Type</label>
                    <Select value={newStepType} onChange={setNewStepType} style={{ width: "100%" }}>
                      <Option value="landing">Landing</Option>
                      <Option value="sales">Sales</Option>
                      <Option value="checkout">Checkout</Option>
                      <Option value="upsell">Upsell</Option>
                      <Option value="downsell">Downsell</Option>
                      <Option value="thankyou">Thank You</Option>
                      <Option value="optin">Opt-in</Option>
                    </Select>
                  </div>
                  <Button type="primary" onClick={handleAddStep} style={{ background: "var(--accent-secondary)", border: "none" }}>Add Step</Button>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* CONTACTS TAB */}
        {activeTab === "contacts" && (
          <Card title="Captured Leads & Contacts" style={{ borderRadius: 12 }}>
            <Table 
              dataSource={contacts} 
              rowKey="_id"
              pagination={{
                current: contactsMeta.page,
                pageSize: contactsMeta.limit,
                total: contactsMeta.total,
                onChange: (page) => loadContacts(page)
              }}
              columns={[
                { title: "Name", dataIndex: "name", key: "name" },
                { title: "Email", dataIndex: "email", key: "email" },
                { title: "Phone", dataIndex: "phone", key: "phone" },
                { title: "Submitted Step", dataIndex: "stepId", key: "stepId", render: (s) => s?.name || "Direct" },
                { title: "Attribution (Source)", dataIndex: "utm", key: "utm", render: (utm) => utm?.source || "Direct" },
                { title: "Submitted At", dataIndex: "createdAt", key: "createdAt", render: (date) => new Date(date).toLocaleDateString() },
              ]}
            />
          </Card>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <Select value={analyticsDays} onChange={setAnalyticsDays} style={{ width: 140 }}>
                <Option value={7}>Last 7 days</Option>
                <Option value={30}>Last 30 days</Option>
                <Option value={90}>Last 90 days</Option>
                <Option value={365}>Last 12 months</Option>
              </Select>
            </div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              {[
                { label: "Total Views", val: analytics?.summary?.views || 0, icon: <Eye /> },
                { label: "Unique Visitors", val: analytics?.summary?.visitors || 0, icon: <Users /> },
                { label: "Conversions", val: analytics?.summary?.conversions || 0, icon: <CheckCircle2 /> },
                { label: "Conversion Rate", val: `${(analytics?.summary?.conversionRate || 0).toFixed(2)}%`, icon: <TrendingUp /> },
                // Revenue / Orders / AOV — sourced from StoreOrder only, see
                // funnelAnalyticsController.getFunnelAnalytics.
                { label: "Revenue", val: `$${(analytics?.summary?.revenue || 0).toFixed(2)}`, icon: <TrendingUp /> },
                { label: "Avg. Order Value", val: `$${(analytics?.summary?.averageOrderValue || 0).toFixed(2)}`, icon: <TrendingUp /> },
              ].map((kpi, i) => (
                <Col span={8} key={i} style={{ marginBottom: 16 }}>
                  <Card style={{ borderRadius: 8 }}>
                    <Space size={12}>
                      <div style={{ color: "var(--accent-primary)" }}>{kpi.icon}</div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{kpi.label}</Text>
                        <Title level={4} style={{ margin: 0 }}>{kpi.val}</Title>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row gutter={24}>
              <Col span={16}>
                <Card title="Funnel Conversion Stages" style={{ borderRadius: 12 }}>
                  <Table 
                    dataSource={analytics?.steps || []} 
                    rowKey="stepId"
                    pagination={false}
                    columns={[
                      { title: "Step", dataIndex: "name", key: "name" },
                      { title: "Type", dataIndex: "type", key: "type", render: (t) => <Tag color="blue">{t.toUpperCase()}</Tag> },
                      { title: "Views", dataIndex: "views", key: "views" },
                      { title: "Conversions", dataIndex: "conversions", key: "conversions" },
                      { title: "Conversion Rate", dataIndex: "conversionRate", key: "conversionRate", render: (v) => `${(v || 0).toFixed(2)}%` },
                      { title: "Orders", dataIndex: "orders", key: "orders" },
                      { title: "Revenue", dataIndex: "revenue", key: "revenue", render: (v) => `$${(v || 0).toFixed(2)}` },
                    ]}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Traffic Sources Breakdown" style={{ borderRadius: 12 }}>
                  <Table 
                    dataSource={analytics?.trafficSources || []} 
                    rowKey="source"
                    pagination={false}
                    columns={[
                      { title: "Traffic Source", dataIndex: "source", key: "source" },
                      { title: "Views", dataIndex: "views", key: "views" },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* PUBLISH TAB */}
        {activeTab === "publish" && (
          <Card title="Funnel Deployment settings" style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ padding: 20, background: "var(--bg-secondary)", borderRadius: 8 }}>
                <Title level={5} style={{ margin: 0 }}>Publish Status: {activeFunnel.status === "Published" ? "LIVE ✓" : "DRAFT"}</Title>
                <Text type="secondary">Deploy this funnel live to the platform domain or your connected custom domain.</Text>
              </div>

              <div>
                <Button type="primary" onClick={handlePublish} style={{ background: "var(--accent-secondary)", border: "none", height: 40, borderRadius: 8 }}>
                  Deploy Live now
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <Card
            title="Funnel Settings & Customizations"
            style={{ borderRadius: 12 }}
            extra={
              <Popconfirm title="Delete this funnel?" description="This cannot be undone." onConfirm={handleDeleteFunnel}>
                <Button danger icon={<Trash2 size={14} />}>Delete Funnel</Button>
              </Popconfirm>
            }
          >
            <Tabs
              tabPosition="left"
              items={[
                {
                  key: "general",
                  label: <Space size={6}><FileText size={14} /> General</Space>,
                  children: (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Funnel Name</label>
                        <Input value={funnelName} onChange={(e) => setFunnelName(e.target.value)} placeholder="e.g. Lead Generation Campaign" />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Description</label>
                        <Input.TextArea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          autoSize={{ minRows: 2, maxRows: 5 }}
                          placeholder="What is this funnel for?"
                        />
                      </div>
                      <ImageField label="Thumbnail" value={thumbnailUrl} onChange={setThumbnailUrl} hint="Shown on the funnels dashboard card." />
                      <ImageField label="Icon" value={iconUrl} onChange={setIconUrl} previewShape="round" hint="Small square icon used to identify this funnel." />

                      <div style={{ marginTop: 4 }}>
                        <Button
                          type="primary"
                          loading={savingSection === "general"}
                          onClick={handleSaveGeneral}
                          style={{ background: "var(--accent-primary)", border: "none" }}
                        >
                          Save General Settings
                        </Button>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "publishing",
                  label: <Space size={6}><Globe size={14} /> Publishing</Space>,
                  children: (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Custom Slug</label>
                        <Input
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value)}
                          placeholder="e.g. summer-sale"
                          addonBefore="/"
                        />
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                          Used in the funnel's public URL path. Must be unique.
                        </div>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Custom Domain</label>
                        <Input value={funnelDomain} onChange={(e) => setFunnelDomain(e.target.value)} placeholder="e.g. sales.mybrand.com" />
                      </div>

                      <Divider style={{ margin: "4px 0" }} />

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                            <Lock size={14} /> Password Protection
                          </label>
                          <Switch checked={passwordEnabled} onChange={setPasswordEnabled} />
                        </div>
                        {passwordEnabled && (
                          <Input.Password
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={hasPassword ? "Leave blank to keep the current password" : "Set a password"}
                          />
                        )}
                        {hasPassword && (
                          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                            A password is currently set. Enter a new one to change it.
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                            <Wrench size={14} /> Maintenance Mode
                          </label>
                          <Switch checked={maintenanceEnabled} onChange={setMaintenanceEnabled} />
                        </div>
                        {maintenanceEnabled && (
                          <Input.TextArea
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            placeholder="Message shown to visitors while the funnel is down."
                          />
                        )}
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <Button
                          type="primary"
                          loading={savingSection === "publishing"}
                          onClick={handleSavePublishing}
                          style={{ background: "var(--accent-primary)", border: "none" }}
                        >
                          Save Publishing Settings
                        </Button>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "seo",
                  label: <Space size={6}><Search size={14} /> SEO</Space>,
                  children: (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>SEO Title</label>
                        <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Title shown in search results" />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>SEO Description</label>
                        <Input.TextArea
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          autoSize={{ minRows: 2, maxRows: 4 }}
                          placeholder="Description shown in search results"
                        />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Keywords</label>
                        <Select
                          mode="tags"
                          value={seoKeywords}
                          onChange={setSeoKeywords}
                          style={{ width: "100%" }}
                          placeholder="Add keyword + Enter"
                          tokenSeparators={[","]}
                        />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Canonical URL</label>
                        <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://example.com/preferred-url" />
                      </div>

                      <Divider style={{ margin: "4px 0" }} />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{ fontWeight: 600 }}>Open Graph Tags</label>
                        <Switch checked={ogEnabled} onChange={setOgEnabled} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: -10 }}>
                        Uses the SEO Title, SEO Description, and Social Image above when sharing on social platforms.
                      </div>

                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Twitter Card Type</label>
                        <Select value={twitterCard} onChange={setTwitterCard} style={{ width: "100%" }}>
                          <Option value="summary">Summary</Option>
                          <Option value="summary_large_image">Summary with Large Image</Option>
                        </Select>
                      </div>

                      <ImageField label="Social Image" value={socialImage} onChange={setSocialImage} hint="Shown when this funnel is shared on social media (Open Graph / Twitter)." />
                      <ImageField label="Favicon" value={faviconUrl} onChange={setFaviconUrl} previewShape="round" hint="Small icon shown in the browser tab." />

                      <Divider style={{ margin: "4px 0" }} />

                      <Title level={5} style={{ margin: 0 }}>Tracking</Title>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Meta Pixel ID</label>
                        <Input value={metaPixel} onChange={(e) => setMetaPixel(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>GA4 Tracking ID</label>
                        <Input value={ga4Id} onChange={(e) => setGa4Id(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Google Tag Manager ID</label>
                        <Input value={gtmId} onChange={(e) => setGtmId(e.target.value)} />
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <Button
                          type="primary"
                          loading={savingSection === "seo"}
                          onClick={handleSaveSeo}
                          style={{ background: "var(--accent-primary)", border: "none" }}
                        >
                          Save SEO Settings
                        </Button>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "localization",
                  label: <Space size={6}><Languages size={14} /> Localization</Space>,
                  children: (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Language</label>
                        <Select value={language} onChange={setLanguage} style={{ width: "100%" }} showSearch>
                          <Option value="en">English</Option>
                          <Option value="es">Spanish</Option>
                          <Option value="fr">French</Option>
                          <Option value="de">German</Option>
                          <Option value="pt">Portuguese</Option>
                          <Option value="it">Italian</Option>
                          <Option value="nl">Dutch</Option>
                          <Option value="hi">Hindi</Option>
                          <Option value="ja">Japanese</Option>
                          <Option value="zh">Chinese</Option>
                        </Select>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Timezone</label>
                        <Select value={timezone} onChange={setTimezone} style={{ width: "100%" }} showSearch>
                          <Option value="UTC">UTC</Option>
                          <Option value="America/New_York">America/New_York</Option>
                          <Option value="America/Chicago">America/Chicago</Option>
                          <Option value="America/Los_Angeles">America/Los_Angeles</Option>
                          <Option value="Europe/London">Europe/London</Option>
                          <Option value="Europe/Berlin">Europe/Berlin</Option>
                          <Option value="Asia/Kolkata">Asia/Kolkata</Option>
                          <Option value="Asia/Dubai">Asia/Dubai</Option>
                          <Option value="Asia/Singapore">Asia/Singapore</Option>
                          <Option value="Australia/Sydney">Australia/Sydney</Option>
                        </Select>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Currency</label>
                        <Select value={currency} onChange={setCurrency} style={{ width: "100%" }} showSearch>
                          <Option value="USD">USD - US Dollar</Option>
                          <Option value="EUR">EUR - Euro</Option>
                          <Option value="GBP">GBP - British Pound</Option>
                          <Option value="INR">INR - Indian Rupee</Option>
                          <Option value="CAD">CAD - Canadian Dollar</Option>
                          <Option value="AUD">AUD - Australian Dollar</Option>
                          <Option value="JPY">JPY - Japanese Yen</Option>
                          <Option value="AED">AED - UAE Dirham</Option>
                        </Select>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <Button
                          type="primary"
                          loading={savingSection === "localization"}
                          onClick={handleSaveLocalization}
                          style={{ background: "var(--accent-primary)", border: "none" }}
                        >
                          Save Localization Settings
                        </Button>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "advanced",
                  label: <Space size={6}><Code2 size={14} /> Advanced</Space>,
                  children: (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Header Scripts</label>
                        <Input.TextArea
                          value={headerScripts}
                          onChange={(e) => setHeaderScripts(e.target.value)}
                          autoSize={{ minRows: 3, maxRows: 8 }}
                          placeholder="<script>…</script> — injected into <head>"
                          style={{ fontFamily: "monospace", fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Footer Scripts</label>
                        <Input.TextArea
                          value={footerScripts}
                          onChange={(e) => setFooterScripts(e.target.value)}
                          autoSize={{ minRows: 3, maxRows: 8 }}
                          placeholder="<script>…</script> — injected before </body>"
                          style={{ fontFamily: "monospace", fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Custom CSS</label>
                        <Input.TextArea
                          value={customCss}
                          onChange={(e) => setCustomCss(e.target.value)}
                          autoSize={{ minRows: 3, maxRows: 8 }}
                          placeholder=".my-class { color: red; }"
                          style={{ fontFamily: "monospace", fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Custom JavaScript</label>
                        <Input.TextArea
                          value={customJs}
                          onChange={(e) => setCustomJs(e.target.value)}
                          autoSize={{ minRows: 3, maxRows: 8 }}
                          placeholder="console.log('funnel loaded')"
                          style={{ fontFamily: "monospace", fontSize: 13 }}
                        />
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <Button
                          type="primary"
                          loading={savingSection === "advanced"}
                          onClick={handleSaveAdvanced}
                          style={{ background: "var(--accent-primary)", border: "none" }}
                        >
                          Save Advanced Settings
                        </Button>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        )}
      </div>

      <StepSettingsModal 
        open={!!editingStep} 
        step={editingStep} 
        funnelId={activeFunnel._id}
        onCancel={() => setEditingStep(null)} 
        onSave={handleSaveStepSettings} 
      />
    </motion.div>
  );
};

// ── MAIN FUNNELS TAB ─────────────────────────────────────────────────────────
const FunnelsTab = ({ itemVariants }) => {
  const { role } = useAuth();
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFunnel, setActiveFunnel] = useState(null);
  const [view, setView] = useState("list");
  
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | Draft | Published | Archived
  const [sortBy, setSortBy] = useState("updated"); // newest | oldest | updated | name
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState(undefined);
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [pendingFunnelName, setPendingFunnelName] = useState("");
  const [cloneTarget, setCloneTarget] = useState(null);
  const [cloneName, setCloneName] = useState("");

  useEffect(() => {
    loadFunnels();
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortBy, favoritesOnly, tagFilter]);

  const loadFunnels = async () => {
    setLoading(true);
    try {
      const data = await funnelApi.list({
        search: searchText || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        sort: sortBy,
        favorite: favoritesOnly || undefined,
        tag: tagFilter || undefined,
        includeStats: true,
      });
      setFunnels(data || []);
      setSelectedRowKeys([]);
    } catch (_) {
      message.error("Failed to load funnels list.");
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await funnelApi.listTags();
      setTagOptions(tags || []);
    } catch (_) {
      // Non-critical — the tag filter just stays empty.
    }
  };

  const handleCreateFunnel = async (data) => {
    if (data.type === "templates") {
      setPendingFunnelName(data.name);
      setIsCreateModalOpen(false);
      setIsTemplateModalOpen(true);
      return;
    }

    try {
      const created = await funnelApi.create({
        name: data.name,
        templateId: data.templateId || undefined,
        createdBy: role ? role.charAt(0).toUpperCase() + role.slice(1) : undefined,
      });
      message.success("Funnel created successfully.");
      setIsCreateModalOpen(false);
      setIsTemplateModalOpen(false);
      setActiveFunnel(created);
      setView("manage");
      loadFunnels();
    } catch (err) {
      message.error(err.message || "Failed to create funnel.");
    }
  };

  const handleDuplicate = async (funnel) => {
    try {
      await funnelApi.duplicate(funnel._id);
      message.success("Funnel duplicated.");
      loadFunnels();
    } catch (_) {
      message.error("Failed to duplicate funnel.");
    }
  };

  // "Clone as new" reuses the exact same duplicate endpoint as Duplicate,
  // it just immediately offers to rename the copy via the existing PATCH
  // /:id (update) endpoint — no new backend logic.
  const handleClone = async (funnel) => {
    try {
      const cloned = await funnelApi.duplicate(funnel._id);
      setCloneTarget(cloned);
      setCloneName(cloned?.name || "");
      loadFunnels();
    } catch (_) {
      message.error("Failed to clone funnel.");
    }
  };

  const handleConfirmCloneRename = async () => {
    if (!cloneTarget) return;
    try {
      if (cloneName.trim() && cloneName.trim() !== cloneTarget.name) {
        await funnelApi.update(cloneTarget._id, { name: cloneName.trim() });
      }
      message.success("Funnel cloned.");
    } catch (_) {
      message.error("Cloned, but renaming failed.");
    } finally {
      setCloneTarget(null);
      setCloneName("");
      loadFunnels();
    }
  };

  const handleDelete = async (funnel) => {
    try {
      await funnelApi.delete(funnel._id);
      message.success("Funnel deleted.");
      loadFunnels();
    } catch (_) {
      message.error("Failed to delete funnel.");
    }
  };

  const handleToggleFavorite = async (funnel) => {
    try {
      await funnelApi.toggleFavorite(funnel._id, !funnel.isFavorite);
      setFunnels((prev) =>
        prev.map((f) => (f._id === funnel._id ? { ...f, isFavorite: !funnel.isFavorite } : f))
      );
    } catch (_) {
      message.error("Failed to update favorite.");
    }
  };

  const handleSetTags = async (funnel, tags) => {
    try {
      await funnelApi.setTags(funnel._id, tags);
      setFunnels((prev) => prev.map((f) => (f._id === funnel._id ? { ...f, tags } : f)));
      loadTags();
    } catch (_) {
      message.error("Failed to update tags.");
    }
  };

  const handleArchive = async (funnel) => {
    try {
      await funnelApi.archive(funnel._id);
      message.success("Funnel archived.");
      loadFunnels();
    } catch (_) {
      message.error("Failed to archive funnel.");
    }
  };

  const handleRestore = async (funnel) => {
    try {
      await funnelApi.restore(funnel._id, "Draft");
      message.success("Funnel restored to Draft.");
      loadFunnels();
    } catch (_) {
      message.error("Failed to restore funnel.");
    }
  };

  const runBulkAction = async (action, successMessage) => {
    if (selectedRowKeys.length === 0) return;
    setBulkLoading(true);
    try {
      const result = await funnelApi.bulkAction(selectedRowKeys, action);
      if (result?.failed?.length) {
        message.warning(`${result.succeeded.length} succeeded, ${result.failed.length} failed.`);
      } else {
        message.success(successMessage);
      }
      loadFunnels();
    } catch (_) {
      message.error("Bulk action failed.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = () => runBulkAction("delete", "Selected funnels deleted.");
  const handleBulkPublish = () => runBulkAction("publish", "Selected funnels published.");
  const handleBulkArchive = () => runBulkAction("archive", "Selected funnels archived.");

  if (view === "manage" && activeFunnel) {
    return <ManageFunnelView activeFunnel={activeFunnel} setView={setView} itemVariants={itemVariants} />;
  }

  const columns = [
    {
      title: "",
      dataIndex: "isFavorite",
      key: "isFavorite",
      width: 40,
      render: (isFavorite, r) => (
        <Star
          size={16}
          onClick={() => handleToggleFavorite(r)}
          style={{
            cursor: "pointer",
            color: isFavorite ? "#f5a623" : "var(--text-tertiary)",
            fill: isFavorite ? "#f5a623" : "none",
          }}
        />
      ),
    },
    {
      title: "NAME",
      dataIndex: "name",
      key: "name",
      render: (t, r) => (
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t}</span>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>/{r.slug}</div>
        </div>
      )
    },
    {
      title: "TAGS",
      dataIndex: "tags",
      key: "tags",
      render: (tags, r) => (
        <FunnelTagsEditor tags={tags || []} onChange={(next) => handleSetTags(r, next)} />
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => <FunnelStatusBadge status={status} />
    },
    {
      title: "STEPS",
      dataIndex: "stepCount",
      key: "stepCount",
      render: t => <strong style={{ color: 'var(--text-primary)' }}>{t || 0}</strong>
    },
    {
      title: "VISITORS",
      key: "visitors",
      render: (_, r) => <span style={{ color: 'var(--text-primary)' }}>{formatNumber(r.stats?.visitors)}</span>,
    },
    {
      title: "ORDERS",
      key: "orders",
      render: (_, r) => <span style={{ color: 'var(--text-primary)' }}>{formatNumber(r.stats?.orders)}</span>,
    },
    {
      title: "REVENUE",
      key: "revenue",
      render: (_, r) => <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(r.stats?.revenue)}</span>,
    },
    {
      title: "CONV. RATE",
      key: "conversionRate",
      render: (_, r) => <Text type="secondary" style={{ fontWeight: 500 }}>{formatPercent(r.stats?.conversionRate)}</Text>,
    },
    {
      title: "CREATED BY",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (v) => <Text type="secondary" style={{ fontWeight: 500 }}>{v || "—"}</Text>,
    },
    {
      title: "LAST EDITED",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{new Date(t).toLocaleDateString()}</Text>
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 60,
      render: (_, r) => (
        <FunnelQuickActions
          funnel={r}
          onManage={(f) => { setActiveFunnel(f); setView("manage"); }}
          onPreview={(f) => { setActiveFunnel(f); setView("manage"); }}
          onDuplicate={handleDuplicate}
          onClone={handleClone}
          onToggleFavorite={handleToggleFavorite}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      )
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <motion.div variants={itemVariants}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800 }}>Funnels</Title>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Build conversion journeys with landing pages, checkout stages, upsells, downsells, and leads integration.</Text>
        </div>
        <Space>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsCreateModalOpen(true)} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}>New Funnel</Button>
        </Space>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Space wrap>
          <Input 
            placeholder="Search for Funnels" 
            prefix={<Search size={16} color="var(--text-tertiary)" />} 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)} 
            onPressEnter={loadFunnels}
            style={{ width: 260, borderRadius: 8, height: 40 }} 
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150, height: 40 }}
            suffixIcon={<FilterIcon size={14} />}
          >
            <Option value="all">All statuses</Option>
            <Option value="Draft">Draft</Option>
            <Option value="Published">Published</Option>
            <Option value="Archived">Archived</Option>
          </Select>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 170, height: 40 }}
            suffixIcon={<ArrowUpDown size={14} />}
          >
            <Option value="newest">Newest first</Option>
            <Option value="oldest">Oldest first</Option>
            <Option value="updated">Last updated</Option>
            <Option value="name">Name (A–Z)</Option>
          </Select>
          <Select
            allowClear
            placeholder="Filter by tag"
            value={tagFilter}
            onChange={setTagFilter}
            style={{ width: 160, height: 40 }}
            options={tagOptions.map((t) => ({ value: t, label: t }))}
          />
          <Button
            type={favoritesOnly ? "primary" : "default"}
            icon={<Star size={14} style={{ fill: favoritesOnly ? '#fff' : 'none' }} />}
            onClick={() => setFavoritesOnly((v) => !v)}
            style={favoritesOnly ? { background: '#f5a623', border: 'none' } : {}}
          >
            Favorites
          </Button>
        </Space>
        <Button onClick={loadFunnels}>Refresh</Button>
      </div>

      <FunnelBulkActionBar
        selectedCount={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
        onBulkArchive={handleBulkArchive}
      />

      {loading ? (
        <div style={{ padding: 80, textAlign: "center" }}><Spin /></div>
      ) : (
        <Table
          columns={columns}
          dataSource={funnels}
          pagination={false}
          size="middle"
          rowKey="_id"
          scroll={{ x: 1300 }}
          rowSelection={rowSelection}
          loading={bulkLoading}
          locale={{
            emptyText: (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent-secondary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <BarChart3 size={32} />
                </div>
                <Title level={4} style={{ marginBottom: 8, color: 'var(--text-primary)', fontWeight: 800 }}>No funnels yet</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 14, fontWeight: 500 }}>Create your first funnel from blank or prebuilt templates.</Text>
                <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsCreateModalOpen(true)} style={{ borderRadius: 8, height: 40, background: 'var(--accent-secondary)', border: 'none', fontWeight: 600, padding: '0 24px' }}>New Funnel</Button>
              </div>
            )
          }}
        />
      )}

      <CreateFunnelModal 
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateFunnel}
      />

      <Modal
        open={!!cloneTarget}
        title="Name your cloned funnel"
        onCancel={() => { setCloneTarget(null); setCloneName(""); }}
        onOk={handleConfirmCloneRename}
        okText="Save"
      >
        <Input
          value={cloneName}
          onChange={(e) => setCloneName(e.target.value)}
          placeholder="Funnel name"
        />
      </Modal>

      <FunnelTemplateLibraryModal 
        open={isTemplateModalOpen}
        initialFunnelName={pendingFunnelName}
        onCancel={() => {
          setIsTemplateModalOpen(false);
          setIsCreateModalOpen(true);
        }}
        onCreate={handleCreateFunnel}
      />
    </motion.div>
  );
};

export default FunnelsTab;