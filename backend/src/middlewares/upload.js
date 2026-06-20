const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "website-templates",
    // allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    transformation: [{ width: 1600, crop: "limit" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cap, adjust as needed
});

module.exports = upload;
