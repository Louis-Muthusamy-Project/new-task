const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 *
 * @param {Buffer} fileBuffer - Raw file contents.
 * @param {Object} [options]
 * @param {string} [options.folder='media-library'] - Cloudinary folder.
 * @param {string} [options.resourceType='auto'] - 'image' | 'video' | 'raw' | 'auto'.
 * @returns {Promise<Object>} Cloudinary upload result.
 */
const uploadBufferToCloudinary = (fileBuffer, options = {}) => {
  const { folder = 'media-library', resourceType = 'auto' } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );


    uploadStream.end(fileBuffer);
  });
};


/**
 * Deletes an asset from Cloudinary by its public_id.
 *
 * @param {string} publicId
 * @param {Object} [options]
 * @param {string} [options.resourceType='image'] - 'image' | 'video' | 'raw'.
 * @returns {Promise<Object>} Cloudinary destroy result.
 */
const deleteFromCloudinary = (publicId, options = {}) => {
  const { resourceType = 'image' } = options;
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};
