const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema(
  {
    // Optional: link to the logged-in user, remove if you don't have auth
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // --- Data coming from WebsiteSetupPage.jsx ---
    websiteName: { type: String, required: true, trim: true },
    domain: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },

    // --- Data coming from TemplateLibraryModal.jsx upload ---
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
