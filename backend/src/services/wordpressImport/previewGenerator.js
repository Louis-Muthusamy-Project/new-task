'use strict';

/**
 * previewGenerator.js
 * Derives a thumbnail/preview image for the resulting StoreTemplate's
 * library card.
 *
 * Nothing in the existing pipeline generates this today — a manual ZIP
 * upload leaves `thumbnail`/`preview` for the operator to type into the
 * upload form (see storeTemplatesRoutes.js). A WordPress import has no
 * operator-supplied image, so this stage picks a reasonable one
 * automatically from assets Stage 6 already uploaded to Cloudinary,
 * instead of leaving the template imageless in the library grid.
 *
 * Read-only: never re-uploads or transforms anything, only selects a URL
 * that already exists in the parsed output.
 */

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i;
const CLOUDINARY_IMAGE_DELIVERY_RE = /\/image\/upload\//;

const firstImgSrc = (html = '') => {
  const IMG_RE = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i;
  const m = IMG_RE.exec(html);
  return m ? m[1] : null;
};

/**
 * @param {{ pages: Array, assetMap: Object }} parsed
 *   pages/assetMap as returned by uploadAssets.uploadAndRewriteAssets()
 * @returns {{ thumbnail: string, preview: string }}
 */
function generatePreview({ pages = [], assetMap = {} } = {}) {
  const homePage = pages.find((p) => p.isHome) || pages[0];

  // 1. Prefer the first <img> on the home page — already rewritten to a
  //    Cloudinary CDN URL by Stage 6/7, so it's guaranteed reachable.
  let thumbnail = firstImgSrc(homePage?.content?.html) || '';

  // 2. Fall back to the first image-looking asset uploaded anywhere in the
  //    export, in case the home page's hero markup uses a CSS
  //    background-image rather than a plain <img> tag.
  if (!thumbnail) {
    thumbnail =
      Object.values(assetMap).find(
        (url) => IMAGE_EXT_RE.test(url || '') || CLOUDINARY_IMAGE_DELIVERY_RE.test(url || '')
      ) || '';
  }

  // No separately-hosted "live preview" exists for a template that hasn't
  // been instantiated into a Store yet — reuse the same thumbnail so both
  // the library card and any future "Preview" action have something to
  // show, rather than leaving `preview` blank.
  const preview = thumbnail;

  return { thumbnail, preview };
}

module.exports = { generatePreview };
