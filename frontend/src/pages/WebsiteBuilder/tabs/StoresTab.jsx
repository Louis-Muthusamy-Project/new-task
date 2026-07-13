import React, { useState, useEffect } from "react";
import { Button, Table, Typography, Space, Popconfirm, Select, Card, Input, InputNumber, Row, Col, Checkbox, Tag, message, Empty, Spin, Switch } from "antd";
import { Plus, Trash2, Store, ShoppingBag, LayoutGrid, Users, Tag as TagIcon, LayoutTemplate, Truck, Settings, CreditCard, Mail, Search, ExternalLink, Activity, ArrowRight, Eye, Edit3, Image as ImageIcon, Wallet, Banknote, Landmark, Server, FileText, Package, Gift, ChevronDown, ChevronRight, TrendingUp, Percent, DollarSign, ShoppingCart, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CreateStoreModal from "./CreateStoreModal";
import StorePreviewModal from "./StorePreviewModal";
import StorePublishModal from "./StorePublishModal";
import StoreTemplateLibraryModal from "./StoreTemplateLibraryModal";
import ProductFormModal from "./ProductFormModal";
import CollectionFormModal from "./CollectionFormModal";
import CustomerFormModal from "./CustomerFormModal";
import { productApi, storeApi, collectionApi, customerApi, orderApi, ORDER_STATUSES, discountApi, DISCOUNT_TYPES, shippingApi, taxApi, paymentApi, PAYMENT_METHODS, emailApi, EMAIL_TEMPLATE_TYPES, analyticsApi } from "../../../api/storeApi";
import DiscountFormModal from "./DiscountFormModal";
import ShippingZoneModal from "./ShippingZoneModal";
import { optimizeStoreImageUrl } from "../utils/storeImageCdn";
import { useStoreSocket } from "../../../hooks/useStoreSocket";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Payments Module — the four gateways a store can offer at checkout.
// Order here drives the display order of the cards on the Payments tab.
const PAYMENT_METHOD_LABELS = {
  razorpay: "Razorpay",
  stripe: "Stripe",
  paypal: "PayPal",
  cod: "Cash on Delivery",
};

// Email Sender Module — the transactional events a store can send mail
// for. Order Confirmation and Welcome get their own dedicated tabs (Order
// Mail / Welcome Mail); all five show up in the Templates gallery.
const EMAIL_TEMPLATE_META = {
  orderConfirmation: { label: "Order Confirmation", description: "Sent the moment a customer completes checkout." },
  shippingUpdate: { label: "Shipping Update", description: "Sent when an order's fulfillment status changes to shipped." },
  orderCancelled: { label: "Order Cancelled", description: "Sent when an order is cancelled or refunded." },
  abandonedCart: { label: "Abandoned Cart", description: "Sent to nudge a customer back after they leave items in their cart." },
  welcome: { label: "Welcome Mail", description: "Sent the first time a new customer creates an account." },
};
const EMAIL_VARIABLE_HINT = "Available variables: {{customerName}}, {{orderNumber}}, {{orderTotal}}, {{trackingUrl}}, {{storeName}}";

const ManageStoreView = ({ activeStore, setView, itemVariants }) => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState("home");

  // Real storeId, when this store has a backing Store document (created via
  // the template flow or the "start from scratch" flow). Stores created
  // before this existed may only have a local mock `key`.
  const storeId = activeStore?._id || activeStore?.id || null;

  // ── Website Pages Module state ──────────────────────────────────────────
  const [storePages, setStorePages] = useState([]);
  const [storePagesLoading, setStorePagesLoading] = useState(false);

  const loadStorePages = async () => {
    if (!storeId) return;
    setStorePagesLoading(true);
    try {
      const data = await storeApi.previewStore(storeId);
      setStorePages(data?.pages || []);
    } catch (err) {
      message.error(err.message || "Failed to load store pages.");
    } finally {
      setStorePagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "website_pages") {
      loadStorePages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  // ── Home Module state — real counts fetched from the database (products,
  // collections, discounts, orders + lifetime revenue) instead of the
  // hardcoded placeholder numbers that used to live in renderHome(). ──────
  const [homeStats, setHomeStats] = useState({
    productsCount: 0,
    collectionsCount: 0,
    discountsCount: 0,
    ordersCount: 0,
    unfulfilledCount: 0,
    lifetimeSales: 0,
    currency: activeStore?.currency || "INR",
  });
  const [homeStatsLoading, setHomeStatsLoading] = useState(false);

  const COUNTED_ORDER_STATUSES = ["Paid", "Shipped", "Delivered"];

  const loadHomeStats = async () => {
    if (!storeId) return;
    setHomeStatsLoading(true);
    try {
      const [productsData, collectionsData, discountsData, ordersData] = await Promise.all([
        productApi.list(storeId).catch(() => []),
        collectionApi.list(storeId).catch(() => []),
        discountApi.list(storeId).catch(() => []),
        orderApi.list(storeId).catch(() => []),
      ]);

      const lifetimeSales = (ordersData || [])
        .filter((o) => COUNTED_ORDER_STATUSES.includes(o.status))
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const unfulfilledCount = (ordersData || []).filter((o) => o.status === "Paid").length;

      setHomeStats({
        productsCount: (productsData || []).length,
        collectionsCount: (collectionsData || []).length,
        discountsCount: (discountsData || []).length,
        ordersCount: (ordersData || []).length,
        unfulfilledCount,
        lifetimeSales,
        currency: ordersData?.[0]?.currency || activeStore?.currency || "INR",
      });
    } catch (err) {
      message.error(err.message || "Failed to load store overview.");
    } finally {
      setHomeStatsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "home") {
      loadHomeStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const handleEditStorePage = (page) => {
    if (!storeId || !page?._id) {
      message.error("Cannot open builder: missing store or page ID.");
      return;
    }
    navigate(`/stores/${storeId}/pages/${page._id}`, {
      state: { storeId, pageId: page._id, pageName: page.title || page.slug },
    });
  };

  const handleDeleteStorePage = async (page) => {
    // Soft-delete is done via PUT /api/store/pages/:id (storePageRoutes)
    // We can't easily call it without a dedicated delete endpoint, so we
    // hide it from the list optimistically and reload.
    message.info("Page delete not yet wired to a backend endpoint.");
  };

  // ── Store Preview module (Desktop/Tablet/Mobile) ──────────────────────────
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ── Store Publish module (Generate Build -> Upload Assets -> Save -> Live URL) ──
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  // ── Products Module state (Create/Edit/Delete + Images/Inventory/Price/SEO) ──
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    if (!storeId) return;
    setProductsLoading(true);
    try {
      const data = await productApi.list(storeId);
      setProducts(data || []);
    } catch (err) {
      message.error(err.message || "Failed to load products.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "products") {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const openCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductSaved = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleDeleteProduct = async (product) => {
    // Optimistic update: remove immediately so the Admin doesn't wait on
    // the network round-trip to see the list change, then roll back if
    // the delete actually fails server-side.
    const previous = products;
    setProducts((prev) => prev.filter((p) => p._id !== product._id));
    try {
      await productApi.remove(storeId, product._id);
      message.success("Product deleted.");
    } catch (err) {
      setProducts(previous);
      message.error(err.message || "Failed to delete product.");
    }
  };

  // ── Orders Module state (List/View/Update Status/Delete) ──
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadOrders = async () => {
    if (!storeId) return;
    setOrdersLoading(true);
    try {
      const data = await orderApi.list(storeId, { status: orderStatusFilter || undefined });
      setOrders(data || []);
    } catch (err) {
      message.error(err.message || "Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "orders") {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId, orderStatusFilter]);

  const handleOrderStatusChange = async (order, status) => {
    const previous = orders;
    setUpdatingOrderId(order._id);
    // Optimistic update: the status pill flips immediately; if the
    // request fails, the exact previous list (not just this one order)
    // is restored so nothing else drifts out of sync.
    setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status } : o)));
    try {
      const updated = await orderApi.updateStatus(storeId, order._id, status);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, ...updated } : o)));
      message.success(`Order marked as ${status}.`);
    } catch (err) {
      setOrders(previous);
      message.error(err.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (order) => {
    const previous = orders;
    setOrders((prev) => prev.filter((o) => o._id !== order._id));
    try {
      await orderApi.remove(storeId, order._id);
      message.success("Order deleted.");
    } catch (err) {
      setOrders(previous);
      message.error(err.message || "Failed to delete order.");
    }
  };

  // ── Discounts Module state (Create/Edit/Delete) ──
  const [discounts, setDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  const loadDiscounts = async () => {
    if (!storeId) return;
    setDiscountsLoading(true);
    try {
      const data = await discountApi.list(storeId);
      setDiscounts(data || []);
    } catch (err) {
      message.error(err.message || "Failed to load discounts.");
    } finally {
      setDiscountsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "discounts") {
      loadDiscounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const openCreateDiscount = () => {
    setEditingDiscount(null);
    setIsDiscountModalOpen(true);
  };

  const openEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setIsDiscountModalOpen(true);
  };

  const handleDiscountSaved = () => {
    setIsDiscountModalOpen(false);
    setEditingDiscount(null);
    loadDiscounts();
  };

  const handleDeleteDiscount = async (discount) => {
    const previous = discounts;
    setDiscounts((prev) => prev.filter((d) => d._id !== discount._id));
    try {
      await discountApi.remove(storeId, discount._id);
      message.success("Discount deleted.");
    } catch (err) {
      setDiscounts(previous);
      message.error(err.message || "Failed to delete discount.");
    }
  };

  // ── Shipping Module state (Zones/Charges/Free Shipping/Delivery Time) ──
  const [shippingConfig, setShippingConfig] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [freeShippingInput, setFreeShippingInput] = useState(null);
  const [savingFreeShipping, setSavingFreeShipping] = useState(false);

  const loadShipping = async () => {
    if (!storeId) return;
    setShippingLoading(true);
    try {
      const data = await shippingApi.get(storeId);
      setShippingConfig(data || null);
      setFreeShippingInput(data?.freeShippingThreshold ?? null);
    } catch (err) {
      message.error(err.message || "Failed to load shipping settings.");
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "shipping") {
      loadShipping();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const openCreateZone = () => {
    setEditingZone(null);
    setIsZoneModalOpen(true);
  };

  const openEditZone = (zone) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleZoneSaved = (updatedShipping) => {
    setIsZoneModalOpen(false);
    setEditingZone(null);
    setShippingConfig(updatedShipping);
  };

  const handleDeleteZone = async (zone) => {
    try {
      const updated = await shippingApi.removeZone(storeId, zone._id);
      setShippingConfig(updated);
      message.success("Shipping zone deleted.");
    } catch (err) {
      message.error(err.message || "Failed to delete shipping zone.");
    }
  };

  const handleSaveFreeShipping = async () => {
    setSavingFreeShipping(true);
    try {
      const updated = await shippingApi.updateSettings(storeId, {
        freeShippingThreshold: freeShippingInput === "" ? null : freeShippingInput,
      });
      setShippingConfig(updated);
      message.success("Free shipping settings saved.");
    } catch (err) {
      message.error(err.message || "Failed to save free shipping settings.");
    } finally {
      setSavingFreeShipping(false);
    }
  };

  // ── Tax Module state (Sales tax rate, applied at CartService/OrderService
  // checkout time — see backend taxService.js) ──
  const [taxSettings, setTaxSettings] = useState(null);
  const [taxRateInput, setTaxRateInput] = useState("0");
  const [savingTax, setSavingTax] = useState(false);

  const loadTax = async () => {
    if (!storeId) return;
    try {
      const data = await taxApi.get(storeId);
      setTaxSettings(data || null);
      setTaxRateInput(data?.rate != null ? String(data.rate) : "0");
    } catch (err) {
      message.error(err.message || "Failed to load tax settings.");
    }
  };

  useEffect(() => {
    if (activeSubTab === "shipping") {
      loadTax();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const handleSaveTax = async () => {
    setSavingTax(true);
    try {
      const updated = await taxApi.updateSettings(storeId, {
        rate: taxRateInput === "" ? 0 : Number(taxRateInput),
        isEnabled: true,
      });
      setTaxSettings(updated);
      message.success("Tax settings saved.");
    } catch (err) {
      message.error(err.message || "Failed to save tax settings.");
    } finally {
      setSavingTax(false);
    }
  };

  // ── Analytics Module state (Visitors/Sales/Orders/Revenue/Conversion) ──
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState(30);

  const loadAnalytics = async (days = analyticsRange) => {
    if (!storeId) return;
    setAnalyticsLoading(true);
    try {
      const data = await analyticsApi.get(storeId, { days });
      setAnalytics(data || null);
    } catch (err) {
      message.error(err.message || "Failed to load analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "analytics") {
      loadAnalytics(analyticsRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId, analyticsRange]);

  // ── Payments Module state (Razorpay/Stripe/PayPal/Cash on Delivery) ──
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentDrafts, setPaymentDrafts] = useState({});
  const [savingMethod, setSavingMethod] = useState(null);

  const loadPayments = async () => {
    if (!storeId) return;
    setPaymentsLoading(true);
    try {
      const data = await paymentApi.get(storeId);
      setPaymentConfig(data || null);
      setPaymentDrafts(data?.methods || {});
    } catch (err) {
      message.error(err.message || "Failed to load payment settings.");
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "payments") {
      loadPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const updatePaymentDraft = (method, field, value) => {
    setPaymentDrafts((prev) => ({
      ...prev,
      [method]: { ...prev[method], [field]: value },
    }));
  };

  const saveMethod = async (method, overrides = {}) => {
    setSavingMethod(method);
    try {
      const payload = { ...paymentDrafts[method], ...overrides };
      const updated = await paymentApi.updateMethod(storeId, method, payload);
      setPaymentConfig(updated);
      setPaymentDrafts(updated?.methods || {});
      message.success(`${PAYMENT_METHOD_LABELS[method]} settings saved.`);
    } catch (err) {
      message.error(err.message || `Failed to save ${PAYMENT_METHOD_LABELS[method]} settings.`);
      // Revert the optimistic draft (e.g. a toggle-on with no key set yet)
      // back to the last known-good state from the server.
      setPaymentDrafts((prev) => ({ ...prev, [method]: paymentConfig?.methods?.[method] || prev[method] }));
    } finally {
      setSavingMethod(null);
    }
  };

  const toggleMethod = async (method, enabled) => {
    // Optimistic flip so the switch feels instant; saveMethod() reconciles
    // with the server response (and reverts the field on validation errors,
    // e.g. enabling a gateway with no key set yet).
    setPaymentDrafts((prev) => ({ ...prev, [method]: { ...prev[method], enabled } }));
    await saveMethod(method, { enabled });
  };

  // ── Email Sender Module state (SMTP/Templates/Order Mail/Welcome Mail) ──
  const [emailSettings, setEmailSettings] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSection, setEmailSection] = useState("smtp");
  const [senderDraft, setSenderDraft] = useState({});
  const [smtpDraft, setSmtpDraft] = useState({});
  const [templateDrafts, setTemplateDrafts] = useState({});
  const [savingSender, setSavingSender] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(null);
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  const loadEmailSettings = async () => {
    if (!storeId) return;
    setEmailLoading(true);
    try {
      const data = await emailApi.get(storeId);
      setEmailSettings(data || null);
      setSenderDraft({
        useCustomSender: data?.useCustomSender || false,
        senderName: data?.senderName || "",
        senderEmail: data?.senderEmail || "",
        replyToEmail: data?.replyToEmail || "",
      });
      setSmtpDraft(data?.smtp || {});
      setTemplateDrafts(data?.templates || {});
    } catch (err) {
      message.error(err.message || "Failed to load email settings.");
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "email") {
      loadEmailSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const updateSenderDraft = (field, value) => setSenderDraft((prev) => ({ ...prev, [field]: value }));

  const saveSender = async () => {
    setSavingSender(true);
    try {
      const updated = await emailApi.updateSender(storeId, senderDraft);
      setEmailSettings(updated);
      message.success("Sender identity saved.");
    } catch (err) {
      message.error(err.message || "Failed to save sender identity.");
    } finally {
      setSavingSender(false);
    }
  };

  const updateSmtpDraft = (field, value) => setSmtpDraft((prev) => ({ ...prev, [field]: value }));

  const saveSmtp = async (overrides = {}) => {
    setSavingSmtp(true);
    try {
      const payload = { ...smtpDraft, ...overrides };
      const updated = await emailApi.updateSmtp(storeId, payload);
      setEmailSettings(updated);
      setSmtpDraft(updated?.smtp || {});
      message.success("SMTP settings saved.");
    } catch (err) {
      message.error(err.message || "Failed to save SMTP settings.");
      setSmtpDraft(emailSettings?.smtp || {});
    } finally {
      setSavingSmtp(false);
    }
  };

  const updateTemplateDraft = (type, field, value) => {
    setTemplateDrafts((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  const saveTemplate = async (type, overrides = {}) => {
    setSavingTemplate(type);
    try {
      const payload = { ...templateDrafts[type], ...overrides };
      const updated = await emailApi.updateTemplate(storeId, type, payload);
      setEmailSettings(updated);
      setTemplateDrafts(updated?.templates || {});
      message.success(`${EMAIL_TEMPLATE_META[type].label} template saved.`);
    } catch (err) {
      message.error(err.message || `Failed to save the ${EMAIL_TEMPLATE_META[type].label} template.`);
      setTemplateDrafts((prev) => ({ ...prev, [type]: emailSettings?.templates?.[type] || prev[type] }));
    } finally {
      setSavingTemplate(null);
    }
  };

  const toggleTemplate = async (type, enabled) => {
    setTemplateDrafts((prev) => ({ ...prev, [type]: { ...prev[type], enabled } }));
    await saveTemplate(type, { enabled });
  };

  // ── Collections Module state (Create/Edit/Delete + Products link) ──
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const loadCollections = async () => {
    if (!storeId) return;
    setCollectionsLoading(true);
    try {
      const data = await collectionApi.list(storeId);
      setCollections(data || []);
    } catch (err) {
      message.error(err.message || "Failed to load collections.");
    } finally {
      setCollectionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "collections") {
      loadCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const openCreateCollection = () => {
    setEditingCollection(null);
    setIsCollectionModalOpen(true);
  };

  const openEditCollection = (collection) => {
    setEditingCollection(collection);
    setIsCollectionModalOpen(true);
  };

  const handleCollectionSaved = () => {
    setIsCollectionModalOpen(false);
    setEditingCollection(null);
    loadCollections();
  };

  const handleDeleteCollection = async (collection) => {
    const previous = collections;
    setCollections((prev) => prev.filter((c) => c._id !== collection._id));
    try {
      await collectionApi.remove(storeId, collection._id);
      message.success("Collection deleted.");
    } catch (err) {
      setCollections(previous);
      message.error(err.message || "Failed to delete collection.");
    }
  };

  // ── Customer Module state (Create/Edit/Delete) ──
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const loadCustomers = async () => {
    if (!storeId) return;
    setCustomersLoading(true);
    try {
      const data = await customerApi.list(storeId);
      setCustomers(data || []);
    } catch (err) {
      message.error(err.message || "Failed to load customers.");
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "customers") {
      loadCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, storeId]);

  const openCreateCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSaved = () => {
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
    loadCustomers();
  };

  const handleDeleteCustomer = async (customer) => {
    const previous = customers;
    setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
    try {
      await customerApi.remove(storeId, customer._id);
      message.success("Customer deleted.");
    } catch (err) {
      setCustomers(previous);
      message.error(err.message || "Failed to delete customer.");
    }
  };

  // ── Real-time sync (Socket.io) ──────────────────────────────────────────
  // One connection per store, shared by every module below. Rather than
  // each module polling on an interval, the backend pushes an event the
  // instant a write commits (see storeEvents.js / storeSocket.js) and
  // this dispatches it to whichever module's list is affected — reusing
  // the exact same load* functions the manual "Save"/"Delete" flows
  // already call, so there is exactly one code path per module that
  // fetches its data, not a duplicated "live" version and a "manual"
  // version. This is also what keeps two admins (or two tabs) on the
  // same store's dashboard in sync with each other, not just with the
  // storefront.
  const { subscribe: subscribeToStoreSocket, connected: realtimeConnected } = useStoreSocket(storeId);

  useEffect(() => {
    const unsubscribe = subscribeToStoreSocket((event) => {
      const { type } = event;
      // Only reload the module that's actually on screen right now —
      // switching to a different subtab already triggers that module's
      // own load* effect above, so there is no staleness risk from
      // skipping a reload here; this just avoids firing a network
      // request for a list nobody can currently see.
      if ((type.startsWith("product.") || type === "inventory.updated") && activeSubTab === "products") {
        loadProducts();
      } else if (type.startsWith("collection.") && activeSubTab === "collections") {
        loadCollections();
      } else if (
        (type.startsWith("product.") || type === "inventory.updated" || type.startsWith("collection.")) &&
        activeSubTab === "collections"
      ) {
        // A product's collectionIds/status change can change a visible
        // collection's productCount even though the event type itself
        // is product.*, not collection.*.
        loadCollections();
      } else if (type.startsWith("discount.") && activeSubTab === "discounts") {
        loadDiscounts();
      } else if (type.startsWith("order.") && activeSubTab === "orders") {
        loadOrders();
      } else if (type.startsWith("customer.") && activeSubTab === "customers") {
        loadCustomers();
      }
      // 'theme.updated' has no dedicated Admin list to reload here today
      // (the Theme tab reads Store.theme directly on open); the live
      // storefront is what actually needs to react to it, via
      // StorefrontContext.
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToStoreSocket, activeSubTab]);

  const renderHome = () => (
    <motion.div variants={itemVariants} className="store-manage-content">

      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col span={8}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', fontSize: 16 }}>Chat widget</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                Assign a published chat widget to this property. It also appears in the page builder under Chat.
              </div>
              <Select defaultValue="none" style={{ width: "100%", marginBottom: 16, height: 44 }}>
                <Option value="none">— None —</Option>
              </Select>
              <Button type="primary" block style={{ background: "var(--accent-info)", border: "none", borderRadius: 8, fontWeight: 700, height: 44, marginBottom: 12 }}>
                Save chat widget
              </Button>
              <div style={{ textAlign: "center", color: "var(--accent-info)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + Create new chat widget
              </div>
            </Card>

            <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', fontSize: 16 }}>Custom domain</div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
                Connect a domain so visitors reach this property without /shop/ or /p/ paths.
              </div>
              <Button type="primary" block style={{ background: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700, height: 44 }}>
                Connect domain
              </Button>
            </Card>
          </div>
        </Col>

        {/* Right Column */}
        <Col span={16}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><ShoppingBag size={14} /> PRODUCTS</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>{homeStatsLoading ? <Spin size="small" /> : homeStats.productsCount}</div>
                <div onClick={() => setActiveSubTab("products")} style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>Manage <ArrowRight size={14} /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><LayoutGrid size={14} /> COLLECTIONS</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>{homeStatsLoading ? <Spin size="small" /> : homeStats.collectionsCount}</div>
                <div onClick={() => setActiveSubTab("collections")} style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>Manage <ArrowRight size={14} /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> ORDERS</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>{homeStatsLoading ? <Spin size="small" /> : homeStats.ordersCount}</div>
                <div onClick={() => setActiveSubTab("orders")} style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>View <ArrowRight size={14} /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><TagIcon size={14} /> DISCOUNTS</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>{homeStatsLoading ? <Spin size="small" /> : homeStats.discountsCount}</div>
                <div onClick={() => setActiveSubTab("discounts")} style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>Manage <ArrowRight size={14} /></div>
              </Card>
            </Col>

            <Col span={10}>
              <Card bodyStyle={{ padding: 24, height: "100%", display: 'flex', flexDirection: 'column' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>LIFETIME SALES (PAID)</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>{homeStatsLoading ? <Spin size="small" /> : `${homeStats.currency} ${homeStats.lifetimeSales.toFixed(2)}`}</div>
                <div onClick={() => setActiveSubTab("analytics")} style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>Open analytics <ArrowRight size={14} /></div>
              </Card>
            </Col>

            <Col span={7}>
              <Card bodyStyle={{ padding: 24, height: "100%", display: 'flex', flexDirection: 'column' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>UNFULFILLED ORDERS</div>
                <div style={{ fontSize: 28, color: "var(--accent-warning)", fontWeight: 800, marginBottom: 16 }}>{homeStatsLoading ? <Spin size="small" /> : homeStats.unfulfilledCount}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, marginTop: 'auto' }}>Mark orders shipped from the Orders screen.</div>
              </Card>
            </Col>

            <Col span={7}>
              <Card bodyStyle={{ padding: 24, height: "100%", display: "flex", flexDirection: "column" }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)', fontSize: 16 }}>Storefront</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 500 }}>/shop/{activeStore.slug}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, fontWeight: 500 }}>Set store to <strong>Active</strong> in General so customers can checkout.</div>

                <Space direction="vertical" style={{ width: "100%", marginTop: "auto" }}>
                  <Button block onClick={() => setActiveSubTab("website_pages")} style={{ borderRadius: 8, fontSize: 13, fontWeight: 700, height: 40, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Manage design</Button>
                  <Button block onClick={() => setActiveSubTab("website_pages")} style={{ borderRadius: 8, fontSize: 13, fontWeight: 700, height: 40, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Pages in Builder</Button>
                  <Button type="primary" block style={{ background: "var(--accent-primary)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, height: 40 }} onClick={() => setIsPublishOpen(true)}>Publish</Button>
                  <Button type="primary" block style={{ background: "var(--accent-success)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, height: 40 }} onClick={() => setIsPreviewOpen(true)}>Preview live <ArrowRight size={14} style={{ marginLeft: 4 }} /></Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </motion.div>
  );

  const renderProducts = () => {
    const columns = [
      {
        title: "PRODUCT",
        key: "title",
        render: (_, r) => (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "var(--bg-primary)", border: "1px solid var(--border-color)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {r.images?.[0] ? (
                <img
                  src={optimizeStoreImageUrl(r.images[0], "thumbnail")}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <ImageIcon size={16} color="var(--text-tertiary)" />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{r.title}</div>
              {r.sku ? <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>SKU: {r.sku}</div> : null}
            </div>
          </div>
        ),
      },
      {
        title: "STATUS",
        dataIndex: "status",
        key: "status",
        render: (t) => {
          const color = t === "Active" ? "var(--accent-success)" : t === "Archived" ? "var(--text-tertiary)" : "var(--accent-warning)";
          return <Tag style={{ background: `${color}1A`, color, border: "none", fontWeight: 700, borderRadius: 6 }}>{t}</Tag>;
        },
      },
      {
        title: "PRICE",
        key: "price",
        render: (_, r) => (
          <Text style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {r.currency} {Number(r.price || 0).toFixed(2)}
            {r.compareAtPrice ? (
              <span style={{ marginLeft: 6, textDecoration: "line-through", color: "var(--text-tertiary)", fontSize: 12 }}>
                {r.currency} {Number(r.compareAtPrice).toFixed(2)}
              </span>
            ) : null}
          </Text>
        ),
      },
      {
        title: "STOCK",
        key: "stock",
        render: (_, r) =>
          r.trackInventory ? (
            <Text type="secondary" style={{ fontWeight: 500 }}>{r.inventoryQuantity ?? 0}</Text>
          ) : (
            <Text type="secondary" style={{ fontWeight: 500 }}>Not tracked</Text>
          ),
      },
      {
        title: "ACTIONS",
        key: "actions",
        render: (_, r) => (
          <Space>
            <Button icon={<Edit3 size={14} />} onClick={() => openEditProduct(r)} style={{ borderRadius: 8, fontWeight: 600, borderColor: "var(--border-color)", color: "var(--text-primary)", background: "var(--bg-secondary)" }}>
              Edit
            </Button>
            <Popconfirm title="Delete this product?" onConfirm={() => handleDeleteProduct(r)} okText="Delete" okButtonProps={{ danger: true }}>
              <Button danger icon={<Trash2 size={14} />} style={{ borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", border: "none" }} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        {!storeId ? (
          <Card bodyStyle={{ padding: 48, textAlign: "center" }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              This store isn't linked to a backend record, so products can't be managed yet. Create a new store to try the Products module.
            </Text>
          </Card>
        ) : (
          <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            {productsLoading ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <Spin />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={products}
                rowKey="_id"
                pagination={false}
                size="middle"
                locale={{
                  emptyText: (
                    <div style={{ padding: "60px 0", textAlign: "center" }}>
                      <Empty description="No products yet" />
                      <Button type="primary" icon={<Plus size={16} />} onClick={openCreateProduct} style={{ marginTop: 16, background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}>
                        Add your first product
                      </Button>
                    </div>
                  ),
                }}
              />
            )}
          </Card>
        )}

        <ProductFormModal
          open={isProductModalOpen}
          onCancel={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
          onSaved={handleProductSaved}
          storeId={storeId}
          product={editingProduct}
        />
      </motion.div>
    );
  };

  const renderWebsitePages = () => {
    const pageColumns = [
      {
        title: "PAGE",
        key: "page",
        render: (_, r) => (
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.title || r.slug || '—'}</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>/{r.slug}</div>
          </div>
        ),
      },
      {
        title: "TYPE",
        key: "type",
        render: (_, r) => (
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            {r.isHome ? 'Home' : r.pageType || 'Custom'}
          </span>
        ),
      },
      {
        title: "STATUS",
        key: "status",
        render: (_, r) => {
          const s = r.status || 'Draft';
          const color = s === 'Published' ? 'var(--accent-success)' : 'var(--text-tertiary)';
          return (
            <Tag style={{ background: `${s === 'Published' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.15)'}`, color, border: 'none', fontWeight: 700, borderRadius: 6 }}>
              {s}
            </Tag>
          );
        },
      },
      {
        title: "ACTIONS",
        key: "actions",
        render: (_, r) => (
          <Space>
            <Button
              type="primary"
              icon={<Edit3 size={14} />}
              onClick={() => handleEditStorePage(r)}
              style={{ background: "var(--accent-primary)", border: 'none', borderRadius: 8, fontWeight: 700 }}
            >
              Edit in builder
            </Button>
            <Button
              danger
              icon={<Trash2 size={14} />}
              onClick={() => handleDeleteStorePage(r)}
              style={{ borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: 'none' }}
            />
          </Space>
        ),
      },
    ];

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        <div style={{ padding: "16px 24px", borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          Store header and footer are synced from your home page. Catalog, cart, checkout, and blog pages use them automatically.
        </div>

        {!storeId ? (
          <Card bodyStyle={{ padding: 48, textAlign: 'center' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              This store isn't linked to a backend record yet. Create a new store to manage its pages.
            </Text>
          </Card>
        ) : storePagesLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
        ) : (
          <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            <Table
              columns={pageColumns}
              dataSource={storePages}
              rowKey="_id"
              pagination={false}
              size="middle"
              locale={{
                emptyText: (
                  <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <Empty description="No pages yet — create your store from a template to auto-generate default pages." />
                  </div>
                ),
              }}
            />
          </Card>
        )}

        <div style={{ color: "var(--text-tertiary)", fontSize: 12, fontWeight: 500, marginTop: 16, textAlign: 'center' }}>
          Live cart opens in a right sidebar on your storefront. Use cart &amp; checkout modules in the builder for promos; checkout still runs on the live cart page.
        </div>
      </motion.div>
    );
  };

  const renderShipping = () => (
    <motion.div variants={itemVariants} className="store-manage-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <Card style={{ width: "100%", maxWidth: 800, borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Shipping zones</div>
          {storeId && (
            <Button type="primary" icon={<Plus size={16} />} onClick={openCreateZone} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700 }}>
              Zone
            </Button>
          )}
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, marginBottom: 24 }}>
          Group countries into zones, each with its own shipping charges and delivery time estimates.
        </div>

        {!storeId ? (
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
            This store isn't linked to a backend record, so shipping zones can't be managed yet. Create a new store to try the Shipping module.
          </Text>
        ) : shippingLoading ? (
          <div style={{ padding: 40, textAlign: "center" }}><Spin /></div>
        ) : !shippingConfig?.zones?.length ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <Empty description="No shipping zones yet" />
            <Button type="primary" icon={<Plus size={16} />} onClick={openCreateZone} style={{ marginTop: 16, background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}>
              Add your first zone
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shippingConfig.zones.map((zone) => (
              <div key={zone._id} style={{ border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{zone.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500, marginTop: 2 }}>
                      {zone.countries?.length ? zone.countries.join(", ") : "No countries specified"}
                    </div>
                  </div>
                  <Space>
                    <Button icon={<Edit3 size={14} />} onClick={() => openEditZone(zone)} style={{ borderRadius: 8, fontWeight: 600, borderColor: "var(--border-color)", color: "var(--text-primary)", background: "var(--bg-secondary)" }}>
                      Edit
                    </Button>
                    <Popconfirm title="Delete this zone?" onConfirm={() => handleDeleteZone(zone)} okText="Delete" okButtonProps={{ danger: true }}>
                      <Button danger icon={<Trash2 size={14} />} style={{ borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", border: "none" }} />
                    </Popconfirm>
                  </Space>
                </div>

                {zone.rates?.length ? (
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={zone.rates.map((r, i) => ({ ...r, key: i }))}
                    columns={[
                      { title: "RATE", dataIndex: "name", key: "name", render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
                      { title: "SHIPPING CHARGE", key: "price", render: (_, r) => `${activeStore?.currency || "USD"} ${Number(r.price || 0).toFixed(2)}` },
                      { title: "DELIVERY TIME", dataIndex: "deliveryTime", key: "deliveryTime", render: (t) => t || "—" },
                    ]}
                  />
                ) : (
                  <Text type="secondary" style={{ fontSize: 12 }}>No rates configured for this zone.</Text>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ width: "100%", maxWidth: 800, borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 40 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>Free shipping</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, marginBottom: 24 }}>
          Orders at or above this subtotal automatically qualify for free shipping at checkout. Leave blank to disable.
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <InputNumber
            size="large"
            min={0}
            disabled={!storeId}
            value={freeShippingInput}
            onChange={setFreeShippingInput}
            placeholder="e.g. 75"
            style={{ width: 220, borderRadius: 8 }}
            addonBefore={activeStore?.currency || "USD"}
          />
          <Button
            type="primary"
            loading={savingFreeShipping}
            disabled={!storeId}
            onClick={handleSaveFreeShipping}
            style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700, height: 40 }}
          >
            Save
          </Button>
        </div>
      </Card>

      <ShippingZoneModal
        open={isZoneModalOpen}
        onCancel={() => { setIsZoneModalOpen(false); setEditingZone(null); }}
        onSaved={handleZoneSaved}
        storeId={storeId}
        zone={editingZone}
      />

      <Card style={{ width: "100%", maxWidth: 800, borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 40 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>Tax & checkout</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, marginBottom: 32 }}>
          Tax is calculated on the cart subtotal after discounts, before Stripe Checkout.
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Sales tax rate (%)</div>
          <Space>
            <Input
              value={taxRateInput}
              onChange={(e) => setTaxRateInput(e.target.value)}
              disabled={!storeId}
              size="large"
              style={{ borderRadius: 8, width: 220 }}
            />
            <Button
              type="primary"
              loading={savingTax}
              disabled={!storeId}
              onClick={handleSaveTax}
              style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700, height: 40 }}
            >
              Save
            </Button>
          </Space>
          {taxSettings && (
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 8 }}>
              Currently applying {taxSettings.rate}% tax on the cart subtotal after discounts, at checkout.
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Checkout footer note</div>
          <TextArea defaultValue={`Thank you for shopping at ${activeStore.store}.`} size="large" style={{ borderRadius: 8, minHeight: 100 }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Shipping information</div>
          <TextArea defaultValue="Standard shipping 3-5 business days. Free shipping on qualifying orders." size="large" style={{ borderRadius: 8, minHeight: 100 }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Refund policy</div>
          <TextArea defaultValue="Returns accepted within 14 days on unused items in original packaging." size="large" style={{ borderRadius: 8, minHeight: 100 }} />
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Privacy policy</div>
          <TextArea size="large" style={{ borderRadius: 8, minHeight: 100 }} />
        </div>

        <Button type="primary" style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 800, height: 48, padding: "0 40px", fontSize: 16 }}>
          Save Policies
        </Button>
      </Card>
    </motion.div>
  );

  const ANALYTICS_STAT_CARDS = [
    { key: "visitors", label: "VISITORS", icon: <Users size={16} />, format: (d) => d.visitors.toLocaleString() },
    { key: "productViews", label: "PRODUCT VIEWS", icon: <Eye size={16} />, format: (d) => (d.productViews || 0).toLocaleString() },
    { key: "searches", label: "SEARCHES", icon: <Search size={16} />, format: (d) => (d.searches || 0).toLocaleString() },
    { key: "cartAdds", label: "CART ADDS", icon: <ShoppingCart size={16} />, format: (d) => (d.cartAdds || 0).toLocaleString() },
    { key: "checkoutStarts", label: "CHECKOUT STARTS", icon: <CreditCard size={16} />, format: (d) => (d.checkoutStarts || 0).toLocaleString() },
    { key: "sales", label: "SALES (UNITS)", icon: <ShoppingBag size={16} />, format: (d) => d.sales.toLocaleString() },
    { key: "orders", label: "ORDERS (PURCHASES)", icon: <Package size={16} />, format: (d) => d.orders.toLocaleString() },
    { key: "revenue", label: "REVENUE", icon: <DollarSign size={16} />, format: (d) => `${d.currency} ${Number(d.revenue).toFixed(2)}` },
    { key: "conversion", label: "CONVERSION", icon: <Percent size={16} />, format: (d) => `${Number(d.conversionRate).toFixed(1)}%` },
  ];

  const renderAnalytics = () => {
    const data = analytics || {
      visitors: 0, sales: 0, orders: 0, revenue: 0, conversionRate: 0, currency: "USD",
      productViews: 0, searches: 0, cartAdds: 0, checkoutStarts: 0,
      topProducts: [], topViewedProducts: [], topSearchTerms: [], topCustomers: [], funnel: [],
    };

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={22} color="var(--text-tertiary)" /> Analytics
          </div>
          <Select value={analyticsRange} onChange={setAnalyticsRange} size="large" style={{ width: 160 }}>
            <Option value={7}>Last 7 days</Option>
            <Option value={30}>Last 30 days</Option>
            <Option value={90}>Last 90 days</Option>
          </Select>
        </div>

        {!storeId ? (
          <div style={{ padding: "20px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--accent-warning)', lineHeight: 1.6 }}>
            This store isn't linked to a backend record, so analytics can't be computed yet. Create a new store to try the Analytics module.
          </div>
        ) : analyticsLoading ? (
          <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {ANALYTICS_STAT_CARDS.map((c) => (
                <Col span={Math.floor(24 / Math.ceil(ANALYTICS_STAT_CARDS.length / 2))} key={c.key}>
                  <Card bodyStyle={{ padding: 22 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 10 }}>
                      {c.icon} {c.label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{c.format(data)}</div>
                  </Card>
                </Col>
              ))}
            </Row>

            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", background: 'var(--bg-secondary)', marginBottom: 20 }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                Conversion funnel ({analyticsRange} days)
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 12 }}>
                {(data.funnel || []).map((step, i) => (
                  <React.Fragment key={step.step}>
                    <div style={{ minWidth: 120 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 6 }}>{step.step.toUpperCase()}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{step.count.toLocaleString()}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)" }}>{Number(step.rate).toFixed(1)}% of visitors</div>
                    </div>
                    {i < (data.funnel || []).length - 1 && (
                      <ArrowRight size={18} color="var(--text-tertiary)" style={{ alignSelf: "center", marginTop: 18 }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </Card>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", background: 'var(--bg-secondary)', height: '100%' }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                    Top products by revenue ({analyticsRange} days)
                  </div>
                  <Table
                    rowKey={(r, i) => r.title + i}
                    columns={[
                      { title: "PRODUCT", dataIndex: "title", key: "product", render: (v) => <Text style={{ fontWeight: 700, color: "var(--text-primary)" }}>{v}</Text> },
                      { title: "UNITS", dataIndex: "units", key: "units" },
                      { title: "REVENUE", key: "revenue", align: "right", render: (_, r) => `${data.currency} ${Number(r.revenue).toFixed(2)}` },
                    ]}
                    dataSource={data.topProducts || []}
                    pagination={false}
                    locale={{
                      emptyText: <div style={{ padding: "40px 0", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>No paid orders in this window yet.</div>
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", background: 'var(--bg-secondary)', height: '100%' }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Eye size={16} color="var(--text-tertiary)" /> Most-viewed products ({analyticsRange} days)
                  </div>
                  <Table
                    rowKey={(r, i) => String(r.productId) + i}
                    columns={[
                      { title: "PRODUCT", dataIndex: "title", key: "product", render: (v) => <Text style={{ fontWeight: 700, color: "var(--text-primary)" }}>{v}</Text> },
                      { title: "VIEWS", dataIndex: "views", key: "views", align: "right" },
                    ]}
                    dataSource={data.topViewedProducts || []}
                    pagination={false}
                    locale={{
                      emptyText: <div style={{ padding: "40px 0", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>No product views tracked in this window yet.</div>
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", background: 'var(--bg-secondary)', height: '100%' }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Search size={16} color="var(--text-tertiary)" /> Top search terms ({analyticsRange} days)
                  </div>
                  <Table
                    rowKey={(r, i) => r.query + i}
                    columns={[
                      { title: "QUERY", dataIndex: "query", key: "query", render: (v) => <Text style={{ fontWeight: 700, color: "var(--text-primary)" }}>{v}</Text> },
                      { title: "SEARCHES", dataIndex: "searches", key: "searches", align: "right" },
                    ]}
                    dataSource={data.topSearchTerms || []}
                    pagination={false}
                    locale={{
                      emptyText: <div style={{ padding: "40px 0", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>No searches tracked in this window yet.</div>
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", background: 'var(--bg-secondary)', height: '100%' }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Award size={16} color="var(--text-tertiary)" /> Top customers ({analyticsRange} days)
                  </div>
                  <Table
                    rowKey={(r, i) => String(r.customerId) + i}
                    columns={[
                      {
                        title: "CUSTOMER", key: "customer", render: (_, r) => (
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{r.name}</div>
                            {r.email && <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>{r.email}</div>}
                          </div>
                        )
                      },
                      { title: "ORDERS", dataIndex: "orders", key: "orders", align: "right" },
                      { title: "REVENUE", key: "revenue", align: "right", render: (_, r) => `${data.currency} ${Number(r.revenue).toFixed(2)}` },
                    ]}
                    dataSource={data.topCustomers || []}
                    pagination={false}
                    locale={{
                      emptyText: <div style={{ padding: "40px 0", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>No paid orders in this window yet.</div>
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </motion.div>
    );
  };

  const ORDER_STATUS_COLORS = {
    Pending: { bg: "rgba(245, 158, 11, 0.12)", fg: "#b45309" },
    Paid: { bg: "rgba(59, 130, 246, 0.12)", fg: "#1d4ed8" },
    Shipped: { bg: "rgba(139, 92, 246, 0.12)", fg: "#6d28d9" },
    Delivered: { bg: "rgba(16, 185, 129, 0.12)", fg: "var(--accent-success)" },
    Cancelled: { bg: "rgba(239, 68, 68, 0.12)", fg: "#dc2626" },
  };

  const renderOrders = () => {
    const columns = [
      {
        title: "ORDER",
        key: "order",
        render: (_, r) => (
          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {r.orderNumber || `#${String(r._id).slice(-6).toUpperCase()}`}
          </div>
        ),
      },
      {
        title: "CUSTOMER",
        key: "customer",
        render: (_, r) => (
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {r.customer ? [r.customer.firstName, r.customer.lastName].filter(Boolean).join(" ") || "—" : "Guest"}
            </div>
            {r.customer?.email && (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>{r.customer.email}</div>
            )}
          </div>
        ),
      },
      {
        title: "ITEMS",
        key: "items",
        render: (_, r) => (
          <Text type="secondary" style={{ fontWeight: 600 }}>
            {(r.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0)}
          </Text>
        ),
      },
      {
        title: "TOTAL",
        key: "total",
        render: (_, r) => (
          <Text style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {r.currency || "USD"} {Number(r.total || 0).toFixed(2)}
          </Text>
        ),
      },
      {
        title: "STATUS",
        key: "status",
        render: (_, r) => {
          const colors = ORDER_STATUS_COLORS[r.status] || ORDER_STATUS_COLORS.Pending;
          return (
            <Select
              value={r.status || "Pending"}
              onChange={(value) => handleOrderStatusChange(r, value)}
              loading={updatingOrderId === r._id}
              disabled={updatingOrderId === r._id}
              variant="borderless"
              style={{
                minWidth: 130,
                background: colors.bg,
                borderRadius: 8,
                fontWeight: 700,
              }}
              popupMatchSelectWidth={false}
              options={ORDER_STATUSES.map((s) => ({
                value: s,
                label: (
                  <span style={{ color: ORDER_STATUS_COLORS[s].fg, fontWeight: 700 }}>{s}</span>
                ),
              }))}
              labelRender={() => <span style={{ color: colors.fg, fontWeight: 700 }}>{r.status || "Pending"}</span>}
            />
          );
        },
      },
      {
        title: "DATE",
        key: "date",
        render: (_, r) => (
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
          </Text>
        ),
      },
      {
        title: "ACTIONS",
        key: "actions",
        render: (_, r) => (
          <Popconfirm title="Delete this order?" onConfirm={() => handleDeleteOrder(r)} okText="Delete" okButtonProps={{ danger: true }}>
            <Button danger icon={<Trash2 size={14} />} style={{ borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", border: "none" }} />
          </Popconfirm>
        ),
      },
    ];

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        {!storeId ? (
          <Card bodyStyle={{ padding: 48, textAlign: "center" }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              This store isn't linked to a backend record, so orders can't be managed yet. Create a new store to try the Orders module.
            </Text>
          </Card>
        ) : (
          <>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
              <Select
                allowClear
                placeholder="Filter by status"
                value={orderStatusFilter || undefined}
                onChange={(value) => setOrderStatusFilter(value || null)}
                style={{ width: 200 }}
                options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
              {ordersLoading ? (
                <div style={{ padding: 60, textAlign: "center" }}>
                  <Spin />
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={orders}
                  rowKey="_id"
                  pagination={false}
                  size="middle"
                  locale={{
                    emptyText: (
                      <div style={{ padding: "60px 0", textAlign: "center" }}>
                        <Empty description="No orders yet" />
                      </div>
                    ),
                  }}
                />
              )}
            </Card>
          </>
        )}
      </motion.div>
    );
  };

  const renderCollections = () => {
    const columns = [
      {
        title: "COLLECTION",
        key: "title",
        render: (_, r) => (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "var(--bg-primary)", border: "1px solid var(--border-color)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {r.imageUrl ? (
                <img
                  src={optimizeStoreImageUrl(r.imageUrl, "thumbnail")}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <LayoutGrid size={16} color="var(--text-tertiary)" />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>{r.slug}</div>
            </div>
          </div>
        ),
      },
      {
        title: "PRODUCTS",
        key: "products",
        render: (_, r) => (
          <Text type="secondary" style={{ fontWeight: 600 }}>
            {r.productCount ?? r.productIds?.length ?? 0} linked
          </Text>
        ),
      },
      {
        title: "ACTIVE",
        key: "active",
        render: (_, r) => (
          <Tag style={{ background: r.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.15)", color: r.isActive ? "var(--accent-success)" : "var(--text-tertiary)", border: "none", fontWeight: 700, borderRadius: 6 }}>
            {r.isActive ? "Yes" : "No"}
          </Tag>
        ),
      },
      {
        title: "ACTIONS",
        key: "actions",
        render: (_, r) => (
          <Space>
            <Button icon={<Edit3 size={14} />} onClick={() => openEditCollection(r)} style={{ borderRadius: 8, fontWeight: 600, borderColor: "var(--border-color)", color: "var(--text-primary)", background: "var(--bg-secondary)" }}>
              Edit
            </Button>
            <Popconfirm title="Delete this collection?" onConfirm={() => handleDeleteCollection(r)} okText="Delete" okButtonProps={{ danger: true }}>
              <Button danger icon={<Trash2 size={14} />} style={{ borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", border: "none" }} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        {!storeId ? (
          <Card bodyStyle={{ padding: 48, textAlign: "center" }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              This store isn't linked to a backend record, so collections can't be managed yet. Create a new store to try the Collections module.
            </Text>
          </Card>
        ) : (
          <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            {collectionsLoading ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <Spin />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={collections}
                rowKey="_id"
                pagination={false}
                size="middle"
                locale={{
                  emptyText: (
                    <div style={{ padding: "60px 0", textAlign: "center" }}>
                      <Empty description="No collections yet" />
                      <Button type="primary" icon={<Plus size={16} />} onClick={openCreateCollection} style={{ marginTop: 16, background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}>
                        Add your first collection
                      </Button>
                    </div>
                  ),
                }}
              />
            )}
          </Card>
        )}

        <CollectionFormModal
          open={isCollectionModalOpen}
          onCancel={() => { setIsCollectionModalOpen(false); setEditingCollection(null); }}
          onSaved={handleCollectionSaved}
          storeId={storeId}
          collection={editingCollection}
        />
      </motion.div>
    );
  };

  const renderCustomers = () => {
    const columns = [
      {
        title: "CUSTOMER",
        key: "customer",
        render: (_, r) => (
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>{r.email || "No email"}</div>
          </div>
        ),
      },
      {
        title: "ORDERS",
        dataIndex: "ordersCount",
        key: "orders",
        render: (t) => <Text type="secondary" style={{ fontWeight: 600 }}>{t ?? 0}</Text>,
      },
      {
        title: "LIFETIME",
        dataIndex: "totalSpent",
        key: "lifetime",
        render: (t) => <Text style={{ fontWeight: 700, color: "var(--text-primary)" }}>{Number(t || 0).toFixed(2)}</Text>,
      },
      {
        title: "TAGS",
        key: "tags",
        render: (_, r) =>
          r.tags?.length ? (
            <Space size={4} wrap>
              {r.tags.map((t) => (
                <Tag key={t} style={{ borderRadius: 6, fontWeight: 600 }}>{t}</Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
          ),
      },
      {
        title: "ACTIONS",
        key: "actions",
        render: (_, r) => (
          <Space>
            <Button icon={<Edit3 size={14} />} onClick={() => openEditCustomer(r)} style={{ borderRadius: 8, fontWeight: 600, borderColor: "var(--border-color)", color: "var(--text-primary)", background: "var(--bg-secondary)" }}>
              Edit
            </Button>
            <Popconfirm title="Delete this customer?" onConfirm={() => handleDeleteCustomer(r)} okText="Delete" okButtonProps={{ danger: true }}>
              <Button danger icon={<Trash2 size={14} />} style={{ borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", border: "none" }} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        {!storeId ? (
          <Card bodyStyle={{ padding: 48, textAlign: "center" }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              This store isn't linked to a backend record, so customers can't be managed yet. Create a new store to try the Customer module.
            </Text>
          </Card>
        ) : (
          <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            {customersLoading ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <Spin />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={customers}
                rowKey="_id"
                pagination={false}
                size="middle"
                locale={{
                  emptyText: (
                    <div style={{ padding: "60px 0", textAlign: "center" }}>
                      <Empty description="No customers yet" />
                      <Button type="primary" icon={<Plus size={16} />} onClick={openCreateCustomer} style={{ marginTop: 16, background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}>
                        Add your first customer
                      </Button>
                    </div>
                  ),
                }}
              />
            )}
          </Card>
        )}

        <CustomerFormModal
          open={isCustomerModalOpen}
          onCancel={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }}
          onSaved={handleCustomerSaved}
          storeId={storeId}
          customer={editingCustomer}
        />
      </motion.div>
    );
  };

  const renderDiscounts = () => {
    const columns = [
      {
        title: "COUPON",
        dataIndex: "code",
        key: "code",
        render: (t) => <Tag color="blue" style={{ fontWeight: 800, fontSize: 13, padding: "4px 8px", borderRadius: 6 }}>{t}</Tag>,
      },
      {
        title: "TYPE",
        key: "type",
        render: (_, r) => <Text type="secondary" style={{ fontWeight: 600 }}>{r.type === "Flat" ? "Flat amount" : r.type === "FreeShipping" ? "Free shipping" : "Percentage"}</Text>,
      },
      {
        title: "VALUE",
        key: "value",
        render: (_, r) => (
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {r.type === "Percentage" ? `${r.value || 0}%` : r.type === "Flat" ? `${activeStore?.currency || "USD"} ${Number(r.value || 0).toFixed(2)}` : "—"}
          </span>
        ),
      },
      {
        title: "MIN. ORDER",
        key: "minOrderAmount",
        render: (_, r) => (
          <Text type="secondary" style={{ fontWeight: 600 }}>
            {r.minOrderAmount ? `${activeStore?.currency || "USD"} ${Number(r.minOrderAmount).toFixed(2)}` : "—"}
          </Text>
        ),
      },
      {
        title: "EXPIRY",
        key: "endsAt",
        render: (_, r) => (
          <Text type="secondary" style={{ fontWeight: 600 }}>
            {r.endsAt ? new Date(r.endsAt).toLocaleDateString() : "No expiry"}
          </Text>
        ),
      },
      {
        title: "USES",
        dataIndex: "usedCount",
        key: "uses",
        render: (t) => <Text type="secondary" style={{ fontWeight: 500 }}>{t ?? 0}</Text>,
      },
      {
        title: "ACTIVE",
        key: "active",
        render: (_, r) => (
          <Tag style={{ background: r.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.15)", color: r.isActive ? "var(--accent-success)" : "var(--text-tertiary)", border: "none", fontWeight: 700, borderRadius: 6 }}>
            {r.isActive ? "Yes" : "No"}
          </Tag>
        ),
      },
      {
        title: "ACTIONS",
        key: "actions",
        render: (_, r) => (
          <Space>
            <Button icon={<Edit3 size={14} />} onClick={() => openEditDiscount(r)} style={{ borderRadius: 8, fontWeight: 600, borderColor: "var(--border-color)", color: "var(--text-primary)", background: "var(--bg-secondary)" }}>
              Edit
            </Button>
            <Popconfirm title="Delete this discount?" onConfirm={() => handleDeleteDiscount(r)} okText="Delete" okButtonProps={{ danger: true }}>
              <Button danger icon={<Trash2 size={14} />} style={{ borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", border: "none" }} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        {!storeId ? (
          <Card bodyStyle={{ padding: 48, textAlign: "center" }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              This store isn't linked to a backend record, so discounts can't be managed yet. Create a new store to try the Discounts module.
            </Text>
          </Card>
        ) : (
          <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            {discountsLoading ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <Spin />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={discounts}
                rowKey="_id"
                pagination={false}
                size="middle"
                locale={{
                  emptyText: (
                    <div style={{ padding: "60px 0", textAlign: "center" }}>
                      <Empty description="No discounts yet" />
                      <Button type="primary" icon={<Plus size={16} />} onClick={openCreateDiscount} style={{ marginTop: 16, background: "var(--accent-success)", border: "none", borderRadius: 8, fontWeight: 700 }}>
                        Add your first discount
                      </Button>
                    </div>
                  ),
                }}
              />
            )}
          </Card>
        )}

        <DiscountFormModal
          open={isDiscountModalOpen}
          onCancel={() => { setIsDiscountModalOpen(false); setEditingDiscount(null); }}
          onSaved={handleDiscountSaved}
          storeId={storeId}
          discount={editingDiscount}
        />
      </motion.div>
    );
  };

  const renderGeneral = () => (
    <motion.div variants={itemVariants} className="store-manage-content" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 800 }}>
        <Card style={{ borderRadius: 16, border: "1px solid var(--border-color)", marginBottom: 24, background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 40 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 32, color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={20} color="var(--text-tertiary)" /> General Settings
          </Title>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Name</div>
            <Input defaultValue={activeStore.store} size="large" style={{ borderRadius: 8 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Slug</div>
            <Input defaultValue={activeStore.slug} size="large" style={{ borderRadius: 8 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Status</div>
            <Select defaultValue="Active" size="large" style={{ width: "100%" }}>
              <Option value="Active">Active</Option>
              <Option value="Draft">Draft</Option>
            </Select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Description</div>
            <TextArea defaultValue={`Parts, care & accessories. Shop DriveNest for curated Automotive products.`} size="large" style={{ borderRadius: 8, minHeight: 100 }} />
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Currency</div>
              <Input defaultValue={activeStore.currency || "INR"} size="large" style={{ borderRadius: 8 }} />
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Contact email</div>
              <Input size="large" style={{ borderRadius: 8 }} />
            </Col>
          </Row>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>SEO title</div>
            <Input defaultValue={`${activeStore.store} — Automotive`} size="large" style={{ borderRadius: 8 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>SEO description</div>
            <TextArea size="large" style={{ borderRadius: 8, minHeight: 100 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>OG Image URL</div>
            <Input size="large" style={{ borderRadius: 8 }} prefix={<ImageIcon size={16} color="var(--text-tertiary)" />} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Favicon URL</div>
            <Input placeholder="https://example.com/favicon.png" size="large" style={{ borderRadius: 8 }} />
          </div>

          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Upload favicon</div>
            <div style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", background: 'var(--bg-primary)' }}>
              <Button style={{ marginRight: 16, background: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)", fontWeight: 600, borderRadius: 6 }}>Choose File</Button>
              <span style={{ fontSize: 14, color: "var(--text-tertiary)", fontWeight: 500 }}>No file chosen</span>
            </div>
          </div>

          <Card bodyStyle={{ padding: 32 }} style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 12, marginBottom: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Tracking pixels</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, fontWeight: 500 }}>Injected on every public page for this store.</div>

            <Row gutter={24} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>META PIXEL ID</div>
                <Input placeholder="123456789012345" size="large" style={{ borderRadius: 8 }} />
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>GA4 ID</div>
                <Input placeholder="G-XXXXXXXXXX" size="large" style={{ borderRadius: 8 }} />
              </Col>
            </Row>

            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>GTM ID</div>
                <Input placeholder="GTM-XXXXXXX" size="large" style={{ borderRadius: 8 }} />
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>TIKTOK PIXEL ID</div>
                <Input placeholder="CXX000000000000X" size="large" style={{ borderRadius: 8 }} />
              </Col>
            </Row>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>CUSTOM HEAD CODE</div>
              <TextArea placeholder="<script>...</script> placed before </head>" size="large" style={{ borderRadius: 8, minHeight: 100, fontFamily: "monospace", fontSize: 13 }} />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>CUSTOM BODY CODE</div>
              <TextArea placeholder="<noscript>...</noscript> placed after <body>" size="large" style={{ borderRadius: 8, minHeight: 100, fontFamily: "monospace", fontSize: 13 }} />
            </div>
          </Card>

          <Card bodyStyle={{ padding: 32 }} style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 12, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Frontend design</div>
              <Button type="text" style={{ color: "var(--accent-info)", fontWeight: 700, padding: 0 }} icon={<ExternalLink size={16} />}>Open store page in Website Builder</Button>
            </div>

            <Row gutter={24}>
              <Col span={8}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Theme accent</div>
                <div style={{ height: 44, background: "#1f2937", borderRadius: 8, border: "2px solid var(--border-color)", cursor: "pointer" }}></div>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Store layout</div>
                <Select defaultValue="Minimal" size="large" style={{ width: "100%" }}>
                  <Option value="Minimal">Minimal</Option>
                </Select>
              </Col>
              <Col span={8}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Logo style</div>
                <Select defaultValue="Wordmark" size="large" style={{ width: "100%" }}>
                  <Option value="Wordmark">Wordmark</Option>
                </Select>
              </Col>
            </Row>
            <div style={{ color: "var(--text-tertiary)", fontSize: 13, marginTop: 16, fontWeight: 500 }}>
              Save changes, then refresh your storefront preview to see the updated design.
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: 'space-between', alignItems: "center" }}>
            <Button type="primary" style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 800, height: 48, padding: "0 40px", fontSize: 16 }}>
              Save Settings
            </Button>

            <Popconfirm title="Are you absolutely sure you want to delete this store?" placement="topLeft">
              <Button danger style={{ borderRadius: 8, fontWeight: 700, height: 40, padding: "0 24px", background: "rgba(239, 68, 68, 0.1)", border: "none" }}>
                Delete store
              </Button>
            </Popconfirm>
          </div>

        </Card>
      </div>
    </motion.div>
  );

  const renderPaymentMethodCard = ({ method, icon, description, fields }) => {
    const draft = paymentDrafts[method] || {};
    const isEnabled = !!draft.enabled;
    const isSaving = savingMethod === method;

    return (
      <Card
        key={method}
        style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)', marginBottom: 20 }}
        bodyStyle={{ padding: 28 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: isEnabled ? 24 : 0 }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                {PAYMENT_METHOD_LABELS[method]}
                {isEnabled && <Tag color="success" style={{ margin: 0, fontWeight: 700, borderRadius: 6 }}>Active</Tag>}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500, marginTop: 2 }}>{description}</div>
            </div>
          </div>
          <Switch checked={isEnabled} loading={isSaving} onChange={(checked) => toggleMethod(method, checked)} />
        </div>

        {isEnabled && (
          <>
            <Row gutter={16}>
              {fields.map((f) => (
                <Col span={f.span || 12} key={f.key} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{f.label}</div>
                  {f.type === "select" ? (
                    <Select
                      size="large"
                      style={{ width: "100%" }}
                      value={draft[f.key] ?? f.options[0]}
                      onChange={(v) => updatePaymentDraft(method, f.key, v)}
                    >
                      {f.options.map((opt) => (
                        <Option value={opt} key={opt}>{opt}</Option>
                      ))}
                    </Select>
                  ) : f.type === "number" ? (
                    <InputNumber
                      size="large"
                      style={{ width: "100%", borderRadius: 8 }}
                      min={0}
                      value={draft[f.key] ?? 0}
                      onChange={(v) => updatePaymentDraft(method, f.key, v)}
                    />
                  ) : f.type === "textarea" ? (
                    <TextArea
                      size="large"
                      style={{ borderRadius: 8, minHeight: 80 }}
                      value={draft[f.key] ?? ""}
                      onChange={(e) => updatePaymentDraft(method, f.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      size="large"
                      style={{ borderRadius: 8 }}
                      type={f.secret ? "password" : "text"}
                      placeholder={f.placeholder}
                      value={draft[f.key] ?? ""}
                      onChange={(e) => updatePaymentDraft(method, f.key, e.target.value)}
                    />
                  )}
                </Col>
              ))}
            </Row>
            <Button
              type="primary"
              loading={isSaving}
              style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 800, height: 44, padding: "0 32px" }}
              onClick={() => saveMethod(method)}
            >
              Save {PAYMENT_METHOD_LABELS[method]} settings
            </Button>
          </>
        )}
      </Card>
    );
  };

  const renderPayments = () => {
    const enabledCount = PAYMENT_METHODS.filter((m) => paymentDrafts[m]?.enabled).length;

    return (
      <motion.div variants={itemVariants} className="store-manage-content" style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 800 }}>

          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CreditCard size={22} color="var(--text-tertiary)" /> Payments
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, fontWeight: 500, lineHeight: 1.6 }}>
            Turn on any combination of gateways below — customers will choose between whichever ones are active at checkout.
          </div>

          {!storeId ? (
            <div style={{ padding: "20px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--accent-warning)', lineHeight: 1.6 }}>
              This store isn't linked to a backend record, so payment methods can't be managed yet. Create a new store to try the Payments module.
            </div>
          ) : paymentsLoading ? (
            <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>
          ) : (
            <>
              {enabledCount === 0 && (
                <div style={{ padding: "20px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 24, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--accent-warning)', lineHeight: 1.6 }}>
                  No payment method is enabled yet. Customers won't be able to check out until at least one is turned on.
                </div>
              )}

              {renderPaymentMethodCard({
                method: "razorpay",
                icon: <Wallet size={20} color="var(--accent-primary)" />,
                description: "Cards, UPI, netbanking and wallets for India.",
                fields: [
                  { key: "mode", label: "Mode", type: "select", options: ["Test", "Live"], span: 24 },
                  { key: "keyId", label: "Key ID", placeholder: "rzp_test_xxxxxxxxxxxx" },
                  { key: "keySecret", label: "Key Secret", placeholder: "••••••••••••", secret: true },
                ],
              })}

              {renderPaymentMethodCard({
                method: "stripe",
                icon: <CreditCard size={20} color="var(--accent-primary)" />,
                description: "Cards and wallets, worldwide.",
                fields: [
                  { key: "mode", label: "Mode", type: "select", options: ["Test", "Live"], span: 24 },
                  { key: "publishableKey", label: "Publishable Key", placeholder: "pk_test_xxxxxxxxxxxx" },
                  { key: "secretKey", label: "Secret Key", placeholder: "••••••••••••", secret: true },
                ],
              })}

              {renderPaymentMethodCard({
                method: "paypal",
                icon: <Landmark size={20} color="var(--accent-primary)" />,
                description: "PayPal balance, cards, and Pay Later.",
                fields: [
                  { key: "mode", label: "Mode", type: "select", options: ["Sandbox", "Live"], span: 24 },
                  { key: "clientId", label: "Client ID", placeholder: "AeA1QIZXiflr1_-13f..." },
                  { key: "clientSecret", label: "Client Secret", placeholder: "••••••••••••", secret: true },
                ],
              })}

              {renderPaymentMethodCard({
                method: "cod",
                icon: <Banknote size={20} color="var(--accent-primary)" />,
                description: "Customer pays with cash when the order is delivered.",
                fields: [
                  { key: "instructions", label: "Instructions shown at checkout", type: "textarea", span: 24 },
                  { key: "extraFee", label: "Extra COD fee", type: "number", span: 12 },
                ],
              })}
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const emailSectionTabs = [
    { key: "smtp", label: "SMTP", icon: <Server size={15} /> },
    { key: "templates", label: "Templates", icon: <FileText size={15} /> },
    { key: "orderMail", label: "Order Mail", icon: <Package size={15} /> },
    { key: "welcomeMail", label: "Welcome Mail", icon: <Gift size={15} /> },
  ];

  const renderEmailSectionNav = () => (
    <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
      {emailSectionTabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setEmailSection(t.key)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13,
            cursor: "pointer", border: emailSection === t.key ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
            background: emailSection === t.key ? "rgba(59, 130, 246, 0.1)" : "var(--bg-secondary)",
            color: emailSection === t.key ? "var(--accent-primary)" : "var(--text-secondary)",
          }}
        >
          {t.icon} {t.label}
        </button>
      ))}
    </div>
  );

  const renderEmailSmtpSection = () => (
    <>
      <Card style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)', marginBottom: 20 }} bodyStyle={{ padding: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Sender identity</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 24, fontWeight: 500, lineHeight: 1.6 }}>
          Override the From name and address for emails sent by this store. Leave off to use your agency's default sender.
        </div>

        <div style={{ marginBottom: 24, padding: '16px 20px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <Checkbox
            checked={!!senderDraft.useCustomSender}
            onChange={(e) => updateSenderDraft("useCustomSender", e.target.checked)}
            style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}
          >
            Use custom sender for this store
          </Checkbox>
        </div>

        <Row gutter={16}>
          <Col span={12} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>From name</div>
            <Input size="large" style={{ borderRadius: 8 }} value={senderDraft.senderName || ""} onChange={(e) => updateSenderDraft("senderName", e.target.value)} placeholder={activeStore?.slug || activeStore?.name} />
          </Col>
          <Col span={12} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>From email</div>
            <Input size="large" style={{ borderRadius: 8 }} value={senderDraft.senderEmail || ""} onChange={(e) => updateSenderDraft("senderEmail", e.target.value)} placeholder="orders@yourstore.com" />
          </Col>
          <Col span={24} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Reply-to (optional)</div>
            <Input size="large" style={{ borderRadius: 8 }} value={senderDraft.replyToEmail || ""} onChange={(e) => updateSenderDraft("replyToEmail", e.target.value)} placeholder="support@yourstore.com" />
          </Col>
        </Row>

        <Button type="primary" loading={savingSender} style={{ background: "var(--accent-primary)", border: 'none', borderRadius: 8, fontWeight: 800, height: 44, padding: "0 32px", marginTop: 8 }} onClick={saveSender}>
          Save sender identity
        </Button>
      </Card>

      <Card style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: "flex", alignItems: "center", gap: 10 }}>
            <Server size={18} color="var(--text-tertiary)" /> SMTP connection
          </div>
          <Switch checked={!!smtpDraft.isCustom} loading={savingSmtp} onChange={(checked) => saveSmtp({ isCustom: checked })} />
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: smtpDraft.isCustom ? 24 : 0, fontWeight: 500, lineHeight: 1.6 }}>
          Turn on to send this store's mail through your own SMTP server instead of the agency default.
        </div>

        {smtpDraft.isCustom && (
          <>
            <Row gutter={16}>
              <Col span={16} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Host</div>
                <Input size="large" style={{ borderRadius: 8 }} value={smtpDraft.host || ""} onChange={(e) => updateSmtpDraft("host", e.target.value)} placeholder="smtp.yourprovider.com" />
              </Col>
              <Col span={8} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Port</div>
                <InputNumber size="large" style={{ width: "100%", borderRadius: 8 }} value={smtpDraft.port ?? 587} onChange={(v) => updateSmtpDraft("port", v)} />
              </Col>
              <Col span={12} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Username</div>
                <Input size="large" style={{ borderRadius: 8 }} value={smtpDraft.username || ""} onChange={(e) => updateSmtpDraft("username", e.target.value)} />
              </Col>
              <Col span={12} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Password</div>
                <Input type="password" size="large" style={{ borderRadius: 8 }} value={smtpDraft.password || ""} onChange={(e) => updateSmtpDraft("password", e.target.value)} placeholder="••••••••••••" />
              </Col>
            </Row>
            <Checkbox checked={smtpDraft.useSSL !== false} onChange={(e) => updateSmtpDraft("useSSL", e.target.checked)} style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 20 }}>
              Use SSL/TLS
            </Checkbox>
            <br />
            <Button type="primary" loading={savingSmtp} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 800, height: 44, padding: "0 32px" }} onClick={() => saveSmtp()}>
              Save SMTP settings
            </Button>
          </>
        )}
      </Card>
    </>
  );

  const renderEmailTemplateFields = (type, { autoExpanded = false } = {}) => {
    const draft = templateDrafts[type] || {};
    const isSaving = savingTemplate === type;
    return (
      <>
        <Row gutter={16}>
          <Col span={24} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Subject</div>
            <Input size="large" style={{ borderRadius: 8 }} value={draft.subject || ""} onChange={(e) => updateTemplateDraft(type, "subject", e.target.value)} />
          </Col>
          <Col span={24} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Body</div>
            <TextArea style={{ borderRadius: 8, minHeight: 160, fontFamily: "monospace", fontSize: 13 }} value={draft.body || ""} onChange={(e) => updateTemplateDraft(type, "body", e.target.value)} />
          </Col>
          <Col span={24} style={{ marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>{EMAIL_VARIABLE_HINT}</Text>
          </Col>
        </Row>
        <Button type="primary" loading={isSaving} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 800, height: 44, padding: "0 32px" }} onClick={() => saveTemplate(type)}>
          Save {EMAIL_TEMPLATE_META[type].label} template
        </Button>
      </>
    );
  };

  const renderFocusedTemplateCard = (type, icon) => {
    const draft = templateDrafts[type] || {};
    const isEnabled = !!draft.enabled;
    return (
      <Card style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 32 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                {EMAIL_TEMPLATE_META[type].label}
                {isEnabled && <Tag color="success" style={{ margin: 0, fontWeight: 700, borderRadius: 6 }}>Active</Tag>}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500, marginTop: 2 }}>{EMAIL_TEMPLATE_META[type].description}</div>
            </div>
          </div>
          <Switch checked={isEnabled} loading={savingTemplate === type} onChange={(checked) => toggleTemplate(type, checked)} />
        </div>
        {renderEmailTemplateFields(type)}
      </Card>
    );
  };

  const renderEmailTemplatesGallery = () => (
    <div>
      {EMAIL_TEMPLATE_TYPES.map((type) => {
        const draft = templateDrafts[type] || {};
        const isOpen = expandedTemplate === type;
        return (
          <Card key={type} style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)', marginBottom: 16 }} bodyStyle={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setExpandedTemplate(isOpen ? null : type)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {isOpen ? <ChevronDown size={16} color="var(--text-tertiary)" /> : <ChevronRight size={16} color="var(--text-tertiary)" />}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', display: "flex", alignItems: "center", gap: 10 }}>
                    {EMAIL_TEMPLATE_META[type].label}
                    {draft.enabled && <Tag color="success" style={{ margin: 0, fontWeight: 700, borderRadius: 6 }}>Active</Tag>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500, marginTop: 2 }}>{draft.subject || EMAIL_TEMPLATE_META[type].description}</div>
                </div>
              </div>
              <Switch checked={!!draft.enabled} loading={savingTemplate === type} onClick={(checked, e) => e.stopPropagation()} onChange={(checked) => toggleTemplate(type, checked)} />
            </div>

            {isOpen && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border-color)" }}>
                {renderEmailTemplateFields(type)}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );

  const renderEmail = () => (
    <motion.div variants={itemVariants} className="store-manage-content" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 800 }}>

        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mail size={22} color="var(--text-tertiary)" /> Email Sender
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, fontWeight: 500, lineHeight: 1.6 }}>
          Configure how this store sends mail, and customize what customers receive at each step.
        </div>

        {!storeId ? (
          <div style={{ padding: "20px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--accent-warning)', lineHeight: 1.6 }}>
            This store isn't linked to a backend record, so email settings can't be managed yet. Create a new store to try the Email Sender module.
          </div>
        ) : (
          <>
            {renderEmailSectionNav()}
            {emailLoading ? (
              <div style={{ textAlign: "center", padding: 60 }}><Spin /></div>
            ) : (
              <>
                {emailSection === "smtp" && renderEmailSmtpSection()}
                {emailSection === "templates" && renderEmailTemplatesGallery()}
                {emailSection === "orderMail" && renderFocusedTemplateCard("orderConfirmation", <Package size={20} color="var(--accent-primary)" />)}
                {emailSection === "welcomeMail" && renderFocusedTemplateCard("welcome", <Gift size={20} color="var(--accent-primary)" />)}
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );

  const renderManageContent = () => {
    switch (activeSubTab) {
      case "home": return renderHome();
      case "analytics": return renderAnalytics();
      case "orders": return renderOrders();
      case "products": return renderProducts();
      case "collections": return renderCollections();
      case "customers": return renderCustomers();
      case "discounts": return renderDiscounts();
      case "website_pages": return renderWebsitePages();
      case "shipping": return renderShipping();
      case "general": return renderGeneral();
      case "payments": return renderPayments();
      case "email": return renderEmail();
      default: return (
        <div style={{ padding: 100, textAlign: "center", color: "var(--text-tertiary)", fontSize: 16, fontWeight: 600 }}>
          Module {activeSubTab} coming soon.
        </div>
      );
    }
  };

  const navItems = [
    { key: "home", label: "Home", icon: <Store size={16} /> },
    { key: "analytics", label: "Analytics", icon: <Activity size={16} /> },
    { key: "orders", label: "Orders", icon: <Truck size={16} /> },
    { key: "products", label: "Products", icon: <ShoppingBag size={16} /> },
    { key: "collections", label: "Collections", icon: <LayoutGrid size={16} /> },
    { key: "customers", label: "Customers", icon: <Users size={16} /> },
    { key: "discounts", label: "Discounts", icon: <TagIcon size={16} /> },
    { key: "website_pages", label: "Website pages", icon: <LayoutTemplate size={16} /> },
    { key: "shipping", label: "Shipping & policies", icon: <Truck size={16} /> },
    { key: "general", label: "General", icon: <Settings size={16} /> },
    { key: "payments", label: "Payments", icon: <CreditCard size={16} /> },
    { key: "email", label: "Email sender", icon: <Mail size={16} /> },
  ];

  const getActionBtn = () => {
    switch (activeSubTab) {
      case "products": return <Button type="primary" icon={<Plus size={16} />} onClick={openCreateProduct} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700 }}>Product</Button>;
      case "collections": return <Button type="primary" icon={<Plus size={16} />} onClick={openCreateCollection} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700 }}>Collection</Button>;
      case "customers": return <Button type="primary" icon={<Plus size={16} />} onClick={openCreateCustomer} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700 }}>Customer</Button>;
      case "discounts": return <Button type="primary" icon={<Plus size={16} />} onClick={openCreateDiscount} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700 }}>Discount</Button>;
      default: return null;
    }
  };

  return (
    <motion.div variants={itemVariants} className="glassmorphism" style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      {/* Top Bar Header */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", display: 'flex', alignItems: 'center', gap: 12 }}>
          {navItems.find(i => i.key === activeSubTab)?.icon}
          {navItems.find(i => i.key === activeSubTab)?.label} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>|</span> {activeStore.slug}
        </div>
        <Space size="large">
          <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => { setView("list"); navigate('/workspace/website/stores', { relative: 'path' }); }}>
            <LayoutGrid size={16} /> All stores
          </div>
          {getActionBtn()}
        </Space>
      </div>

      <div style={{ padding: "32px" }}>
        {/* Main Store Header Card */}
        <Card bodyStyle={{ padding: "24px 32px" }} style={{ borderRadius: 16, marginBottom: 32, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent-success)", letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Store size={14} /> ONLINE STORE</div>
              <Title level={2} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 900 }}>{activeStore.slug}</Title>
            </div>
            <Button
              type="primary"
              style={{ background: 'var(--accent-success)', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 24px', height: 40, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => setIsPreviewOpen(true)}
            >
              View storefront <ExternalLink size={16} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', borderBottom: '2px solid var(--border-color)', paddingBottom: 0 }}>
            {navItems.map(item => (
              <div
                key={item.key}
                onClick={() => setActiveSubTab(item.key)}
                style={{
                  padding: '12px 0',
                  color: activeSubTab === item.key ? 'var(--accent-success)' : 'var(--text-secondary)',
                  fontWeight: activeSubTab === item.key ? 800 : 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  borderBottom: activeSubTab === item.key ? '3px solid var(--accent-success)' : '3px solid transparent',
                  marginBottom: -2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
              >
                {item.icon} {item.label}
              </div>
            ))}
          </div>
        </Card>

        {renderManageContent()}
      </div>

      <StorePreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        storeId={storeId}
        storeSlug={activeStore.slug}
      />

      <StorePublishModal
        open={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        storeId={storeId}
        storeSlug={activeStore.slug}
      />
    </motion.div>
  );
};

// Maps a raw Store document (as returned by GET /api/store) into the row
// shape the "All stores" table renders.
const mapStoreToRow = (store) => ({
  key: store._id,
  _id: store._id,
  store: store.storeName || store.name,
  slug: store.domain || (store.storeName || store.name || "").toLowerCase().replace(/\s+/g, "-"),
  status: store.status || "Draft",
  catalog: store.productCount ? `${store.productCount} product${store.productCount === 1 ? "" : "s"}` : "Empty Catalog",
  currency: store.currency || "USD",
});

const StoresTab = ({ itemVariants, initialStoreId }) => {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [activeStore, setActiveStore] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [tempStoreData, setTempStoreData] = useState(null);

  // Fetches every store from the backend (GET /api/store) and populates
  // the "All stores" table — replaces the old localStorage-only list so
  // stores created from any device/session show up here.
  const loadStores = async () => {
    setStoresLoading(true);
    try {
      const data = await storeApi.list();
      setStores((data || []).map(mapStoreToRow));
    } catch (err) {
      message.error(err.message || "Failed to load stores.");
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  // If a storeId was passed from the URL (via WebsiteBuilder.jsx reading
  // the wildcard sub-path), auto-enter the manage view for that store once
  // the list has loaded.
  useEffect(() => {
    if (!initialStoreId || stores.length === 0) return;
    const found = stores.find((s) => s._id === initialStoreId);
    if (found) {
      setActiveStore(found);
      setView('manage');
    }
  }, [initialStoreId, stores]);

  const handleDelete = (key) => {
    // No backend delete endpoint exists yet for stores — remove locally only.
    setStores(stores.filter(store => store.key !== key));
  };

  const columns = [
    {
      title: "STORE",
      dataIndex: "store",
      key: "store",
      render: (text) => <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: 15 }}>{text}</span>
    },
    {
      title: "SLUG",
      dataIndex: "slug",
      key: "slug",
      render: (text) => <Text type="secondary" style={{ fontWeight: 600 }}>{text}</Text>
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag style={{
          margin: 0,
          background: status === 'Published' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
          color: status === 'Published' ? 'var(--accent-success)' : 'var(--text-secondary)',
          border: 'none',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 700
        }}>
          {status}
        </Tag>
      )
    },
    {
      title: "CATALOG",
      dataIndex: "catalog",
      key: "catalog",
      render: (text) => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text>
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size="middle">
          <span
            style={{ color: "var(--accent-success)", fontWeight: 800, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              setActiveStore(record);
              setView("manage");
              // Push the storeId into the URL so this view survives a page refresh.
              navigate(`/workspace/website/stores/${record._id}`);
            }}
          >
            Manage <ArrowRight size={14} />
          </span>
          <Popconfirm title="Delete this store?" onConfirm={() => handleDelete(record.key)}>
            <Button type="text" danger icon={<Trash2 size={16} />} size="small" style={{ borderRadius: 6 }} />
          </Popconfirm>
        </Space>
      )
    },
  ];

  const handleCreateContinue = async (data) => {
    setTempStoreData(data);
    setIsCreateModalOpen(false);

    if (data.method === "templates") {
      setIsTemplateModalOpen(true);
    } else {
      try {
        await storeApi.createStore({
          storeName: data.storeName,
          currency: data.currency,
          status: data.status,
        });
        await loadStores();
      } catch (err) {
        message.error(err.message || "Failed to create store.");
      }
    }
  };

  const handleTemplateCreate = async (templateData) => {
    const backendStoreId = templateData?.store?._id;
    const newStore = {
      key: backendStoreId || Date.now().toString(),
      _id: backendStoreId,
      store: templateData.storeName,
      slug: templateData.storeName.toLowerCase().replace(/\s+/g, '-'),
      status: tempStoreData?.status || "Draft",
      catalog: templateData.template ? `Template: ${templateData.template}` : "Demo Catalog",
      currency: tempStoreData?.currency || "INR"
    };

    setIsTemplateModalOpen(false);
    setTempStoreData(null);

    // Refresh the full list from the backend so the new store's real
    // productCount/status/slug show up, then jump straight into managing it.
    await loadStores();
    setActiveStore(newStore);
    setView("manage");
  };

  if (view === "manage" && activeStore) {
    return <ManageStoreView activeStore={activeStore} setView={(v) => { setView(v); if (v === 'list') navigate('/workspace/website/stores'); }} itemVariants={itemVariants} />;
  }

  return (
    <motion.div variants={itemVariants}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={4} style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Store size={24} color="var(--accent-success)" /> Web Stores
          </Title>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
            Ecommerce catalogs, checkout, and orders. Pick a template to start with sample products.
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={18} />}
            style={{ backgroundColor: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700, height: 44, padding: '0 24px', boxShadow: 'var(--shadow-md)' }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New store
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={stores}
        loading={storesLoading}
        pagination={false}
        size="middle"
        rowKey="key"
        locale={{
          emptyText: (
            <div style={{ padding: "80px 0", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <ShoppingBag size={40} />
              </div>
              <Title level={4} style={{ marginBottom: 12, color: 'var(--text-primary)', fontWeight: 800 }}>No stores yet</Title>
              <div style={{ color: "var(--text-secondary)", fontSize: 15, fontWeight: 500, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                Click <strong style={{ color: "var(--text-primary)", fontWeight: 800 }}>+ New store</strong> and choose a template with sample products to get started quickly.
              </div>
              <Button type="primary" icon={<Plus size={18} />} onClick={() => setIsCreateModalOpen(true)} style={{ borderRadius: 8, height: 44, background: 'var(--accent-success)', border: 'none', fontWeight: 700, padding: '0 32px' }}>Create New Store</Button>
            </div>
          )
        }}
      />

      <CreateStoreModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onContinue={handleCreateContinue}
      />

      {isTemplateModalOpen && (
        <StoreTemplateLibraryModal
          open={isTemplateModalOpen}
          onCancel={() => setIsTemplateModalOpen(false)}
          onCreate={handleTemplateCreate}
          initialStoreName={tempStoreData?.storeName}
        />
      )}
    </motion.div>
  );
};

export default StoresTab;