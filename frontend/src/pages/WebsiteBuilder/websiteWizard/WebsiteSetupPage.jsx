import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Input, Typography, Select, Alert, Badge, Space, Tag, Divider, Spin } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { websiteWizardApi } from '../../../api/websiteWizardApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

const WebsiteSetupPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const templateId = state?.templateId || '';
  const websiteName = state?.websiteName || '';
  const templateZipCloudinaryUrl = state?.templateZipCloudinaryUrl || '';

  const [websiteId, setWebsiteId] = useState(state?.websiteId || '');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Draft');
  const [faviconUrl, setFaviconUrl] = useState('');


  const [metaPixelId, setMetaPixelId] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [googleTagManagerId, setGoogleTagManagerId] = useState('');
  const [tiktokPixelId, setTiktokPixelId] = useState('');
  const [customHeadCode, setCustomHeadCode] = useState('');
  const [customBodyCode, setCustomBodyCode] = useState('');

  const [chatWidgetId, setChatWidgetId] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  const [pages, setPages] = useState([]);
  const [newPageTitle, setNewPageTitle] = useState('');

  const homePage = useMemo(() => pages.find((p) => p.isHome), [pages]);

  const createPage = () => {
    const title = newPageTitle.trim();
    if (!title) return;

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');

    const newPage = {
      id: String(Date.now()),
      title,
      slug,
      isHome: false,
      status: 'Draft',
    };

    setPages((prev) => [...prev, newPage]);
    setNewPageTitle('');
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [savingChatWidget, setSavingChatWidget] = useState(false);
  const [chatWidgetError, setChatWidgetError] = useState('');

  const onSaveWebsite = async () => {
    try {
      setSaving(true);
      setSaveError('');

      const payload = {
        templateId,
        websiteName: websiteName,
        description,
        status,
        faviconUrl,
        templateZipCloudinaryUrl: templateZipCloudinaryUrl,
        trackingPixels: {
          metaPixelId,
          googleAnalyticsId,
          googleTagManagerId,
          tiktokPixelId,
          customHeadCode,
          customBodyCode,
        },
        chatWidgetId,
        customDomain,
      };

      const websiteDoc = websiteId
        ? await websiteWizardApi.updateWebsite(websiteId, payload)
        : await websiteWizardApi.createWebsite(payload);

      const savedWebsiteId = websiteDoc?._id || websiteDoc?.id || websiteId;
      if (!savedWebsiteId) throw new Error('Website saved but websiteId missing');
      setWebsiteId(savedWebsiteId);

      // Save pages (match by slug to avoid duplicates)
      const existingPages = await websiteWizardApi.listPagesByWebsite(savedWebsiteId);
      const existingBySlug = new Map((existingPages || []).map((p) => [p.slug, p]));

      // 1) Upsert existing pages
      for (const p of pages) {
        if (!p.slug || !p.title) continue;
        const existing = existingBySlug.get(p.slug);
        const pagePayload = {
          websiteId: savedWebsiteId,
          title: p.title,
          slug: p.slug,
          isHome: !!p.isHome,
          status: p.status,
          pageJson: p.pageJson || {},
        };

        if (existing?._id) {
          await websiteWizardApi.updatePage(existing._id, pagePayload);
        } else {
          await websiteWizardApi.createPage(pagePayload);
        }
      }

      setSaveError('');
    } catch (e) {
      setSaveError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onSaveChatWidget = async () => {
    try {
      setChatWidgetError('');

      if (!websiteId) {
        setChatWidgetError('Save the website before attaching a chat widget.');
        return;
      }

      setSavingChatWidget(true);

      const websiteDoc = await websiteWizardApi.updateWebsite(websiteId, { chatWidgetId: chatWidgetId || null });

      const savedWebsiteId = websiteDoc?._id || websiteDoc?.id || websiteId;
      setWebsiteId(savedWebsiteId);
    } catch (e) {
      setChatWidgetError(e?.message || 'Failed to save chat widget');
    } finally {
      setSavingChatWidget(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 900 }}>{websiteName}</Title>
          <Text type="secondary">Template: {templateId}</Text>
        </div>
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          style={{ borderRadius: 10, fontWeight: 900 }}
        >
          Back
        </Button>
      </div>

      <Alert style={{ marginBottom: 18 }} message="Website created successfully" type="success" showIcon />

      <Row gutter={24}>
        {/* LEFT */}
        <Col span={12}>
          <Card
            style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', background: 'var(--bg-secondary)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Website Name</div>
                <Input value={websiteName} disabled size="large" style={{ borderRadius: 10 }} />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Description</div>
                <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} style={{ borderRadius: 10 }} />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Status</div>
                <Select size="large" value={status} onChange={setStatus} style={{ width: '100%' }}>
                  <Select.Option value="Draft">Draft</Select.Option>
                  <Select.Option value="Published">Published</Select.Option>
                </Select>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Favicon URL</div>
                <Input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="https://example.com/favicon.png" size="large" style={{ borderRadius: 10 }} />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Upload Favicon</div>
                <div style={{ border: '1px dashed var(--border-color)', borderRadius: 12, padding: 16, textAlign: 'center', background: 'var(--bg-primary)' }}>
                  <Button style={{ borderRadius: 10, fontWeight: 900 }}>Choose File</Button>
                </div>
              </div>

              <Divider />

              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 900 }}>Tracking Pixels</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>Injected on every public page for this website.</Text>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Meta Pixel ID</div>
                    <Input value={metaPixelId} onChange={(e) => setMetaPixelId(e.target.value)} placeholder="123456789012345" style={{ borderRadius: 10 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Google Analytics ID</div>
                    <Input value={googleAnalyticsId} onChange={(e) => setGoogleAnalyticsId(e.target.value)} placeholder="G-XXXXXXXXXX" style={{ borderRadius: 10 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Google Tag Manager ID</div>
                    <Input value={googleTagManagerId} onChange={(e) => setGoogleTagManagerId(e.target.value)} placeholder="GTM-XXXXXXX" style={{ borderRadius: 10 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>TikTok Pixel ID</div>
                    <Input value={tiktokPixelId} onChange={(e) => setTiktokPixelId(e.target.value)} placeholder="CXX000000000000X" style={{ borderRadius: 10 }} />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Custom Head Code</div>
                  <TextArea value={customHeadCode} onChange={(e) => setCustomHeadCode(e.target.value)} rows={4} placeholder="<script>...</script> placed before </head>" style={{ fontFamily: 'monospace', borderRadius: 10 }} />
                </div>


                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Custom Body Code</div>
                  <TextArea value={customBodyCode} onChange={(e) => setCustomBodyCode(e.target.value)} rows={4} placeholder="<noscript>...</noscript> placed after <body>" style={{ fontFamily: 'monospace', borderRadius: 10 }} />
                </div>
              </div>

              <Divider />

              <div>
                {saveError ? (
                  <Alert style={{ marginBottom: 12 }} type="error" showIcon message={saveError} />
                ) : null}

                <Button
                  type="primary"
                  block
                  onClick={onSaveWebsite}
                  disabled={saving}
                  style={{
                    background: 'var(--accent-primary)',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 900,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  {saving ? <Spin size="small" /> : null}
                  Save Website
                </Button>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <Button
                    type="primary"
                    block
                    onClick={() => {
                      setStatus('Published');
                      setTimeout(() => onSaveWebsite(), 0);
                    }}
                    disabled={saving}
                    style={{ background: 'var(--accent-success)', border: 'none', borderRadius: 12, fontWeight: 900, height: 48, color: '#fff' }}
                  >
                    Publish
                  </Button>
                  <Button
                    type="primary"
                    block
                    onClick={() => {
                      setStatus('Draft');
                      setTimeout(() => onSaveWebsite(), 0);
                    }}
                    disabled={saving}
                    style={{ background: 'var(--accent-warning)', border: 'none', borderRadius: 12, fontWeight: 900, height: 48, color: '#fff' }}
                  >
                    Draft
                  </Button>
                </div>
              </div>


              <Divider />

              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 900 }}>Chat Widget</Title>
                <div style={{ marginTop: 12 }}>
                  <Select size="large" value={chatWidgetId} onChange={setChatWidgetId} style={{ width: '100%' }}>
                    <Select.Option value="">Select Widget</Select.Option>
                    <Select.Option value="w1">Widget 1</Select.Option>
                  </Select>
                </div>

                {chatWidgetError ? (
                  <Alert style={{ marginTop: 12 }} type="error" showIcon message={chatWidgetError} />
                ) : null}

                <Button
                  type="primary"
                  block
                  onClick={onSaveChatWidget}
                  disabled={savingChatWidget}
                  style={{
                    background: 'var(--accent-info)',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 900,
                    height: 48,
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  {savingChatWidget ? <Spin size="small" /> : null}
                  Save Chat Widget
                </Button>
                <div style={{ textAlign: 'center', color: 'var(--accent-info)', fontWeight: 900, marginTop: 10 }}>Create New Chat Widget</div>
              </div>

              <Divider />

              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 900 }}>Custom Domain</Title>
                <Button type="primary" block style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: 12, fontWeight: 900, height: 48, marginTop: 12 }}>
                  Connect Domain
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        {/* RIGHT */}
        <Col span={12}>
          <Card style={{ borderRadius: 16, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', background: 'var(--bg-secondary)' }}>
            <Alert
              style={{ marginBottom: 18 }}
              type="info"
              showIcon
              message="Mark one page as Home and save it in builder so other pages can reuse its header and footer."
            />

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-tertiary)', letterSpacing: 0.5, marginBottom: 8 }}>Add Page</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Input value={newPageTitle} onChange={(e) => setNewPageTitle(e.target.value)} size="large" style={{ borderRadius: 10 }} placeholder="New page title" />
                <Button type="primary" style={{ borderRadius: 10, fontWeight: 900, background: 'var(--accent-primary)', border: 'none', height: 48 }} onClick={createPage}>
                  Add Page
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pages.map((p) => (
                <Card key={p.id} style={{ borderRadius: 16, border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }} bodyStyle={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.title}
                        {p.isHome ? (
                          <Badge style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-primary)' }} count="HOME" />
                        ) : null}
                      </div>
                      <div style={{ color: 'var(--text-tertiary)', fontWeight: 800, fontSize: 13 }}>{p.slug}</div>
                    </div>
                    <Select size="large" value={p.status} style={{ width: 140 }} onChange={(v) => setPages((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: v } : x)))}>
                      <Select.Option value="Draft">Draft</Select.Option>
                      <Select.Option value="Published">Published</Select.Option>
                    </Select>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 14, justifyContent: 'flex-end' }}>
                    <Button type="primary" style={{ borderRadius: 10, fontWeight: 900 }}>Edit</Button>
                    <Button type="primary" danger={false} style={{ borderRadius: 10, fontWeight: 900, background: 'var(--accent-info)', border: 'none', color: '#fff' }}>
                      Preview
                    </Button>
                    <Button type="default" style={{ borderRadius: 10, fontWeight: 900, background: 'rgba(147, 51, 234, 0.12)', borderColor: 'rgba(147, 51, 234, 0.25)', color: 'rgb(147, 51, 234)' }}>
                      Duplicate
                    </Button>
                    <Button danger style={{ borderRadius: 10, fontWeight: 900 }}>
                      Delete
                    </Button>
                  </div>

                  {/* Home toggle: minimal matching spec */}
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      style={{ borderRadius: 10, fontWeight: 900, borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      onClick={() => {
                        setPages((prev) => prev.map((x) => ({ ...x, isHome: x.id === p.id })));
                      }}
                    >
                      Mark as Home
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WebsiteSetupPage;