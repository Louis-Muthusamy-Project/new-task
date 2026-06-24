const multer = require('multer');
const JSZip = require('jszip');

const asyncHandler = require('../utils/asyncHandler');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

const Website = require('../models/Website');
const WebsitePage = require('../models/WebsitePage');

// multer middleware (in-memory) for this controller
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

/**
 * POST /api/website/upload-template
 * Expects multipart/form-data with field name: file
 * Optional fields:
 *   - name
 *   - folder
 */
const uploadTemplateZipToCloudinary = asyncHandler(async (req, res) => {
  try {
    // Requested logging (safe-ish)
    console.log('[upload-template] req.body:', req.body);
    console.log('[upload-template] req.file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length,
    } : req.file);
    console.log('[upload-template] req.files:', req.files);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Attach a file under the "file" field.',
      });
    }

    const { name, folder, websiteName, description, status } = req.body || {};

    // Validate Cloudinary env (common root-cause on second request after env reload/first failure)
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary environment variables are not set (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).',
      });
    }

    // We treat templates ZIPs as "raw" in Cloudinary.
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: folder || 'website-templates',
      resourceType: 'raw',
    });

    console.log('[upload-template] cloudinary uploadResult keys:', uploadResult ? Object.keys(uploadResult) : uploadResult);
    if (!uploadResult?.public_id || !uploadResult?.secure_url) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary upload returned an unexpected result (missing public_id or secure_url).',
      });
    }

    // -------------------------
    // JEEMA-style import flow
    // -------------------------
    const zip = await JSZip.loadAsync(req.file.buffer);

    const htmlPaths = [];

    zip.forEach((relativePath, entry) => {
      if (!entry || entry.dir) return;
    const lower = relativePath.toLowerCase();
    if (/(^|\/)index\.html?$/.test(lower)) {
      htmlPaths.push(relativePath);
    } else if (/\.html?$/.test(lower)) {
      htmlPaths.push(relativePath);
    }
  });

  // Require at least one index.html or index.htm
  const hasIndex = htmlPaths.some((p) => /(^|\/)index\.html?$/i.test(p));
  if (!hasIndex) {
    return res.status(400).json({
      success: false,
      error: 'ZIP must contain an index.html or index.htm file.',
    });
  }

  const normalizeName = (s) => {
    return (s || '')
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const slugifyPath = (s) => {
    return (s || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[_\s]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const htmlFileData = await Promise.all(
    htmlPaths.map(async (path) => {
      const entry = zip.file(path);
      if (!entry) return null;
      const html = await entry.async('string');
      return { path, html: (html || '').toString() };
    })
  );

  const validHtml = htmlFileData.filter(Boolean).filter((x) => x.html.trim().length > 0);
  if (validHtml.length === 0) {
    return res.status(400).json({ success: false, error: 'Uploaded ZIP contains HTML files but they are empty.' });
  }

  // Collect all CSS files from the ZIP so we can inline them into the HTML.
  // This is necessary because relative paths like href="css/style.css" break
  // when the HTML is rendered in a new window via document.write().
  const cssByPath = {};
  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    if (/\.css$/i.test(relativePath)) {
      cssByPath[relativePath] = entry;
    }
  });

  /**
   * Given HTML content and the file's own path inside the ZIP, find all
   * <link rel="stylesheet" href="..."> references and inline the CSS content
   * as <style> blocks so that the page renders correctly without the original
   * asset files.
   */
  const inlineCssIntoHtml = async (html, htmlPath) => {
    const htmlDir = htmlPath.includes('/') ? htmlPath.substring(0, htmlPath.lastIndexOf('/') + 1) : '';
    const linkRe = /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*\/?>/gi;
    const linkRe2 = /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']stylesheet["'][^>]*\/?>/gi;

    const replacements = [];

    for (const re of [linkRe, linkRe2]) {
      let match;
      re.lastIndex = 0;
      while ((match = re.exec(html)) !== null) {
        const fullTag = match[0];
        const href = match[1];
        if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('data:')) continue;

        // Resolve relative path from the HTML file's directory inside the ZIP
        const cssPath = (htmlDir + href).replace(/\\/g, '/').replace(/\/\.\//g, '/');
        const cssEntry = cssByPath[cssPath] || cssByPath[href];

        if (cssEntry) {
          try {
            const cssContent = await cssEntry.async('string');
            if (cssContent && cssContent.trim()) {
              replacements.push({ fullTag, cssContent });
              console.log('[upload-template] inlining CSS:', cssPath, '(' + cssContent.length + ' chars)');
            }
          } catch (e) {
            console.warn('[upload-template] failed to read CSS:', cssPath, e.message);
          }
        } else {
          console.warn('[upload-template] CSS file not found in ZIP:', cssPath, '(href:', href + ')');
        }
      }
    }

    let result = html;
    for (const { fullTag, cssContent } of replacements) {
      result = result.replace(fullTag, `<style>\n${cssContent}\n</style>`);
    }
    return result;
  };

  const resolvedWebsiteName = (websiteName || name || req.file.originalname || 'Imported Website').toString();
  const ownerId = req?.user?.id || req?.user?._id;

  // Create Website
  // NOTE: keep both `name` and `websiteName` fields populated to avoid
  // mismatches between different controller/UI code paths.
  const website = await Website.create({

    // Website schema in this repo uses `ownerId` as required.
    // ZIP endpoint is public; if unauthenticated, we set a placeholder owner.
    // (JWT auth will populate req.user in secured flows.)
    ownerId: ownerId || new (require('mongoose').Types.ObjectId)(),





    websiteName: resolvedWebsiteName,
    name: resolvedWebsiteName,



    description: description || 'Website Template',
    status: status || 'Draft',
    template: {
      templateId: null,
      templateName: name || null,
      imageUrl: null,
      cloudinaryPublicId: uploadResult.public_id,
    },
    settings: {
      cloudinary: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    },
  });

  // Create pages
  const pages = [];
  console.log('[upload-template] creating pages for websiteId:', website._id);
  for (const { path, html } of validHtml) {
    const fileName = path.split('/').pop();
    const base = fileName.replace(/\.html?$/i, '');
    const isHome = base.toLowerCase() === 'index';

    const pageName = isHome ? 'Home' : normalizeName(base);

    // Normalize slug format to match the normal page-creation flow.
    // Normal flow uses: home/about/contact (no leading slash).
    // ZIP import should do the same.
    const pageSlug = isHome ? 'home' : slugifyPath(base);

    // FIX: Inline CSS from ZIP files so the stored HTML renders correctly
    // without needing the original asset files.
    console.log('[upload-template] inlining CSS for page:', pageName, 'path:', path);
    const htmlWithInlinedCss = await inlineCssIntoHtml(html, path);

    const page = await WebsitePage.create({
      websiteId: website._id,
      name: pageName,
      slug: pageSlug,
      isHome,
      status: 'Draft',
      content: {
        html: htmlWithInlinedCss,
        sourcePath: path,
      },
    });

    console.log('[upload-template] created pageId:', page._id, 'slug:', page.slug, 'htmlLength:', htmlWithInlinedCss.length);
    pages.push(page);
  }

  console.log('[upload-template] DONE import. websiteId:', website._id, 'pageCount:', pages.length);

    res.status(200).json({
    success: true,
    website,
    pages,
  });
  } catch (error) {
    console.error('[upload-template] Fatal error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
});


module.exports = {
  upload,
  uploadTemplateZipToCloudinary,
};