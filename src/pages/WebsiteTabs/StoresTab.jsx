import React, { useState, useEffect } from "react";
import { Button, Table, Typography, Space, Popconfirm, Select, Card, Input, Row, Col, Checkbox, Tag } from "antd";
import { Plus, Trash2, Store, ShoppingBag, LayoutGrid, Users, Tag as TagIcon, LayoutTemplate, Truck, Settings, CreditCard, Mail, Search, ExternalLink, Activity, ArrowRight, Eye, Edit3, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import CreateStoreModal from "./CreateStoreModal";
import StoreTemplateLibraryModal from "./StoreTemplateLibraryModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ManageStoreView = ({ activeStore, setView, itemVariants }) => {
  const [activeSubTab, setActiveSubTab] = useState("home");

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
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>6</div>
                <div style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>Manage <ArrowRight size={14} /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><LayoutGrid size={14} /> COLLECTIONS</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>3</div>
                <div style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>Manage <ArrowRight size={14} /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> ORDERS</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>0</div>
                <div style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>View <ArrowRight size={14} /></div>
              </Card>
            </Col>
            <Col span={6}>
              <Card bodyStyle={{ padding: 20 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><TagIcon size={14} /> DISCOUNTS</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>1</div>
                <div style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>Manage <ArrowRight size={14} /></div>
              </Card>
            </Col>

            <Col span={10}>
              <Card bodyStyle={{ padding: 24, height: "100%", display: 'flex', flexDirection: 'column' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>LIFETIME SALES (PAID)</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>INR 0.00</div>
                <div style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>Open analytics <ArrowRight size={14} /></div>
              </Card>
            </Col>
            
            <Col span={7}>
              <Card bodyStyle={{ padding: 24, height: "100%", display: 'flex', flexDirection: 'column' }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>UNFULFILLED ORDERS</div>
                <div style={{ fontSize: 28, color: "var(--accent-warning)", fontWeight: 800, marginBottom: 16 }}>0</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, marginTop: 'auto' }}>Mark orders shipped from the Orders screen.</div>
              </Card>
            </Col>

            <Col span={7}>
              <Card bodyStyle={{ padding: 24, height: "100%", display: "flex", flexDirection: "column" }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)', fontSize: 16 }}>Storefront</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 500 }}>https://jeema.one/shop/{activeStore.slug}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16, fontWeight: 500 }}>Set store to <strong>Active</strong> in General so customers can checkout.</div>
                
                <Space direction="vertical" style={{ width: "100%", marginTop: "auto" }}>
                  <Button block style={{ borderRadius: 8, fontSize: 13, fontWeight: 700, height: 40, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Manage design</Button>
                  <Button block style={{ borderRadius: 8, fontSize: 13, fontWeight: 700, height: 40, borderColor: "var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Pages in Builder</Button>
                  <Button type="primary" block style={{ background: "var(--accent-success)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, height: 40 }}>Preview live <ArrowRight size={14} style={{ marginLeft: 4 }} /></Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </motion.div>
  );

  const renderProducts = () => {
    const products = [
      { key: 1, name: "Phone Mount Pro", price: "INR 24.00", stock: 50 },
      { key: 2, name: "Ceramic Coating Kit", price: "INR 89.00", stock: 50 },
      { key: 3, name: "All-Weather Mats", price: "INR 59.00", stock: 50 },
      { key: 4, name: "Jump Starter Pack", price: "INR 119.00", stock: 50 },
      { key: 5, name: "LED Work Light", price: "INR 35.00", stock: 50 },
      { key: 6, name: "Memory Foam Seat Cushion", price: "INR 45.00", stock: 50 },
    ];

    const columns = [
      { title: "PRODUCT", dataIndex: "name", key: "name", render: t => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t}</span> },
      { title: "PRICE", dataIndex: "price", key: "price", render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
      { title: "STOCK", dataIndex: "stock", key: "stock", render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
      { title: "ACTIONS", key: "actions", render: () => (
        <Space>
          <Button icon={<Edit3 size={14}/>} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Edit</Button>
          <Button danger icon={<Trash2 size={14}/>} style={{ borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: 'none' }} />
        </Space>
      ) },
    ];

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }}>
          <Table columns={columns} dataSource={products} pagination={false} size="middle" />
        </Card>
      </motion.div>
    );
  };

  const renderWebsitePages = () => {
    const pages = [
      { key: 1, page: `${activeStore.slug} — home`, sub: `store-${activeStore.slug}-home`, type: "Store home", status: "Draft" },
      { key: 2, page: `${activeStore.slug} — catalog`, sub: `store-${activeStore.slug}-catalog`, type: "Catalog", status: "Draft" },
      { key: 3, page: `${activeStore.slug} — cart`, sub: `store-${activeStore.slug}-cart`, type: "Cart", status: "Draft" },
      { key: 4, page: `${activeStore.slug} — checkout`, sub: `store-${activeStore.slug}-checkout`, type: "Checkout", status: "Draft" },
      { key: 5, page: `${activeStore.slug} — blog`, sub: `store-${activeStore.slug}-blog`, type: "Blog", status: "Draft" },
    ];

    const columns = [
      { title: "PAGE", key: "page", render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.page}</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>{r.sub}</div>
        </div>
      ) },
      { title: "TYPE", dataIndex: "type", key: "type", render: t => <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t}</span> },
      { title: "STATUS", dataIndex: "status", key: "status", render: () => (
        <Select defaultValue="Draft" bordered={false} style={{ width: 100, fontWeight: 600 }}>
          <Option value="Draft">Draft</Option>
          <Option value="Published">Published</Option>
        </Select>
      ) },
      { title: "ACTIONS", key: "actions", render: () => (
        <Space>
          <Button type="primary" style={{ background: "var(--accent-primary)", border: 'none', borderRadius: 8, fontWeight: 700 }}>Edit in builder</Button>
          <Button icon={<Eye size={14}/>} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }} />
          <Button danger icon={<Trash2 size={14}/>} style={{ borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: 'none' }} />
        </Space>
      ) },
    ];

    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        <div style={{ padding: "16px 24px", borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          Store header and footer are synced from your home page. Catalog, cart, checkout, and blog pages use them automatically.
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24 }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, maxWidth: 600 }}>
            Default layouts are created once per page type. Edit the <strong>home page</strong> to set your store header and footer — catalog, cart, checkout, and blog pages use that chrome automatically.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
            <Button style={{ borderRadius: 8, fontWeight: 700, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Create default pages</Button>
            <Space>
              <Input placeholder="Custom page title" style={{ borderRadius: 8, width: 200, height: 40 }} />
              <Button type="primary" style={{ background: "var(--accent-primary)", border: 'none', borderRadius: 8, fontWeight: 700, height: 40 }}>Add page</Button>
            </Space>
          </div>
        </div>

        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }}>
          <Table columns={columns} dataSource={pages} pagination={false} size="middle" />
        </Card>

        <div style={{ color: "var(--text-tertiary)", fontSize: 12, fontWeight: 500, marginTop: 16, textAlign: 'center' }}>
          Live cart opens in a right sidebar on your storefront. Use cart & checkout modules in the builder for promos; checkout still runs on the live cart page.
        </div>
      </motion.div>
    );
  };

  const renderShipping = () => (
    <motion.div variants={itemVariants} className="store-manage-content" style={{ display: "flex", justifyContent: "center" }}>
      <Card style={{ width: "100%", maxWidth: 800, borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 40 }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text-primary)' }}>Tax & checkout</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, marginBottom: 32 }}>
          Tax is calculated on the cart subtotal after discounts, before Stripe Checkout.
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Sales tax rate (%)</div>
          <Input defaultValue="7.5000" size="large" style={{ borderRadius: 8 }} />
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

  const renderAnalytics = () => (
    <motion.div variants={itemVariants} className="store-manage-content">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>LAST 30 DAYS REVENUE</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>INR 0.00</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>PAID ORDERS (30D)</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>0</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', height: '100%' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 8 }}>AWAITING FULFILLMENT</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent-warning)" }}>0</div>
          </Card>
        </Col>
      </Row>

      <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, border: "1px solid var(--border-color)", overflow: "hidden", background: 'var(--bg-secondary)' }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
          Top products (30 days)
        </div>
        <Table 
          columns={[
            { title: "PRODUCT", key: "product" },
            { title: "UNITS", key: "units" },
            { title: "REVENUE", key: "revenue", align: "right" }
          ]} 
          dataSource={[]} 
          pagination={false}
          locale={{
            emptyText: <div style={{ padding: "40px 0", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>No paid orders in this window yet.</div>
          }}
        />
      </Card>
    </motion.div>
  );

  const renderOrders = () => {
    const columns = [
      { title: "ORDER", key: "order" },
      { title: "CUSTOMER", key: "customer" },
      { title: "TOTAL", key: "total" },
      { title: "PAYMENT", key: "payment" },
      { title: "FULFILLMENT", key: "fulfillment" },
      { title: "ACTIONS", key: "actions" },
    ];
    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }}>
          <Table columns={columns} dataSource={[]} pagination={false} locale={{ emptyText: <div style={{ padding: "40px 0", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>No orders yet.</div> }} />
        </Card>
      </motion.div>
    );
  };

  const renderCollections = () => {
    const collections = [
      { key: 1, name: "Interior", slug: "interior", active: "Yes" },
      { key: 2, name: "Exterior", slug: "exterior", active: "Yes" },
      { key: 3, name: "Tools", slug: "tools", active: "Yes" },
    ];
    const columns = [
      { title: "NAME", dataIndex: "name", key: "name", render: t => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t}</span> },
      { title: "SLUG", dataIndex: "slug", key: "slug", render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
      { title: "ACTIVE", dataIndex: "active", key: "active", render: t => <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t}</span> },
      { title: "ACTIONS", key: "actions", render: () => (
        <Space>
          <Button icon={<Edit3 size={14}/>} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Edit</Button>
          <Button danger icon={<Trash2 size={14}/>} style={{ borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: 'none' }} />
        </Space>
      ) },
    ];
    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }}>
          <Table columns={columns} dataSource={collections} pagination={false} size="middle" />
        </Card>
      </motion.div>
    );
  };

  const renderCustomers = () => {
    const columns = [
      { title: "CUSTOMER", key: "customer" },
      { title: "ORDERS", key: "orders" },
      { title: "LIFETIME", key: "lifetime" },
      { title: "LAST ORDER", key: "last_order" },
      { title: "ACTIONS", key: "actions" },
    ];
    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }}>
          <Table columns={columns} dataSource={[]} pagination={false} locale={{ emptyText: <div style={{ padding: "40px 0", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600 }}>No customers yet.</div> }} />
        </Card>
      </motion.div>
    );
  };

  const renderDiscounts = () => {
    const discounts = [
      { key: 1, code: "drive10", type: "Percent", value: "10.00%", uses: 0, active: "Yes" },
    ];
    const columns = [
      { title: "CODE", dataIndex: "code", key: "code", render: t => <Tag color="blue" style={{ fontWeight: 800, fontSize: 13, padding: '4px 8px', borderRadius: 6 }}>{t}</Tag> },
      { title: "TYPE", dataIndex: "type", key: "type", render: t => <Text type="secondary" style={{ fontWeight: 600 }}>{t}</Text> },
      { title: "VALUE", dataIndex: "value", key: "value", render: t => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t}</span> },
      { title: "USES", dataIndex: "uses", key: "uses", render: t => <Text type="secondary" style={{ fontWeight: 500 }}>{t}</Text> },
      { title: "ACTIVE", dataIndex: "active", key: "active", render: t => <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t}</span> },
      { title: "ACTIONS", key: "actions", render: () => (
        <Space>
          <Button icon={<Edit3 size={14}/>} style={{ borderRadius: 8, fontWeight: 600, borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Edit</Button>
          <Button danger icon={<Trash2 size={14}/>} style={{ borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: 'none' }} />
        </Space>
      ) },
    ];
    return (
      <motion.div variants={itemVariants} className="store-manage-content">
        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }}>
          <Table columns={columns} dataSource={discounts} pagination={false} size="middle" />
        </Card>
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

  const renderPayments = () => (
    <motion.div variants={itemVariants} className="store-manage-content" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 800 }}>
        
        <div style={{ padding: "20px 24px", borderRadius: 12, fontSize: 14, marginBottom: 24, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', fontWeight: 500, lineHeight: 1.6 }}>
          Payment credentials for this store's sub-account: <strong style={{ fontWeight: 800 }}>Jeema Agency</strong>. Configure gateways under <strong style={{ cursor: "pointer", textDecoration: "underline", fontWeight: 800 }}>Settings — Payment gateways</strong> (while this sub-account is selected in the sidebar). This page only picks which enabled gateway this store uses at checkout.
        </div>

        <div style={{ padding: "20px 24px", borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 32, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'var(--accent-warning)', lineHeight: 1.6 }}>
          No payment gateway is enabled for this scope yet. <strong style={{ cursor: "pointer", textDecoration: "underline", fontWeight: 800 }}>Set up payment gateways</strong> first, then return here to choose checkout.
        </div>

        <Card style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 40 }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CreditCard size={24} color="var(--text-tertiary)" /> Payment Configuration
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Checkout gateway</div>
          <Select defaultValue="workspace" size="large" style={{ width: "100%", marginBottom: 32 }}>
            <Option value="workspace">— Use workspace default —</Option>
          </Select>

          <div style={{ borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", marginBottom: 32, cursor: "pointer", background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <ArrowRight size={16} color="var(--text-tertiary)" style={{ marginRight: 12 }} />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Stripe keys (store override)</span>
          </div>

          <Button type="primary" style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 800, height: 48, padding: "0 40px", fontSize: 16 }}>
            Save payments
          </Button>
        </Card>

      </div>
    </motion.div>
  );

  const renderEmail = () => (
    <motion.div variants={itemVariants} className="store-manage-content" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
        <Card style={{ borderRadius: 16, border: "1px solid var(--border-color)", background: 'var(--bg-secondary)' }} bodyStyle={{ padding: 40 }}>
          
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={24} color="var(--text-tertiary)" /> Email Sender
          </div>

          <div style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 32, fontWeight: 500, lineHeight: 1.6 }}>
            Override the From name and address for email campaigns linked to this store. SMTP still uses your agency email settings.
          </div>

          <div style={{ marginBottom: 32, padding: '20px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <Checkbox style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}>
              Use custom sender for this store
            </Checkbox>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>From email</div>
            <Input size="large" style={{ borderRadius: 8 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>From name</div>
            <Input defaultValue={activeStore.slug} size="large" style={{ borderRadius: 8 }} />
          </div>

          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Reply-to (optional)</div>
            <Input size="large" style={{ borderRadius: 8 }} />
          </div>

          <Button type="primary" style={{ background: "var(--accent-primary)", border: 'none', borderRadius: 8, fontWeight: 800, height: 48, padding: "0 40px", fontSize: 16 }}>
            Save Sender Settings
          </Button>

        </Card>
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
      case "products": return <Button type="primary" icon={<Plus size={16} />} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700 }}>Product</Button>;
      case "collections": return <Button type="primary" icon={<Plus size={16} />} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700 }}>Collection</Button>;
      case "discounts": return <Button type="primary" icon={<Plus size={16} />} style={{ background: "var(--accent-success)", border: 'none', borderRadius: 8, fontWeight: 700 }}>Discount</Button>;
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
          <div style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setView("list")}>
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
            <Button type="primary" style={{ background: 'var(--accent-success)', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 24px', height: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
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
    </motion.div>
  );
};

const StoresTab = ({ itemVariants }) => {
  const [view, setView] = useState("list");
  const [stores, setStores] = useState([]);
  const [activeStore, setActiveStore] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [tempStoreData, setTempStoreData] = useState(null);

  useEffect(() => {
    const savedStores = localStorage.getItem("tunepath_stores");
    if (savedStores) {
      try {
        setStores(JSON.parse(savedStores));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tunepath_stores", JSON.stringify(stores));
  }, [stores]);

  const handleDelete = (key) => {
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

  const handleCreateContinue = (data) => {
    setTempStoreData(data);
    setIsCreateModalOpen(false);
    
    if (data.method === "templates") {
      setIsTemplateModalOpen(true);
    } else {
      const newStore = {
        key: Date.now().toString(),
        store: data.storeName,
        slug: data.storeName.toLowerCase().replace(/\s+/g, '-'),
        status: data.status,
        catalog: "Empty Catalog",
        currency: data.currency
      };
      setStores([...stores, newStore]);
    }
  };

  const handleTemplateCreate = (templateData) => {
    const newStore = {
      key: Date.now().toString(),
      store: templateData.storeName,
      slug: templateData.storeName.toLowerCase().replace(/\s+/g, '-'),
      status: tempStoreData?.status || "Draft",
      catalog: templateData.template ? `Template: ${templateData.template}` : "Demo Catalog",
      currency: tempStoreData?.currency || "INR"
    };
    
    setStores([...stores, newStore]);
    setIsTemplateModalOpen(false);
    setTempStoreData(null);

    setActiveStore(newStore);
    setView("manage");
  };

  if (view === "manage" && activeStore) {
    return <ManageStoreView activeStore={activeStore} setView={setView} itemVariants={itemVariants} />;
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
