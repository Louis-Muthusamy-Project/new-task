import React, { useState, useEffect } from "react";
import { 
  Button, Input, Radio, Table, Typography, Space, Modal, Card, 
  Select, Row, Col, Tag, message, Popconfirm, Form, Tooltip, Empty, Spin
} from "antd";
import { 
  FolderPlus, Plus, Search, CheckCircle2, ChevronRight, BarChart3, 
  Edit3, Eye, Trash2, Smartphone, Monitor, ArrowLeft, ArrowRight,
  TrendingUp, Users, DollarSign, Globe, Settings, FileText, Share2, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FunnelTemplateLibraryModal from "./FunnelTemplateLibraryModal";
import { funnelApi } from "../../../api/funnelApi";
import { storeApi, productApi } from "../../../api/storeApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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
const StepSettingsModal = ({ open, step, onCancel, onSave }) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("landing");
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

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
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ── MANAGE FUNNEL VIEW ───────────────────────────────────────────────────────
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

  // Settings tab states
  const [funnelName, setFunnelName] = useState(activeFunnel.name);
  const [funnelDomain, setFunnelDomain] = useState(activeFunnel.settings?.domain || "");
  const [metaPixel, setMetaPixel] = useState(activeFunnel.settings?.tracking?.metaPixelId || "");
  const [ga4Id, setGa4Id] = useState(activeFunnel.settings?.tracking?.ga4Id || "");
  const [gtmId, setGtmId] = useState(activeFunnel.settings?.tracking?.gtmId || "");

  useEffect(() => {
    loadSteps();
    loadAnalytics();
  }, [activeFunnel._id]);

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
      const res = await funnelApi.getAnalytics(activeFunnel._id);
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

  const handleSaveSettings = async () => {
    try {
      await funnelApi.update(activeFunnel._id, {
        name: funnelName,
        settings: {
          domain: funnelDomain,
          tracking: {
            metaPixelId: metaPixel,
            ga4Id,
            gtmId,
          }
        }
      });
      message.success("Funnel settings updated.");
    } catch (err) {
      message.error(err.message);
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
            <Row gutter={16} style={{ marginBottom: 24 }}>
              {[
                { label: "Total Views", val: analytics?.summary?.views || 0, icon: <Eye /> },
                { label: "Unique Visitors", val: analytics?.summary?.visitors || 0, icon: <Users /> },
                { label: "Conversions", val: analytics?.summary?.conversions || 0, icon: <CheckCircle2 /> },
                { label: "Conversion Rate", val: `${(analytics?.summary?.conversionRate || 0).toFixed(2)}%`, icon: <TrendingUp /> },
              ].map((kpi, i) => (
                <Col span={6} key={i}>
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
          <Card title="Funnel Settings & Customizations" style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 500 }}>
              <div>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Funnel Name</label>
                <Input value={funnelName} onChange={(e) => setFunnelName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Custom Domain</label>
                <Input value={funnelDomain} onChange={(e) => setFunnelDomain(e.target.value)} placeholder="e.g. sales.mybrand.com" />
              </div>
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

              <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                <Button type="primary" onClick={handleSaveSettings} style={{ background: "var(--accent-primary)", border: "none" }}>Save Settings</Button>
                <Popconfirm title="Delete this funnel?" onConfirm={handleDeleteFunnel}>
                  <Button danger>Delete Funnel</Button>
                </Popconfirm>
              </div>
            </div>
          </Card>
        )}
      </div>

      <StepSettingsModal 
        open={!!editingStep} 
        step={editingStep} 
        onCancel={() => setEditingStep(null)} 
        onSave={handleSaveStepSettings} 
      />
    </motion.div>
  );
};

// ── MAIN FUNNELS TAB ─────────────────────────────────────────────────────────
const FunnelsTab = ({ itemVariants }) => {
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFunnel, setActiveFunnel] = useState(null);
  const [view, setView] = useState("list");
  
  const [searchText, setSearchText] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [pendingFunnelName, setPendingFunnelName] = useState("");

  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    setLoading(true);
    try {
      const data = await funnelApi.list({ search: searchText || undefined });
      setFunnels(data || []);
    } catch (_) {
      message.error("Failed to load funnels list.");
    } finally {
      setLoading(false);
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

  const handleDuplicate = async (id) => {
    try {
      await funnelApi.duplicate(id);
      message.success("Funnel duplicated.");
      loadFunnels();
    } catch (_) {}
  };

  const handleDelete = async (id) => {
    try {
      await funnelApi.delete(id);
      message.success("Funnel deleted.");
      loadFunnels();
    } catch (_) {}
  };

  if (view === "manage" && activeFunnel) {
    return <ManageFunnelView activeFunnel={activeFunnel} setView={setView} itemVariants={itemVariants} />;
  }

  const columns = [
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
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Published" ? "green" : "orange"} style={{ borderRadius: 12, fontWeight: 700 }}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "STEPS",
      dataIndex: "stepCount",
      key: "stepCount",
      render: t => <strong style={{ color: 'var(--text-primary)' }}>{t || 0}</strong>
    },
    {
      title: "LAST UPDATED",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{new Date(t).toLocaleDateString()}</Text>
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (_, r) => (
        <Space size="middle">
          <span 
            style={{ color: "var(--accent-secondary)", fontWeight: 700, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => {
              setActiveFunnel(r);
              setView("manage");
            }}
          >
            Manage <ChevronRight size={14} />
          </span>
          <Tooltip title="Duplicate">
            <Button type="text" icon={<Copy size={14} />} onClick={() => handleDuplicate(r._id)} />
          </Tooltip>
          <Popconfirm title="Delete funnel?" onConfirm={() => handleDelete(r._id)}>
            <Button danger type="text" icon={<Trash2 size={14} />} />
          </Popconfirm>
        </Space>
      )
    },
  ];

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Input 
          placeholder="Search for Funnels" 
          prefix={<Search size={16} color="var(--text-tertiary)" />} 
          value={searchText} 
          onChange={(e) => setSearchText(e.target.value)} 
          onPressEnter={loadFunnels}
          style={{ width: 300, borderRadius: 8, height: 40 }} 
        />
        <Button onClick={loadFunnels}>Refresh</Button>
      </div>

      {loading ? (
        <div style={{ padding: 80, textAlign: "center" }}><Spin /></div>
      ) : (
        <Table
          columns={columns}
          dataSource={funnels}
          pagination={false}
          size="middle"
          rowKey="_id"
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
