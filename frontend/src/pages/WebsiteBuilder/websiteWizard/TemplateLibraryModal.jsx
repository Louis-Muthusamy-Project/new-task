import React, { useState, useRef } from "react";
import { Modal, Input, Button, Typography, Space, Row, Col, Select } from "antd";
import {
  LayoutTemplate,
  X as CloseIcon,
  Search as SearchIcon,
  Globe,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
// Requires: npm install jszip
import JSZip from "jszip";

const { Title, Text } = Typography;

/* ---------------------------------------------------------------------- */
/* ZIP -> Pages parsing                                                    */
/* ---------------------------------------------------------------------- */

const TEMPLATEMO_PREFIX_RE = /^templatemo[_-]?\d+[_-]/i;

function toTitleCase(str) {
  return str
    .replace(/[_-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Reads a .zip File and turns every .html/.htm file it finds into a "page".
 * - The root folder name (if the zip contains one) seeds the site name + slug.
 * - index.html (or index.htm) becomes the Home page.
 * - Every other html file becomes an additional page, named from its filename.
 */
async function parseWebsiteZip(file) {
  const zip = await JSZip.loadAsync(file);

  const htmlFiles = [];
  const cssFiles = [];
  const jsFiles = [];
  const imageFiles = [];
  const docFiles = [];

  // Collect file paths (and sizes when available)
  const fileEntries = [];
  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    const lower = relativePath.toLowerCase();
    fileEntries.push({ relativePath, entry });

    if (/\.html?$/i.test(relativePath)) htmlFiles.push(relativePath);
    else if (/\.css$/i.test(relativePath)) cssFiles.push(relativePath);
    else if (/\.js$/i.test(relativePath)) jsFiles.push(relativePath);
    else if (/\.(png|jpe?g|gif|webp|svg|ico|bmp)$/i.test(lower)) imageFiles.push(relativePath);
    else if (/\.(pdf|docx?|xlsx?|pptx?|txt|rtf|zip|rar|7z)$/i.test(lower)) docFiles.push(relativePath);
  });

  if (htmlFiles.length === 0) {
    throw new Error("ZIP must contain at least one HTML page.");
  }

  // Require at least index.html or index.htm
  const hasIndex = htmlFiles.some((filePath) => /(^|\/)index\.html?$/i.test(filePath));
  if (!hasIndex) {
    throw new Error("ZIP must contain an index.html file.");
  }

  // HTML content validation (size/emptiness/basic corruption guard)
  const htmlValidation = await Promise.all(
    htmlFiles.map(async (path) => {
      const entry = zip.file(path);
      if (!entry) return { path, valid: false };
      const size = entry._data?.uncompressedSize ?? entry._data?.size ?? 0;
      if (!size) return { path, valid: false, reason: 'EMPTY' };

      try {
        const text = await entry.async('string');
        const trimmed = (text || '').trim();
        if (!trimmed) return { path, valid: false, reason: 'EMPTY' };

        // quick sanity checks (not a full HTML parser)
        const looksLikeHtml = /<\s*html\b/i.test(trimmed) || /<\s*body\b/i.test(trimmed) || /<\s*head\b/i.test(trimmed);
        if (!looksLikeHtml) {
          // Treat as corrupted/invalid HTML
          return { path, valid: false, reason: 'CORRUPTED' };
        }

        return { path, valid: true };
      } catch (e) {
        return { path, valid: false, reason: 'CORRUPTED' };
      }
    })
  );

  const firstInvalid = htmlValidation.find((v) => !v.valid);
  if (firstInvalid) {
    throw new Error("Uploaded ZIP is not a valid website template.");
  }

  // Asset-only rejection rules
  const hasOnly = (arr) => arr.length > 0;
  const hasCss = cssFiles.length > 0;
  const hasJs = jsFiles.length > 0;
  const hasImages = imageFiles.length > 0;
  const hasDocs = docFiles.length > 0;

  // if zip contains html+index but nothing else that's not required; only reject
  // for the explicit cases requested.
  // Requested reject cases that can still happen with HTML present:
  // - “ZIP contains only assets” (meaning no index.html/index.htm; already handled)
  // - “ZIP contains only images/CSS/JS/documents only” (no HTML; already handled)

  // Derive base slug/site name
  htmlFiles.sort((a, b) => a.split("/").length - b.split("/").length);
  const firstSegments = htmlFiles[0].split("/");
  const rootFolder = firstSegments.length > 1 ? firstSegments[0] : null;

  const rawBase = rootFolder
    ? rootFolder.replace(TEMPLATEMO_PREFIX_RE, "")
    : file.name.replace(/\.zip$/i, "");

  const baseSlug = slugify(rawBase) || slugify(file.name.replace(/\.zip$/i, "")) || "site";
  const siteName = toTitleCase(rawBase) || "Untitled Site";

  let pages = htmlFiles.map((path) => {
    const fileName = path.split("/").pop();
    const baseName = fileName.replace(/\.html?$/i, "");
    const isHome = baseName.toLowerCase() === "index";
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: isHome ? siteName : toTitleCase(baseName),
      slug: isHome ? `/${baseSlug}` : `/${baseSlug}-${slugify(baseName)}`,
      isHome,
      status: "Draft",
      sourcePath: path,
    };
  });

  // Guarantee exactly one Home page.
  if (!pages.some((p) => p.isHome)) {
    pages = pages.map((p, i) => (i === 0 ? { ...p, isHome: true } : p));
  }

  pages.sort((a, b) =>
    a.isHome === b.isHome ? a.name.localeCompare(b.name) : a.isHome ? -1 : 1
  );

  return {
    siteName,
    baseSlug,
    pages,
    fileCount: htmlFiles.length,
    warnings: {
      cssMissing: !hasCss,
      jsMissing: !hasJs,
      imagesMissing: !hasImages,
      documentsOnly: hasDocs && !hasImages && !hasCss && !hasJs,
    },
  };
}

/* ---------------------------------------------------------------------- */
/* Demo template catalog (prebuilt templates shown in the grid)            */
/* ---------------------------------------------------------------------- */

const CATEGORIES = [
  "Digital Marketing Agency",
  "Real Estate Company",
  "Hospital / Clinic",
  "Restaurant / Cafe",
  "Educational Institute",
  "IT / Software Company",
  "Construction Company",
  "Fashion / Boutique",
];

const CATEGORY_ACCENTS = {
  "Digital Marketing Agency": "linear-gradient(135deg, #be185d, #500724)",
  "Real Estate Company": "linear-gradient(135deg, #0f766e, #042f2e)",
  "Hospital / Clinic": "linear-gradient(135deg, #0369a1, #082f49)",
  "Restaurant / Cafe": "linear-gradient(135deg, #b45309, #451a03)",
  "Educational Institute": "linear-gradient(135deg, #4338ca, #1e1b4b)",
  "IT / Software Company": "linear-gradient(135deg, #1f2937, #030712)",
  "Construction Company": "linear-gradient(135deg, #92400e, #292524)",
  "Fashion / Boutique": "linear-gradient(135deg, #9d174d, #4a044e)",
};

const PREBUILT_TEMPLATES = [
  { id: "t1", name: "Eternal Test Series", category: "Educational Institute" },
  { id: "t2", name: "Bright Future Academy", category: "Educational Institute" },
  { id: "t3", name: "SmartLearn Institute", category: "Educational Institute" },
  { id: "t4", name: "Excel Coaching Center", category: "Educational Institute" },
  { id: "t5", name: "Apex Digital Agency", category: "Digital Marketing Agency" },
  { id: "t6", name: "Skyline Realty Group", category: "Real Estate Company" },
  { id: "t7", name: "CarePoint Clinic", category: "Hospital / Clinic" },
  { id: "t8", name: "Maple & Vine Cafe", category: "Restaurant / Cafe" },
  { id: "t9", name: "NimbusStack IT", category: "IT / Software Company" },
  { id: "t10", name: "Granite & Co. Builders", category: "Construction Company" },
  { id: "t11", name: "Velour Boutique", category: "Fashion / Boutique" },
];

/* ---------------------------------------------------------------------- */

const TemplateLibraryModal = ({ open, onCancel, onCreate, initialWebsiteName }) => {
  const [websiteName, setWebsiteName] = useState(initialWebsiteName || "");
  const [activeCategory, setActiveCategory] = useState("Educational Institute");
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [customTemplates, setCustomTemplates] = useState([]); // uploaded-to-library zips
  const [showUploadPanel, setShowUploadPanel] = useState(true);
  const [zipFile, setZipFile] = useState(null);
  const [zipTemplateName, setZipTemplateName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedNotice, setUploadedNotice] = useState(null);
  const fileInputRef = useRef(null);

  const resetZipPanel = () => {
    setZipFile(null);
    setZipTemplateName("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setError(null);
    setZipFile(file);
  };

  // "Upload" — adds the ZIP to "Created by you" without creating a site yet.
  const handleUploadToLibrary = async () => {
    if (!zipFile) {
      setError("Choose a .zip file first.");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const parsed = await parseWebsiteZip(zipFile);
      const entry = {
        id: `custom-${Date.now()}`,
        name: zipTemplateName.trim() || parsed.siteName,
        category: "Created by you",
        custom: true,
        parsed,
      };
      setCustomTemplates((prev) => [entry, ...prev]);
      setUploadedNotice(`"${entry.name}" was added to Created by you.`);
      resetZipPanel();
    } catch (err) {
      setError(err.message || "Couldn't read that ZIP.");
    } finally {
      setParsing(false);
    }
  };

  // "Create from ZIP" — parses the ZIP and immediately creates + opens the website.
  const handleCreateFromZip = async () => {
    if (!zipFile) {
      setError("Choose a .zip file first.");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const parsed = await parseWebsiteZip(zipFile);
      const finalName = websiteName.trim() || zipTemplateName.trim() || parsed.siteName;

      // Upload ZIP to Cloudinary via backend and persist returned URL
      let cloudinaryUrl = '';
      try {
        const { websiteWizardCloudinaryApi } = await import('../../../api/websiteWizardCloudinaryApi');
        const resp = await websiteWizardCloudinaryApi.uploadTemplateZipToCloudinary({
          file: zipFile,
          name: zipTemplateName.trim() || parsed.siteName,
        });

        // Debug required by task
        console.log('response.website._id:', resp?.website?._id);
        console.log('response.pages.length:', Array.isArray(resp?.pages) ? resp.pages.length : 'not-an-array');

        // New backend response shape: { website, pages }
        cloudinaryUrl = resp?.website?.templateZipCloudinaryUrl || resp?.cloudinaryUrl || '';
      } catch (uploadErr) {
        // Cloudinary failing shouldn't block creating the website draft; but we show the error.
        setError(uploadErr?.message || 'Cloudinary upload failed');
      }

      onCreate({
        // IMPORTANT: pass the real backend-created website + pages so the editor
        // can fetch/render immediately using the correct MongoDB websiteId.
        website: resp?.website,
        websiteName: finalName,
        description: "Website Template",
        source: "zip",
        templateName: zipTemplateName.trim() || parsed.siteName,
        templateZipCloudinaryUrl: cloudinaryUrl,
        pages: resp?.pages || parsed.pages,
      });
    } catch (err) {
      setError(err.message || "Couldn't read that ZIP.");
    } finally {
      setParsing(false);
    }
  };

  // Bottom bar "Create Website" — uses the selected prebuilt/custom template card.
  const handleCreateFromTemplate = () => {
    const all = [...customTemplates, ...PREBUILT_TEMPLATES];
    const template = all.find((t) => t.id === selectedTemplate);
    if (!template || !websiteName.trim()) return;

    const pages = template.custom
      ? template.parsed.pages
      : [
          { id: `${Date.now()}-home`, name: "Home", slug: "/", isHome: true, status: "Draft" },
          { id: `${Date.now()}-about`, name: "About", slug: "/about", isHome: false, status: "Draft" },
          { id: `${Date.now()}-contact`, name: "Contact", slug: "/contact", isHome: false, status: "Draft" },
        ];

    onCreate({
      websiteName: websiteName.trim(),
      description: "Website Template",
      source: "template",
      templateName: template.name,
      pages,
    });
  };

  const visibleTemplates = [...customTemplates, ...PREBUILT_TEMPLATES].filter((t) => {
    const matchesCategory = activeCategory === "All" || t.category === activeCategory || t.custom;
    const matchesSearch = !search.trim() || t.name.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1100}
      title={
        <Title level={4} style={{ margin: 0, fontSize: 18, color: "var(--text-primary)" }}>
          Template Library
        </Title>
      }
      closeIcon={
        <Button
          type="text"
          icon={<CloseIcon size={20} />}
          onClick={onCancel}
          style={{ color: "var(--text-secondary)" }}
        />
      }
      style={{ top: 30 }}
      styles={{ body: { padding: 0, overflow: "hidden" } }}
      className="glassmorphism-modal"
    >
      <div style={{ display: "flex", height: "82vh", maxHeight: 820 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 240,
            borderRight: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
            <div
              onClick={() => setActiveCategory("All")}
              style={{
                background: activeCategory === "All" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                color: activeCategory === "All" ? "var(--accent-info)" : "var(--text-primary)",
                padding: "10px 12px",
                borderRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <span>All Templates</span>
              <Text type="secondary" style={{ fontSize: 12, color: "inherit" }}>
                506
              </Text>
            </div>

            <div
              style={{
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text-primary)",
                marginBottom: 4,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <span>Jeema templates</span>
              <Text type="secondary" style={{ fontSize: 12 }}>500</Text>
            </div>

            <div
              onClick={() => setActiveCategory("Created by you")}
              style={{
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: activeCategory === "Created by you" ? "var(--accent-info)" : "var(--text-primary)",
                background: activeCategory === "Created by you" ? "rgba(59, 130, 246, 0.1)" : "transparent",
                borderRadius: 8,
                marginBottom: 20,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <span>Created by you</span>
              <Text type="secondary" style={{ fontSize: 12, color: "inherit" }}>
                {3 + customTemplates.length}
              </Text>
            </div>

            <Text
              type="secondary"
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, display: "block" }}
            >
              BROWSE CATEGORIES
            </Text>

            <Space orientation="vertical" style={{ width: "100%" }} size={2}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: activeCategory === cat ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  }}
                >
                  <span
                    style={{
                      color: activeCategory === cat ? "var(--accent-info)" : "var(--text-secondary)",
                      fontWeight: activeCategory === cat ? 700 : 500,
                      fontSize: 14,
                    }}
                  >
                    {cat}
                  </span>
                  <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>50</span>
                </div>
              ))}
            </Space>
          </div>

          <div style={{ padding: 16, borderTop: "1px solid var(--border-color)" }}>
            <Button block style={{ borderRadius: 8, height: 40, fontWeight: 600 }}>
              Manage library
            </Button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)", minWidth: 0 }}>
          <div style={{ padding: 24, borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <Title level={4} style={{ margin: 0, fontSize: 18, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Globe size={18} color="var(--accent-info)" /> Websites
                </Title>
                <Text type="secondary">Prebuilt templates &amp; your uploads</Text>
              </div>
              <Space>
                <Button icon={<UploadCloud size={16} />} onClick={() => setShowUploadPanel((v) => !v)} style={{ borderRadius: 8, height: 40, fontWeight: 600 }}>
                  Upload ZIP
                </Button>
                <Input
                  placeholder="Search templates..."
                  prefix={<SearchIcon size={16} color="var(--text-tertiary)" />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 220, borderRadius: 8, height: 40 }}
                />
              </Space>
            </div>

            {/* Upload ZIP panel */}
            {showUploadPanel && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <Text style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, display: "block", marginBottom: 14 }}>
                ZIP with <code style={{ background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: 4 }}>index.html</code> and assets folders.
              </Text>

              <Row gutter={16}>
                <Col span={12}>
                  <Input
                    placeholder="Template name (optional)"
                    value={zipTemplateName}
                    onChange={(e) => setZipTemplateName(e.target.value)}
                    style={{ borderRadius: 8, height: 40 }}
                  />
                </Col>
                <Col span={12}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    style={{
                      width: "100%",
                      height: 40,
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </Col>
              </Row>

              <Space style={{ marginTop: 14 }}>
                <Button
                  type="primary"
                  loading={parsing}
                  onClick={handleUploadToLibrary}
                  style={{ backgroundColor: "var(--accent-success)", border: "none", borderRadius: 8, height: 40, fontWeight: 700, padding: "0 20px" }}
                >
                  Upload
                </Button>
                <Button
                  loading={parsing}
                  onClick={handleCreateFromZip}
                  style={{ borderRadius: 8, height: 40, fontWeight: 700, padding: "0 20px", borderColor: "var(--accent-success)", color: "var(--accent-success)" }}
                >
                  Create from ZIP
                </Button>
              </Space>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "var(--accent-danger)", fontSize: 13, fontWeight: 600 }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              {uploadedNotice && !error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, color: "var(--accent-success)", fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={15} /> {uploadedNotice}
                </div>
              )}
            </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <Row gutter={[24, 24]}>
              {visibleTemplates.map((template) => (
                <Col span={12} key={template.id}>
                  <div
                    onClick={() => setSelectedTemplate(template.id)}
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: selectedTemplate === template.id ? "2px solid var(--accent-info)" : "1px solid var(--border-color)",
                      boxShadow: selectedTemplate === template.id ? "0 4px 20px rgba(59, 130, 246, 0.15)" : "var(--shadow-sm)",
                      background: "var(--bg-secondary)",
                    }}
                  >
                    <div
                      style={{
                        background: template.custom
                          ? "linear-gradient(135deg, #0891b2, #083344)"
                          : CATEGORY_ACCENTS[template.category] || "linear-gradient(135deg, #374151, #111827)",
                        padding: "14px 16px",
                        color: "#fff",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: "rgba(255,255,255,0.25)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: 12,
                            }}
                          >
                            {template.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{template.name}</span>
                        </div>
                        <span style={{ background: "rgba(255,255,255,0.25)", padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                          {template.custom ? `${template.parsed.fileCount} pages` : "Apply now"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 10, fontSize: 10, opacity: 0.85, fontWeight: 600, flexWrap: "wrap" }}>
                        {(template.custom
                          ? template.parsed.pages.map((p) => p.name)
                          : ["Home", "About", "Services", "Results", "Blog", "Contact"]
                        ).map((n) => (
                          <span key={n}>{n}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{template.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{template.category}</div>
                    </div>
                  </div>
                </Col>
              ))}
              {visibleTemplates.length === 0 && (
                <Col span={24}>
                  <Text type="secondary">No templates match "{search}".</Text>
                </Col>
              )}
            </Row>
          </div>

          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ width: 300 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Website name</div>
              <Input
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                placeholder="My new website"
                style={{ borderRadius: 8, height: 44, fontSize: 15 }}
              />
            </div>

            <Space>
              <Button
                onClick={onCancel}
                style={{
                  borderRadius: 8,
                  height: 44,
                  fontWeight: 600,
                  borderColor: "var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  padding: "0 24px",
                }}
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={handleCreateFromTemplate}
                disabled={!websiteName.trim() || !selectedTemplate}
                style={{
                  backgroundColor: "var(--accent-info)",
                  border: "none",
                  borderRadius: 8,
                  height: 44,
                  fontWeight: 700,
                  padding: "0 24px",
                }}
                icon={<LayoutTemplate size={16} />}
              >
                Create Website
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateLibraryModal;