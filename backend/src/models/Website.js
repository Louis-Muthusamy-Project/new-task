const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema(
  {
    // Optional: link to the logged-in user, remove if you don't have auth
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // NOTE: Controller `uploadTemplateZipToCloudinary()` creates documents using:
    //   - ownerId
    //   - name
    //   - status
    // so these fields must exist in the schema.

    // --- Data coming from TemplateLibraryModal.jsx upload ---
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, trim: true, required: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft', index: true },
    description: { type: String, trim: true },

    // Compatibility: keep original expected field as well.
    // (Some flows might populate `websiteName` instead of `name`.)
    websiteName: { type: String, trim: true },

    domain: { type: String, trim: true },
    category: { type: String, trim: true },

    template: {
      templateId: { type: String },
      templateName: { type: String },
      imageUrl: { type: String },
      cloudinaryPublicId: { type: String },
    },

    // Catch-all for any other setup-page fields you collect
    // (colors, fonts, sections, layout config, etc.) without needing
    // to keep editing the schema every time the form changes.
    settings: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Website", websiteSchema);
