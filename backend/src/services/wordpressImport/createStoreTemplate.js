'use strict';

/**
 * createStoreTemplate.js
 * Stage 9 ("Generate StoreTemplate document") of the WordPress Import
 * Pipeline.
 *
 * Calls the existing `StoreTemplate.create()` with the exact same document
 * shape the existing `POST /api/store-templates` route already builds (see
 * routes/storeTemplatesRoutes.js) — reused, not duplicated — plus two
 * additive, backward-compatible fields (`source`, `sourceMeta`, see
 * models/store/StoreTemplate.js) so WordPress-imported templates stay
 * identifiable in the library without a new collection or a breaking
 * schema change. Every template created before this pipeline existed has
 * no `source` set and reads as the schema default `'manual'`.
 */

const StoreTemplate = require('../../models/store/StoreTemplate');

/**
 * @param {Object} params
 * @param {import('mongoose').Types.ObjectId} [params.templateId]  reserved
 *   _id so Stage 6's Cloudinary folder (`store-templates/${templateId}/assets`)
 *   matches the final document's _id, same convention storeTemplatesRoutes.js
 *   already uses for manual uploads.
 * @param {string} params.name
 * @param {string} [params.category]
 * @param {string} [params.description]
 * @param {string} [params.thumbnail]
 * @param {string} [params.preview]
 * @param {Array}  params.pages              TemplatePageDefinitionSchema[]
 * @param {string} [params.zipCloudinaryUrl] raw ZIP's Cloudinary URL (re-download reference)
 * @param {Object} [params.assetMap]
 * @param {string} [params.status]           'Draft' | 'Published' | 'Archived'
 * @param {string} [params.uploadedByRole]
 * @param {import('mongoose').Types.ObjectId|string} [params.uploadedBy]
 * @param {Object} [params.sourceMeta]       validateTemplate's ValidationReport.meta
 * @returns {Promise<import('mongoose').Document>} the created StoreTemplate
 */
async function createStoreTemplateDocument({
  templateId,
  name,
  category,
  description,
  thumbnail,
  preview,
  pages,
  zipCloudinaryUrl,
  assetMap,
  status,
  uploadedByRole,
  uploadedBy,
  sourceMeta,
}) {
  return StoreTemplate.create({
    _id: templateId || undefined,
    name: name || 'Imported WordPress Site',
    category,
    description,
    thumbnail,
    preview,
    // Full parsed payload (per-page HTML/CSS/asset URLs) alongside the raw
    // ZIP's Cloudinary URL for reference/re-download — identical shape to
    // the existing manual-upload route.
    projectData: { zipCloudinaryUrl: zipCloudinaryUrl || '', assetMap: assetMap || {} },
    pages,
    status: status || 'Draft',
    version: 1,
    uploadedByRole,
    uploadedBy: uploadedBy || null,
    source: 'wordpress-import',
    // `assetKind: 'theme'` makes explicit (in the document itself, not
    // just in code comments) that a WordPress import is a Theme —
    // layout/HTML/CSS/assets/sections/header/footer/menus/widgets — and
    // never carries product/order/customer records. Every Store created
    // from it starts with zero commerce data regardless of what the
    // source WordPress site had; a merchant adds their own
    // products/collections afterward through the normal Store admin.
    sourceMeta: { ...(sourceMeta || {}), assetKind: 'theme' },
  });
}

module.exports = { createStoreTemplateDocument };
