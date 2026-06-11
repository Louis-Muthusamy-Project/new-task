import React, { useState, useEffect } from "react";
import { Button, Table, Typography, Space, Input, Select, Card, Row, Col, Popconfirm, Tag } from "antd";
import { Plus, Trash2, Edit3, Newspaper, LayoutTemplate, Settings, Tag as TagIcon, LayoutList, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 700 }} onClick={() => setView("list")}>
        <ArrowLeft size={16} /> Back to Blogs
      </div>
      <Title level={3} style={{ marginBottom: 32, color: 'var(--text-primary)', fontWeight: 800 }}>Create New Blog</Title>
      
      <Card bodyStyle={{ padding: 32 }} style={{ maxWidth: 800, borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>BLOG NAME</div>
          <Input 
            size="large"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ borderRadius: 8 }} 
          />
        </div>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>WEBSITE (OPTIONAL)</div>
            <Select 
              size="large"
              value={formData.website}
              onChange={v => setFormData({...formData, website: v})}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>WEB STORE (OPTIONAL)</div>
            <Select 
              size="large"
              value={formData.webstore}
              onChange={v => setFormData({...formData, webstore: v})}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
        </Row>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>DESCRIPTION</div>
          <TextArea 
            size="large"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            rows={3} 
            style={{ borderRadius: 8 }} 
          />
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>STATUS</div>
          <Select 
            size="large"
            value={formData.status}
            onChange={v => setFormData({...formData, status: v})}
            style={{ width: "100%" }}
          >
            <Option value="active">Active</Option>
            <Option value="draft">Draft</Option>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 700 }} onClick={() => setView("manage")}>
        <ArrowLeft size={16} /> Back to {activeBlog.name}
      </div>
      <Title level={3} style={{ marginBottom: 32, color: 'var(--text-primary)', fontWeight: 800 }}>Blog Settings</Title>
      
      <Card bodyStyle={{ padding: 32 }} style={{ maxWidth: 800, borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>NAME</div>
          <Input 
            size="large"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ borderRadius: 8 }} 
          />
        </div>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>WEBSITE</div>
            <Select 
              size="large"
              value={formData.website}
              onChange={v => setFormData({...formData, website: v})}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
          <Col span={12}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>WEB STORE</div>
            <Select 
              size="large"
              value={formData.webstore}
              onChange={v => setFormData({...formData, webstore: v})}
              style={{ width: "100%" }}
            >
              <Option value="—">—</Option>
            </Select>
          </Col>
        </Row>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>POSTS PER PAGE (ARCHIVE)</div>
          <Input 
            size="large"
            value={formData.postsPerPage}
            onChange={e => setFormData({...formData, postsPerPage: e.target.value})}
            style={{ borderRadius: 8, width: 120 }} 
            type="number"
          />
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>STATUS</div>
          <Select 
            size="large"
            value={formData.status}
            onChange={v => setFormData({...formData, status: v})}
            style={{ width: "100%" }}
          >
            <Option value="active">Active</Option>
            <Option value="draft">Draft</Option>
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


const BlogsTab = ({ itemVariants }) => {
  const [view, setView] = useState("list"); // list, create, manage, settings
  const [blogs, setBlogs] = useState([]);
  const [activeBlog, setActiveBlog] = useState(null);
  const [manageSubTab, setManageSubTab] = useState("posts");

  useEffect(() => {
    const savedBlogs = localStorage.getItem("tunepath_blogs");
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
          posts: 5,
          categories: 3,
          publicUrl: '/blog/tech-insights',
          website: '—',
          webstore: '—',
          description: 'Latest news and insights from the tech world.',
          status: 'active',
          postsPerPage: 12
        }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tunepath_blogs", JSON.stringify(blogs));
  }, [blogs]);

  const handleCreateBlog = (newBlogData) => {
    const newBlog = {
      key: Date.now().toString(),
      name: newBlogData.name,
      slug: newBlogData.name.toLowerCase().replace(/\s+/g, '-'),
      assignedTo: 'Any site / store',
      posts: 0,
      categories: 0,
      publicUrl: `/blog/${newBlogData.name.toLowerCase().replace(/\s+/g, '-')}`,
      website: newBlogData.website || '—',
      webstore: newBlogData.webstore || '—',
      description: newBlogData.description || '',
      status: newBlogData.status || 'active',
      postsPerPage: 12
    };
    setBlogs([...blogs, newBlog]);
    setView("list");
  };

  const handleUpdateBlog = (updatedData) => {
    setBlogs(blogs.map(b => b.key === activeBlog.key ? { ...b, ...updatedData } : b));
    setActiveBlog({ ...activeBlog, ...updatedData });
    setView("manage");
  };

  const handleDeleteBlog = (key) => {
    setBlogs(blogs.filter(b => b.key !== key));
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
        render: (_, record) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{record.posts} <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>/ {record.categories} cat.</span></span>
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
                setActiveBlog(record);
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
              <Newspaper size={24} color="var(--accent-primary)" /> Blogs
            </Title>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              WordPress-style blogs — assign templates, embed modules in the page builder.
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

  const renderManage = () => {
    if (!activeBlog) return null;

    const recentPosts = [
      "Learning doesn't stop at school. Simple daily routines and engaging activities at home can greatly enhance a child's understanding and curiosity.",
      "The Importance of Early Childhood Learning",
      "Building a Scalable React Architecture for 2026",
      "Why Glassmorphism is the New Standard",
      "Optimizing SEO for Modern Single Page Applications"
    ];

    return (
      <motion.div variants={itemVariants}>
        <div style={{ padding: "0" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 700 }} onClick={() => setView("list")}>
            <ArrowLeft size={16} /> Back to Blogs
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <Title level={2} style={{ margin: 0, marginBottom: 8, color: 'var(--text-primary)', fontWeight: 900 }}>{activeBlog.name}</Title>
              <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Public URL: <span style={{ color: "var(--accent-info)", fontWeight: 600 }}>{activeBlog.publicUrl}</span>
              </div>
            </div>
            <Space>
              <Button size="large" style={{ borderRadius: 8, fontWeight: 700, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onClick={() => setView("settings")} icon={<Settings size={16} />}>
                Settings
              </Button>
              <Button size="large" type="primary" icon={<Plus size={16} />} style={{ backgroundColor: "var(--accent-primary)", border: "none", borderRadius: 8, fontWeight: 700 }}>
                New post
              </Button>
            </Space>
          </div>

          <Row gutter={24} style={{ marginBottom: 32 }}>
            <Col span={8}>
              <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> POSTS</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{activeBlog.posts}</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><TagIcon size={14} /> CATEGORIES</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{activeBlog.categories}</div>
              </Card>
            </Col>
            <Col span={8}>
              <Card bodyStyle={{ padding: 24, height: "100%", display: "flex", alignItems: "center" }} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-secondary)" }}>Unassigned to site</div>
              </Card>
            </Col>
          </Row>

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

          {manageSubTab === "posts" && (
            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 32, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', background: 'var(--bg-primary)' }}>
                Recent posts
              </div>
              <div>
                {recentPosts.map((post, idx) => (
                  <div key={idx} style={{ padding: "20px 24px", borderBottom: idx !== recentPosts.length - 1 ? "1px solid var(--border-color)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="hover-bg-primary">
                    <div style={{ fontWeight: 600, maxWidth: "80%", color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post}</div>
                    <div style={{ color: "var(--accent-primary)", fontWeight: 700, cursor: "pointer", fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}><Edit3 size={14} /> Edit</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: 24, borderRadius: 16, color: "var(--accent-primary)", display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <FileText size={24} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ lineHeight: 1.6, fontSize: 14 }}>
              <strong style={{ fontWeight: 800, display: 'block', marginBottom: 4, fontSize: 15 }}>Page builder integration</strong>
              Open any page on the assigned website → <strong style={{ fontWeight: 800 }}>Blog</strong> tab → drag <em>Latest, Featured</em>, or <em>Blog menu</em> modules. Create menus under <strong style={{ fontWeight: 800 }}>Menus</strong> with type "Blog home" or "Blog post".
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      {view === "list" && renderList()}
      {view === "create" && <CreateBlogView setView={setView} handleCreateBlog={handleCreateBlog} itemVariants={itemVariants} />}
      {view === "manage" && renderManage()}
      {view === "settings" && <SettingsBlogView activeBlog={activeBlog} setView={setView} handleUpdateBlog={handleUpdateBlog} itemVariants={itemVariants} />}
    </div>
  );
};

export default BlogsTab;
