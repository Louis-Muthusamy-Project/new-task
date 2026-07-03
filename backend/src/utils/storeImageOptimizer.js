'use strict';

/**
 * storeImageOptimizer.js — Store-module image optimization + Asset CDN.
 *
 * All store product/collection/testimonial images already live on
 * Cloudinary (see config/cloudinary.js), which doubles as our Asset CDN.
 * This helper rewrites a stored Cloudinary URL to request an optimized
 * derivative on the fly — auto format (WebP/AVIF where supported), auto
 * quality, and a size cap — instead of always shipping the original
 * full-resolution upload. Cloudinary caches each derivative at the CDN
 * edge after the first request, so repeat storefront visits are served
 * straight from cache.
 *
 * Non-Cloudinary URLs (external image, data URI, empty string) are
 * returned untouched — this only ever *adds* optimization, never breaks
 * an existing reference.
 */

const CLOUDINARY_UPLOAD_MARKER = '/upload/';

// Presets used across the store module's public surfaces so every card,
// grid, and detail view asks Cloudinary for a right-sized image instead of
// re-using one giant original everywhere.
const PRESETS = {
  thumbnail: 'f_auto,q_auto,w_240,h_240,c_fill',
  card: 'f_auto,q_auto,w_480,c_limit',
  detail: 'f_auto,q_auto,w_1200,c_limit',
  avatar: 'f_auto,q_auto,w_96,h_96,c_fill,g_face',
};

/**
 * @param {string} url - a Cloudinary secure_url (or any image URL)
 * @param {keyof PRESETS | string} preset - a named preset above, or a raw
 *   Cloudinary transformation string (e.g. 'w_300,h_300,c_fill')
 * @returns {string} the optimized URL, or the original url if it isn't a
 *   Cloudinary /upload/ URL (or is empty/falsy)
 */
const optimizeImageUrl = (url, preset = 'card') => {
  if (!url || typeof url !== 'string') return url || '';
  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (markerIndex === -1) return url; // not a Cloudinary delivery URL

  const transformation = PRESETS[preset] || preset;
  const insertAt = markerIndex + CLOUDINARY_UPLOAD_MARKER.length;

  // Idempotent: don't double-stack transformations if this URL was already
  // optimized upstream.
  const alreadyTransformed = /^[a-z]_[^/]+\//i.test(url.slice(insertAt));
  if (alreadyTransformed) return url;

  return `${url.slice(0, insertAt)}${transformation}/${url.slice(insertAt)}`;
};

/** Optimizes every string in an array of image URLs (e.g. product.images). */
const optimizeImageList = (urls, preset = 'card') =>
  Array.isArray(urls) ? urls.map((u) => optimizeImageUrl(u, preset)) : [];

module.exports = {
  PRESETS,
  optimizeImageUrl,
  optimizeImageList,
};
