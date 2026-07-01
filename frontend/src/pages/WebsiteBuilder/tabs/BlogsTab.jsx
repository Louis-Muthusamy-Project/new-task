import React, { useState, useEffect } from "react";
import { Button, Table, Typography, Space, Input, Select, Card, Row, Col, Popconfirm, Checkbox, Modal } from "antd";
import { Plus, Trash2, Edit3, Newspaper, LayoutTemplate, Settings, Tag as TagIcon, LayoutList, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FIELD_LABEL_STYLE = { fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' };
const FIELD_HINT_STYLE = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 };
const CARD_STYLE = { maxWidth: 800, borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' };
const BACK_LINK_STYLE = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 700 };

const slugify = (str) => (str || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ---------------------------------------------------------------------------
// New blog
// ---------------------------------------------------------------------------
const CreateBlogView = ({ setView, handleCreateBlog, itemVariants }) => {
  const [formData, setFormData] = useState({
    name: "",
    website: "—",
    webstore: "—",
    description: "",
    status: "active"
  });

  return (
    <motion.div variants={itemVariants} className="builder-view-container">
      <div style={BACK_LINK_STYLE} onClick={() => setView("list")}>
        <ArrowLeft size={16} /> Blogs
      </div>
      <Title level={3} style={{ marginBottom: 32, color: 'var(--text-primary)', fontWeight: 800 }}>New blog</Title>

      <Card bodyStyle={{ padding: 32 }} style={CARD_STYLE}>
        <div style={{ marginBottom: 24 }}>
          <div style={FIELD_LABEL_STYLE}>BLOG NAME</div>
          <Input
            size="large"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            style={{ borderRadius: 8 }}
          />
        </div>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>WEBSITE (OPTIONAL)</div>
            <Select
              size="large"
              value={formData.website}
              onChange={v => setFormData({ ...formData, website: v })}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>WEB STORE (OPTIONAL)</div>
            <Select
              size="large"
              value={formData.webstore}
              onChange={v => setFormData({ ...formData, webstore: v })}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
        </Row>
        <div style={{ marginBottom: 24 }}>
          <div style={FIELD_LABEL_STYLE}>DESCRIPTION</div>
          <TextArea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{ borderRadius: 8 }}
          />
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={FIELD_LABEL_STYLE}>STATUS</div>
          <Select
            size="large"
            value={formData.status}
            onChange={v => setFormData({ ...formData, status: v })}
            style={{ width: "100%" }}
          >
            <Option value="active">active</Option>
            <Option value="draft">draft</Option>
          </Select>
        </div>
        <Button
          type="primary"
          size="large"
          style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700, padding: "0 32px" }}
          disabled={!formData.name}
          onClick={() => handleCreateBlog(formData)}
        >
          Create blog
        </Button>
      </Card>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Blog settings
// ---------------------------------------------------------------------------
const SettingsBlogView = ({ activeBlog, setView, handleUpdateBlog, itemVariants }) => {
  const [formData, setFormData] = useState({
    name: activeBlog.name,
    website: activeBlog.website,
    webstore: activeBlog.webstore,
    status: activeBlog.status,
    postsPerPage: activeBlog.postsPerPage
  });

  return (
    <motion.div variants={itemVariants} className="builder-view-container">
      <div style={BACK_LINK_STYLE} onClick={() => setView("manage")}>
        <ArrowLeft size={16} /> {activeBlog.name}
      </div>
      <Title level={3} style={{ marginBottom: 32, color: 'var(--text-primary)', fontWeight: 800 }}>Blog Settings</Title>

      <Card bodyStyle={{ padding: 32 }} style={CARD_STYLE}>
        <div style={{ marginBottom: 24 }}>
          <div style={FIELD_LABEL_STYLE}>NAME</div>
          <Input
            size="large"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            style={{ borderRadius: 8 }}
          />
        </div>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>WEBSITE</div>
            <Select
              size="large"
              value={formData.website}
              onChange={v => setFormData({ ...formData, website: v })}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>WEB STORE</div>
            <Select
              size="large"
              value={formData.webstore}
              onChange={v => setFormData({ ...formData, webstore: v })}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
        </Row>
        <div style={{ marginBottom: 24 }}>
          <div style={FIELD_LABEL_STYLE}>POSTS PER PAGE (ARCHIVE)</div>
          <Input
            size="large"
            value={formData.postsPerPage}
            onChange={e => setFormData({ ...formData, postsPerPage: e.target.value })}
            style={{ borderRadius: 8, width: 120 }}
            type="number"
          />
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={FIELD_LABEL_STYLE}>STATUS</div>
          <Select
            size="large"
            value={formData.status}
            onChange={v => setFormData({ ...formData, status: v })}
            style={{ width: "100%" }}
          >
            <Option value="active">active</Option>
            <Option value="draft">draft</Option>
          </Select>
        </div>
        <Button
          type="primary"
          size="large"
          style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700, padding: "0 32px" }}
          onClick={() => handleUpdateBlog(formData)}
        >
          Save Settings
        </Button>
      </Card>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// New blog post
// ---------------------------------------------------------------------------
const CreatePostView = ({ activeBlog, setView, handleCreatePost, itemVariants }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: undefined,
    status: "draft",
    website: "—",
    webstore: "—",
    excerpt: "",
    metaTitle: "",
    metaDescription: "",
    featured: false
  });

  return (
    <motion.div variants={itemVariants} className="builder-view-container">
      <div style={BACK_LINK_STYLE} onClick={() => setView("manage")}>
        <ArrowLeft size={16} /> {activeBlog.name}
      </div>
      <Title level={3} style={{ marginBottom: 32, color: 'var(--text-primary)', fontWeight: 800 }}>New blog post</Title>

      <Card bodyStyle={{ padding: 32 }} style={CARD_STYLE}>
        <div style={{ marginBottom: 24 }}>
          <div style={FIELD_LABEL_STYLE}>TITLE</div>
          <Input
            size="large"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            style={{ borderRadius: 8 }}
          />
        </div>

        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>CATEGORY</div>
            <Select
              size="large"
              value={formData.category}
              placeholder="—"
              onChange={v => setFormData({ ...formData, category: v })}
              style={{ width: "100%" }}
              allowClear
            >
              {(activeBlog.categoryList || []).map(cat => (
                <Option key={cat.key} value={cat.name}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>STATUS</div>
            <Select
              size="large"
              value={formData.status}
              onChange={v => setFormData({ ...formData, status: v })}
              style={{ width: "100%" }}
            >
              <Option value="draft">draft</Option>
              <Option value="published">published</Option>
            </Select>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>WEBSITE (OPTIONAL)</div>
            <div style={FIELD_HINT_STYLE}>Tag this post for a site; embed via Page builder → Blog.</div>
            <Select
              size="large"
              value={formData.website}
              onChange={v => setFormData({ ...formData, website: v })}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>WEB STORE (OPTIONAL)</div>
            <div style={FIELD_HINT_STYLE}>Shows on storefront <code>/shop/{'{slug}'}/blog</code>.</div>
            <Select
              size="large"
              value={formData.webstore}
              onChange={v => setFormData({ ...formData, webstore: v })}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
        </Row>

        <div style={{ marginBottom: 24 }}>
          <div style={FIELD_LABEL_STYLE}>EXCERPT</div>
          <TextArea
            value={formData.excerpt}
            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            style={{ borderRadius: 8 }}
          />
        </div>

        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>META TITLE</div>
            <Input
              size="large"
              value={formData.metaTitle}
              onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col span={12}>
            <div style={FIELD_LABEL_STYLE}>META DESCRIPTION</div>
            <Input
              size="large"
              value={formData.metaDescription}
              onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
              style={{ borderRadius: 8 }}
            />
          </Col>
        </Row>

        <div style={{ marginBottom: 32 }}>
          <Checkbox
            checked={formData.featured}
            onChange={e => setFormData({ ...formData, featured: e.target.checked })}
          >
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Featured post</span>
          </Checkbox>
        </div>

        <Button
          type="primary"
          size="large"
          style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700, padding: "0 32px" }}
          disabled={!formData.title}
          onClick={() => handleCreatePost(formData)}
        >
          Create & open builder
        </Button>
      </Card>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------
const BlogsTab = ({ itemVariants }) => {
  const [view, setView] = useState("list"); // list, create, manage, settings, newPost
  const [blogs, setBlogs] = useState([]);
  const [activeBlogKey, setActiveBlogKey] = useState(null);
  const [manageSubTab, setManageSubTab] = useState("posts");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const savedBlogs = localStorage.getItem("tunepath_blogs_v2");
    if (savedBlogs) {
      try {
        setBlogs(JSON.parse(savedBlogs));
      } catch (e) {
        console.error("Failed to parse blogs from local storage");
      }
    } else {
      setBlogs([
        {
          key: '1',
          name: 'Tech Insights',
          slug: 'tech-insights',
          assignedTo: 'Any site / store',
          publicUrl: '/blog/tech-insights',
          website: '—',
          webstore: '—',
          description: 'Latest news and insights from the tech world.',
          status: 'active',
          postsPerPage: 12,
          postList: [
            { key: 'p1', title: 'Building a Scalable React Architecture for 2026', category: undefined, status: 'draft', website: '—', webstore: '—', excerpt: '', metaTitle: '', metaDescription: '', featured: false }
          ],
          categoryList: []
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (blogs.length) {
      localStorage.setItem("tunepath_blogs_v2", JSON.stringify(blogs));
    }
  }, [blogs]);

  const activeBlog = blogs.find(b => b.key === activeBlogKey) || null;

  const updateActiveBlog = (updater) => {
    setBlogs(prev => prev.map(b => (b.key === activeBlogKey ? updater(b) : b)));
  };

  const handleCreateBlog = (newBlogData) => {
    const slug = slugify(newBlogData.name);
    const newBlog = {
      key: Date.now().toString(),
      name: newBlogData.name,
      slug,
      assignedTo: 'Any site / store',
      publicUrl: `/blog/${slug}`,
      website: newBlogData.website || '—',
      webstore: newBlogData.webstore || '—',
      description: newBlogData.description || '',
      status: newBlogData.status || 'active',
      postsPerPage: 12,
      postList: [],
      categoryList: []
    };
    setBlogs([...blogs, newBlog]);
    setView("list");
  };

  const handleUpdateBlog = (updatedData) => {
    updateActiveBlog(b => ({ ...b, ...updatedData }));
    setView("manage");
  };

  const handleDeleteBlog = (key) => {
    setBlogs(blogs.filter(b => b.key !== key));
  };

  const handleCreatePost = (postData) => {
    const newPost = { key: Date.now().toString(), ...postData };
    updateActiveBlog(b => ({ ...b, postList: [newPost, ...(b.postList || [])] }));
    setManageSubTab("posts");
    setView("manage");
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory = { key: Date.now().toString(), name: newCategoryName.trim(), slug: slugify(newCategoryName) };
    updateActiveBlog(b => ({ ...b, categoryList: [...(b.categoryList || []), newCategory] }));
    setNewCategoryName("");
    setCategoryModalOpen(false);
  };

  const renderList = () => {
    const columns = [
      {
        title: "BLOG",
        dataIndex: "blog",
        key: "blog",
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: 15 }}>{record.name}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500 }}>{record.slug}</div>
          </div>
        )
      },
      {
        title: "ASSIGNED TO",
        dataIndex: "assignedTo",
        key: "assignedTo",
        render: (text) => <Text type="secondary" style={{ fontWeight: 500 }}>{text}</Text>
      },
      {
        title: "POSTS",
        dataIndex: "posts",
        key: "posts",
        render: (_, record) => (
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {(record.postList || []).length} <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>/ {(record.categoryList || []).length} cat.</span>
          </span>
        )
      },
      {
        title: "PUBLIC URL",
        dataIndex: "publicUrl",
        key: "publicUrl",
        render: (text) => <span style={{ color: "var(--accent-info)", fontWeight: 600 }}>{text}</span>
      },
      {
        title: "ACTIONS",
        key: "actions",
        align: "right",
        render: (_, record) => (
          <Space>
            <span
              style={{ color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => {
                setActiveBlogKey(record.key);
                setManageSubTab("posts");
                setView("manage");
              }}
            >
              Manage <ArrowRight size={14} />
            </span>
            <Popconfirm title="Delete this blog?" onConfirm={() => handleDeleteBlog(record.key)}>
              <Button type="text" danger icon={<Trash2 size={16} />} size="small" style={{ borderRadius: 6 }} />
            </Popconfirm>
          </Space>
        )
      },
    ];

    return (
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={4} style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              Blogs
            </Title>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              WordPress-style blogs — assign to a website or store, add posts, embed modules in the page builder.
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<Plus size={18} />}
              style={{ backgroundColor: "var(--accent-primary)", border: 'none', borderRadius: 8, fontWeight: 700, height: 44, padding: '0 24px', boxShadow: 'var(--shadow-md)' }}
              onClick={() => setView("create")}
            >
              New blog
            </Button>
          </Space>
        </div>

        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <Table
            columns={columns}
            dataSource={blogs}
            pagination={false}
            locale={{
              emptyText: (
                <div style={{ padding: "80px 0", textAlign: "center" }}>
                  <div style={{ width: 80, height: 80, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Newspaper size={40} />
                  </div>
                  <Title level={4} style={{ marginBottom: 12, color: 'var(--text-primary)', fontWeight: 800 }}>No blogs yet</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 32, fontSize: 15, fontWeight: 500 }}>
                    Click <strong style={{ color: "var(--text-primary)" }}>+ New blog</strong> to start writing articles.
                  </Text>
                  <Button type="primary" icon={<Plus size={18} />} onClick={() => setView("create")} style={{ borderRadius: 8, height: 44, background: 'var(--accent-primary)', border: 'none', fontWeight: 700, padding: '0 32px' }}>Create Blog</Button>
                </div>
              )
            }}
          />
        </Card>
      </motion.div>
    );
  };

  const renderSubTabBar = () => (
    <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '2px solid var(--border-color)', paddingBottom: 0 }}>
      {[
        { key: "posts", label: "Posts", icon: <LayoutList size={16} /> },
        { key: "categories", label: "Categories", icon: <LayoutTemplate size={16} /> }
      ].map(tab => (
        <div
          key={tab.key}
          onClick={() => setManageSubTab(tab.key)}
          style={{
            padding: '12px 16px',
            color: manageSubTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: manageSubTab === tab.key ? 800 : 600,
            fontSize: 14,
            cursor: 'pointer',
            borderBottom: manageSubTab === tab.key ? '3px solid var(--accent-primary)' : '3px solid transparent',
            marginBottom: -2,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          {tab.icon} {tab.label}
        </div>
      ))}
    </div>
  );

  const renderPostsView = () => {
    const posts = activeBlog.postList || [];
    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <Title level={2} style={{ margin: 0, marginBottom: 8, color: 'var(--text-primary)', fontWeight: 900 }}>{activeBlog.name}</Title>
            <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              Public: <span style={{ color: "var(--accent-info)", fontWeight: 600 }}>{activeBlog.publicUrl}</span>
            </div>
          </div>
          <Space>
            <Button size="large" style={{ borderRadius: 8, fontWeight: 700, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onClick={() => setView("settings")} icon={<Settings size={16} />}>
              Settings
            </Button>
            <Button size="large" type="primary" icon={<Plus size={16} />} style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700 }} onClick={() => setView("newPost")}>
              New post
            </Button>
          </Space>
        </div>

        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col span={8}>
            <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 12 }}>POSTS</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{posts.length}</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 12 }}>CATEGORIES</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{(activeBlog.categoryList || []).length}</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bodyStyle={{ padding: 24, height: "100%", display: "flex", alignItems: "center" }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-secondary)" }}>
                {activeBlog.website && activeBlog.website !== '—' ? `Website: ${activeBlog.website}` : "Unassigned to site"}
              </div>
            </Card>
          </Col>
        </Row>

        {renderSubTabBar()}

        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 32, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', background: 'var(--bg-primary)' }}>
            Recent posts
          </div>
          <div>
            {posts.length === 0 && (
              <div style={{ padding: "40px 24px", textAlign: "center", color: 'var(--text-secondary)', fontWeight: 500 }}>
                No posts yet. Click <strong style={{ color: 'var(--text-primary)' }}>+ New post</strong> to write your first article.
              </div>
            )}
            {posts.map((post, idx) => (
              <div key={post.key} style={{ padding: "20px 24px", borderBottom: idx !== posts.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="hover-bg-primary">
                <div style={{ fontWeight: 600, maxWidth: "80%", color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
                <div style={{ color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer", fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={14} /> Edit</div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: 24, borderRadius: 16, color: "var(--accent-primary)", display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <FileText size={24} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ lineHeight: 1.6, fontSize: 14 }}>
            <strong style={{ fontWeight: 800, display: 'block', marginBottom: 4, fontSize: 15 }}>Page builder:</strong>
            Open any page on the assigned website → <strong style={{ fontWeight: 800 }}>Blog</strong> tab → drag <em>Latest, Featured</em>, or <em>Blog menu</em> modules. Create menus under <strong style={{ fontWeight: 800 }}>Menus</strong> with type "Blog home" or "Blog post".
          </div>
        </div>
      </>
    );
  };

  const renderCategoriesView = () => {
    const categories = activeBlog.categoryList || [];
    const columns = [
      { title: "NAME", dataIndex: "name", key: "name", render: (text) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{text}</span> },
      { title: "SLUG", dataIndex: "slug", key: "slug", render: (text) => <span style={{ color: "var(--accent-info)", fontWeight: 600 }}>{text}</span> },
      {
        title: "",
        key: "actions",
        align: "right",
        render: () => <span style={{ color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer" }}>Edit</span>
      }
    ];

    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 900 }}>Categories</Title>
          <Button size="large" type="primary" icon={<Plus size={16} />} style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700 }} onClick={() => setCategoryModalOpen(true)}>
            Category
          </Button>
        </div>

        {renderSubTabBar()}

        <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <Table
            columns={columns}
            dataSource={categories}
            pagination={false}
            locale={{
              emptyText: (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <TagIcon size={32} />
                  </div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: 15, fontWeight: 500 }}>
                    No categories yet.
                  </Text>
                  <Button type="primary" icon={<Plus size={16} />} onClick={() => setCategoryModalOpen(true)} style={{ borderRadius: 8, height: 40, background: 'var(--accent-primary)', border: 'none', fontWeight: 700 }}>Add Category</Button>
                </div>
              )
            }}
          />
        </Card>

        <Modal
          title="New category"
          open={categoryModalOpen}
          onCancel={() => { setCategoryModalOpen(false); setNewCategoryName(""); }}
          onOk={handleAddCategory}
          okText="Create category"
          okButtonProps={{ style: { backgroundColor: "var(--accent-primary)", border: "none", fontWeight: 700, borderRadius: 8 }, disabled: !newCategoryName.trim() }}
        >
          <div style={FIELD_LABEL_STYLE}>NAME</div>
          <Input
            size="large"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onPressEnter={handleAddCategory}
            style={{ borderRadius: 8 }}
            autoFocus
          />
          {newCategoryName && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>Slug: {slugify(newCategoryName)}</div>
          )}
        </Modal>
      </>
    );
  };

  const renderManage = () => {
    if (!activeBlog) return null;

    return (
      <motion.div variants={itemVariants}>
        <div style={{ padding: "0" }}>
          <div style={BACK_LINK_STYLE} onClick={() => (manageSubTab === "categories" ? setManageSubTab("posts") : setView("list"))}>
            <ArrowLeft size={16} /> {manageSubTab === "categories" ? activeBlog.name : "Blogs"}
          </div>

          {manageSubTab === "posts" ? renderPostsView() : renderCategoriesView()}
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      {view === "list" && renderList()}
      {view === "create" && <CreateBlogView setView={setView} handleCreateBlog={handleCreateBlog} itemVariants={itemVariants} />}
      {view === "manage" && renderManage()}
      {view === "settings" && activeBlog && <SettingsBlogView activeBlog={activeBlog} setView={setView} handleUpdateBlog={handleUpdateBlog} itemVariants={itemVariants} />}
      {view === "newPost" && activeBlog && <CreatePostView activeBlog={activeBlog} setView={setView} handleCreatePost={handleCreatePost} itemVariants={itemVariants} />}
    </div>
  );
};

export default BlogsTab;