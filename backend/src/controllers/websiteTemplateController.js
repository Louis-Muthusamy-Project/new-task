const multer = require('multer');
const JSZip = require('jszip');

const asyncHandler = require('../utils/asyncHandler');

const Website = require('../models/Website');
const WebsitePage = require('../models/WebsitePage');

const { uploadBufferToCloudinary } = require('../config/cloudinary');


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
    console.log('[upload-template] req.body:', req.body);
    console.log(
      '[upload-template] req.file:',
      req.file
        ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            bufferLength: req.file.buffer?.length,
          }
        : req.file
    );
    console.log('[upload-template] req.files:', req.files);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Attach a file under the "file" field.',
      });
    }

    const { name, folder, websiteName, description, status } = req.body || {};

    const zip = await JSZip.loadAsync(req.file.buffer);

    const htmlPaths = [];
    zip.forEach((relativePath, entry) => {
      if (!entry || entry.dir) return;
      const lower = relativePath.toLowerCase();
      if (/(^|\/)index\.html?$/i.test(lower)) {
        htmlPaths.push(relativePath);
      } else if (/\.html?$/i.test(lower)) {
        htmlPaths.push(relativePath);
      }
    });

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

    const cssByPath = {};
    zip.forEach((relativePath, entry) => {
      if (entry.dir) return;
      if (/\.css$/i.test(relativePath)) {
        cssByPath[relativePath] = entry;
      }
    });

    const inlineCssIntoHtml = async (html, htmlPath) => {
      const htmlDir = htmlPath.includes('/') ? htmlPath.substring(0, htmlPath.lastIndexOf('/') + 1) : '';
      const linkRe = /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*\/?>(?=[\s\S]*?)/gi;
      const linkRe2 = /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']stylesheet["'][^>]*\/?>(?=[\s\S]*?)/gi;

      const replacements = [];

      for (const re of [linkRe, linkRe2]) {
        let match;
        re.lastIndex = 0;
        while ((match = re.exec(html)) !== null) {
          const fullTag = match[0];
          const href = match[1];
          if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('data:')) continue;

          const cssPath = (htmlDir + href).replace(/\\/g, '/').replace(/\/\.\//g, '/');
          const cssEntry = cssByPath[cssPath] || cssByPath[href];

          if (cssEntry) {
            const cssContent = await cssEntry.async('string');
            if (cssContent && cssContent.trim()) {
              replacements.push({ fullTag, cssContent });
              console.log('[upload-template] inlining CSS:', cssPath, '(' + cssContent.length + ' chars)');
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

    const website = await Website.create({
      ownerId: ownerId || new (require('mongoose').Types.ObjectId)(),
      websiteName: resolvedWebsiteName,
      name: resolvedWebsiteName,
      description: description || 'Website Template',
      status: status || 'Draft',
      template: {
        templateId: null,
        templateName: name || null,
        imageUrl: null,
        cloudinaryPublicId: null,
      },
      settings: {
        cloudinary: null,
      },
    });

    const pages = [];
    console.log('[upload-template] creating pages for websiteId:', website._id);

    const ASSET_TYPES = {
      images: new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico']),
      fonts: new Set(['woff', 'woff2', 'ttf', 'otf', 'eot']),
      scripts: new Set(['js']),
    };

    const guessFontMime = (ext) => {
      switch ((ext || '').toLowerCase()) {
        case 'woff2':
          return 'font/woff2';
        case 'woff':
          return 'font/woff';
        case 'ttf':
          return 'font/ttf';
        case 'otf':
          return 'font/otf';
        case 'eot':
          return 'application/vnd.ms-fontobject';
        default:
          return 'font/woff2';
      }
    };

    const guessAssetMime = (ext) => {
      const e = (ext || '').toLowerCase();
      if (ASSET_TYPES.images.has(e)) {
        switch (e) {
          case 'png':
            return 'image/png';
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'webp':
            return 'image/webp';
          case 'gif':
            return 'image/gif';
          case 'svg':
            return 'image/svg+xml';
          case 'ico':
            return 'image/x-icon';
          default:
            return 'application/octet-stream';
        }
      }
      if (ASSET_TYPES.fonts.has(e)) return guessFontMime(e);
      if (ASSET_TYPES.scripts.has(e)) return 'application/javascript';
      return 'application/octet-stream';
    };

    const normalizeZipPath = (p) => (p || '').replace(/\\/g, '/').replace(/^\.\/?/, '');
    const getHtmlDir = (htmlPath) => {
      const p = normalizeZipPath(htmlPath);
      if (p.includes('/')) return p.substring(0, p.lastIndexOf('/') + 1);
      return '';
    };

    const resolveHrefToZipPath = (htmlPath, href, assetIndex) => {
      if (!href || !htmlPath) return null;
      const trimmed = href.trim();
      if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('http') || trimmed.startsWith('//')) return null;

      // Candidate 1: resolve relative to the HTML file's directory (current behavior)
      const baseDir = getHtmlDir(htmlPath);
      const joinedBase = normalizeZipPath(baseDir + trimmed);

      const partsBase = joinedBase.split('/');
      const outBase = [];
      for (const part of partsBase) {
        if (!part || part === '.') continue;
        if (part === '..') outBase.pop();
        else outBase.push(part);
      }
      const baseCandidate = outBase.join('/');

      // Candidate 2: resolve as root-relative (ZIP-root relative)
      // Handles cases like: html in "templates/site/index.html" referencing "images/logo.png"
      // where ZIP stores "images/logo.png" at root.
      const withoutLeadingSlash = trimmed.replace(/^\/+/, '');
      const rootCandidate = normalizeZipPath(withoutLeadingSlash);

      const hasAssetIndexKey = (k) => !!(k && assetIndex && Object.prototype.hasOwnProperty.call(assetIndex, k));

      if (hasAssetIndexKey(rootCandidate)) return rootCandidate;
      if (hasAssetIndexKey(baseCandidate)) return baseCandidate;

      // Fallback: keep previous behavior so we don't break other templates.
      return baseCandidate;
    };



    const uploadZipEntryToCloudinary = async ({ entry, ext, folder, resourceType }) => {
      const buffer = await entry.async('nodebuffer');
      return uploadBufferToCloudinary(buffer, {
        folder,
        resourceType,
      });
    };

    const assetIndex = {};

    zip.forEach((relativePath, entry) => {
      if (!entry || entry.dir) return;
      const p = normalizeZipPath(relativePath);
      const ext = (p.split('.').pop() || '').toLowerCase();
      if (ASSET_TYPES.images.has(ext) || ASSET_TYPES.fonts.has(ext) || ASSET_TYPES.scripts.has(ext)) {
        assetIndex[p] = { entry, ext };
      }
    });

    const convertAssetsInHtml = async (html, htmlPath) => {
      // Instrumentation (for diagnosing missing replacements / css inlining):
      const assetIndexKeys = Object.keys(assetIndex || {});
      console.log('[upload-template][convertAssetsInHtml] htmlPath:', htmlPath);
      console.log('[upload-template][convertAssetsInHtml] assetIndexKeys.length:', assetIndexKeys.length);
      console.log('[upload-template][convertAssetsInHtml] sample assetIndexKeys:', assetIndexKeys.slice(0, 25));

      const maybeReplaceUrl = async (zipPath, context) => {
        console.log('[upload-template][maybeReplaceUrl] context:', context, 'zipPath:', zipPath);

        if (!zipPath) return null;

        const hasZipPath = Object.prototype.hasOwnProperty.call(assetIndex, zipPath);
        console.log(
          '[upload-template][maybeReplaceUrl] has assetIndex[zipPath]?:',
          hasZipPath,
          '| assetIndex[zipPath] exists?:',
          !!assetIndex[zipPath]
        );

        const hit = assetIndex[zipPath];
        if (!hit) return null;

        if (hit.secureUrl) return hit.secureUrl;

        const folder = `website-templates/${website._id}/assets`;
        const resourceType = guessAssetMime(hit.ext).startsWith('image/') ? 'image' : 'raw';

        // Upload to Cloudinary
        const uploadResult = await uploadZipEntryToCloudinary({
          entry: hit.entry,
          ext: hit.ext,
          folder,
          resourceType,
        });

        hit.secureUrl = uploadResult.secure_url;
        hit.publicId = uploadResult.public_id;

        return hit.secureUrl;
      };

      const rewriteMatches = async (re, replacer) => {
        const matches = [];

        let m;
        re.lastIndex = 0;
        while ((m = re.exec(html)) !== null) {
          matches.push({ index: m.index, full: m[0], groups: m.slice(1) });
        }
        let result = '';
        let last = 0;
        for (const match of matches) {
          result += html.slice(last, match.index);
          const replacement = await replacer(match.full, ...match.groups);
          result += replacement;
          last = match.index + match.full.length;
        }
        result += html.slice(last);
        return result;
      };

      let out = html;

      // img src
      out = await rewriteMatches(
        /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
        async (full, href) => {
          const zipPath = resolveHrefToZipPath(htmlPath, href, assetIndex);

          console.log('[upload-template][img] href:', href, 'resolved zipPath:', zipPath);
          const dataUrl = await maybeReplaceUrl(zipPath, 'img');
          if (!dataUrl) return full;
          return full.replace(href, dataUrl);
        }
      );

      // script src
      out = await rewriteMatches(
        /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi,
        async (full, href) => {
          const zipPath = resolveHrefToZipPath(htmlPath, href, assetIndex);

          console.log('[upload-template][script] href:', href, 'resolved zipPath:', zipPath);
          const dataUrl = await maybeReplaceUrl(zipPath, 'script');
          if (!dataUrl) return full;
          return full.replace(href, dataUrl);
        }
      );

      // link href
      out = await rewriteMatches(
        /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi,
        async (full, href) => {
          const zipPath = resolveHrefToZipPath(htmlPath, href, assetIndex);

          console.log('[upload-template][link] href:', href, 'resolved zipPath:', zipPath);
          const dataUrl = await maybeReplaceUrl(zipPath, 'link');
          if (!dataUrl) return full;
          return full.replace(href, dataUrl);
        }
      );

      // url(...) in css/inline styles
      const urlRe = /url\(\s*(['"]?)([^\s'")]+)\1\s*\)/gi;
      out = await rewriteMatches(urlRe, async (full, _q, href) => {
        const zipPath = resolveHrefToZipPath(htmlPath, href, assetIndex);

        console.log('[upload-template][css-url] href:', href, 'resolved zipPath:', zipPath);
        const dataUrl = await maybeReplaceUrl(zipPath, 'css-url');
        return dataUrl ? `url(${dataUrl})` : full;
      });

      return out;
    };

    const convertAssetsInCss = async (css, cssHtmlPath) => {
      if (!css || !css.trim()) return css;

      const maybeReplaceUrl = async (zipPath, context) => {
        if (!zipPath) return null;
        const hit = assetIndex[zipPath];
        if (!hit) return null;
        if (hit.secureUrl) return hit.secureUrl;

        const folder = `website-templates/${website._id}/assets`;
        const resourceType = guessAssetMime(hit.ext).startsWith('image/') ? 'image' : 'raw';

        const uploadResult = await uploadZipEntryToCloudinary({
          entry: hit.entry,
          ext: hit.ext,
          folder,
          resourceType,
        });

        hit.secureUrl = uploadResult.secure_url;
        hit.publicId = uploadResult.public_id;

        return hit.secureUrl;
      };


      // Handles:
      //   background-image: url(images/bg.jpg)
      //   url(...)
      //   src: url(...)
      //   @font-face src: url(...)
      //   url("icon.svg")
      //   SVG references via url(...)
      const cssUrlRe = /url\(\s*(['"]?)([^\s'")]+)\1\s*\)/gi;

      const matches = [];
      let m;
      cssUrlRe.lastIndex = 0;
      while ((m = cssUrlRe.exec(css)) !== null) {
        matches.push({ index: m.index, full: m[0], quote: m[1], href: m[2] });
      }

      let out = '';
      let last = 0;
      for (const match of matches) {
        out += css.slice(last, match.index);

        const zipPath = resolveHrefToZipPath(cssHtmlPath, match.href, assetIndex);
        const dataUrl = await maybeReplaceUrl(zipPath, 'css-url');

        if (dataUrl) {
          // Preserve original quoting style if present; but data URL is safe either way.
          out += match.quote ? `url(${match.quote}${dataUrl}${match.quote})` : `url(${dataUrl})`;
        } else {
          out += match.full;
        }

        last = match.index + match.full.length;
      }
      out += css.slice(last);
      return out;
    };

    const extractCssFromHtml = (htmlString) => {
      if (!htmlString) return '';
      const styleBlocks = [];
      const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
      let m;
      while ((m = styleRe.exec(htmlString)) !== null) {
        const css = (m[1] || '').trim();
        if (css) styleBlocks.push(css);
      }
      return styleBlocks.join('\n');
    };

    const extractBodyHtml = (htmlString) => {
      if (!htmlString) return '';
      const bodyMatch = htmlString.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1] != null) return bodyMatch[1];
      return htmlString;
    };

    for (const { path, html } of validHtml) {
      const fileName = path.split('/').pop();
      const base = fileName.replace(/\.html?$/i, '');
      const isHome = base.toLowerCase() === 'index';

      const pageName = isHome ? 'Home' : normalizeName(base);
      const pageSlug = isHome ? 'home' : slugifyPath(base);

      console.log('[upload-template] creating page:', {
        pageName,
        pageSlug,
        zipHtmlPath: path,
      });

      const htmlWithInlinedCss = await inlineCssIntoHtml(html, path);

      const extractedCss = extractCssFromHtml(htmlWithInlinedCss);
      console.log('[upload-template] extractedCss length:', extractedCss.length, 'pageSlug:', pageSlug);

      const finalHtml = await convertAssetsInHtml(htmlWithInlinedCss, path);
      const bodyHtml = extractBodyHtml(finalHtml);

      // IMPORTANT: convert assets inside extracted CSS (not only inline HTML).
      const finalCss = await convertAssetsInCss(extractedCss, path);
      console.log('[upload-template] finalCss length:', finalCss.length, 'pageSlug:', pageSlug);

      console.log('[upload-template] bodyHtml length:', bodyHtml.length, 'pageSlug:', pageSlug);
      console.log('[upload-template] finalHtml length:', finalHtml.length, 'pageSlug:', pageSlug);

      const page = await WebsitePage.create({
        websiteId: website._id,
        name: pageName,
        slug: pageSlug,
        isHome,
        status: 'Draft',
        content: {
          html: bodyHtml,
          css: finalCss,
          sourcePath: path,
        },
      });

      console.log('[upload-template] created pageId:', page._id, 'pageSlug:', page.slug);
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
