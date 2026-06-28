'use strict';


const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a Buffer to Cloudinary via upload_stream.
 *
 * @param {Buffer} fileBuffer
 * @param {Object} [options]
 * @param {string} [options.folder='media-library']
 *   Cloudinary folder path.
 * @param {'image'|'video'|'raw'|'auto'} [options.resourceType='auto']
 *   Cloudinary resource_type.
 * @param {string} [options.mime]
 *   MIME type of the file.  When resourceType is 'raw' and mime is provided
 *   the delivery Content-Type header is set so browsers receive fonts, CSS,
 *   and other non-image assets with the correct type.
 * @returns {Promise<Object>}  Cloudinary upload result (includes secure_url, public_id …)
 */
const uploadBufferToCloudinary = (fileBuffer, options = {}) => {
  const { folder = 'media-library', resourceType = 'auto', mime } = options;

  const uploadParams = {
    folder,
    resource_type: resourceType,
  };

  // For raw resources Cloudinary serves files as application/octet-stream by
  // default.  Passing the correct MIME as a delivery header fixes:
  //   • @font-face — browsers reject fonts without a font/* MIME type
  //   • <script>   — some environments require application/javascript
  //   • CSS sheets loaded dynamically
  if (mime && resourceType === 'raw') {
    uploadParams.headers = `Content-Type: ${mime}`;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadParams, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

/**
 * Delete an asset from Cloudinary by its public_id.
 *
 * @param {string} publicId
 * @param {Object} [options]
 * @param {'image'|'video'|'raw'} [options.resourceType='image']
 * @returns {Promise<Object>}  Cloudinary destroy result
 */
const deleteFromCloudinary = (publicId, options = {}) => {
  const { resourceType = 'image' } = options;
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { cloudinary, uploadBufferToCloudinary, deleteFromCloudinary };