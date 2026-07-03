// storeImageCdn.js — Store-module image optimization + Asset CDN (frontend).
//
// Mirrors backend/src/utils/storeImageOptimizer.js: store images are
// already hosted on Cloudinary, which is our Asset CDN. This rewrites a
// Cloudinary secure_url to request a right-sized, auto-format/auto-quality
// derivative (WebP/AVIF where the browser supports it) instead of always
// downloading the full-resolution original into an admin thumbnail. Any
// non-Cloudinary URL (external link, data URI, blob:, empty) is returned
// untouched.

const CLOUDINARY_UPLOAD_MARKER = "/upload/";

export const STORE_IMAGE_PRESETS = {
  thumbnail: "f_auto,q_auto,w_240,h_240,c_fill",
  card: "f_auto,q_auto,w_480,c_limit",
  detail: "f_auto,q_auto,w_1200,c_limit",
  avatar: "f_auto,q_auto,w_96,h_96,c_fill,g_face",
};

/**
 * @param {string} url - a Cloudinary secure_url (or any image URL)
 * @param {keyof STORE_IMAGE_PRESETS | string} preset
 * @returns {string}
 */
export function optimizeStoreImageUrl(url, preset = "thumbnail") {
  if (!url || typeof url !== "string") return url || "";
  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (markerIndex === -1) return url;

  const transformation = STORE_IMAGE_PRESETS[preset] || preset;
  const insertAt = markerIndex + CLOUDINARY_UPLOAD_MARKER.length;

  // Idempotent — don't double-stack transformations.
  const alreadyTransformed = /^[a-z]_[^/]+\//i.test(url.slice(insertAt));
  if (alreadyTransformed) return url;

  return `${url.slice(0, insertAt)}${transformation}/${url.slice(insertAt)}`;
}
