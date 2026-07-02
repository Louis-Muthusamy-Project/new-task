const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');


router.use('/health', healthRoutes);

// Mount routes
router.use('/website-builder', require('./websiteRoutes'));
router.use('/website-builder', require('./pageRoutes'));
router.use('/website-builder', require('./mediaRoutes'));
router.use('/website-builder', require('./publishRoutes'));
router.use('/website-builder', require('./formRoutes'));
router.use('/website-builder', require('./domainRoutes'));
router.use('/website-builder', require('./blogRoutes'));
router.use('/website-builder', require('./qrCodeRoutes'));
router.use('/website-builder', require('./chatWidgetRoutes'));

// Templates endpoint used by WebsiteTemplatePage.jsx
router.use('/templates', require('./templatesRoutes'));

// Website template ZIP upload used by websiteWizardCloudinaryApi.js
router.use('/website', require('./websiteRoutesTemplates'));

// Store templates endpoint used by StoreTemplateLibraryModal.jsx
router.use('/store-templates', require('./storeTemplatesRoutes'));

// Store template ZIP upload (same pipeline as website, separate collections)
router.use('/store', require('./storeRoutesTemplates'));

// Store page CRUD used by the GrapesJS builder (BccBuilder) when editing
// StorePage documents — Store-module counterpart of pageRoutes.js.
router.use('/store', require('./storePageRoutes'));

// Public storefront data (products/collections/testimonials/search) used by
// the GrapesJS "Dynamic Blocks" — Store-module counterpart of nothing else,
// this is new surface area for rendering real data inside store blocks.
router.use('/store', require('./storeStorefrontRoutes'));

// Admin Products CRUD (Create/Edit/Delete, Images, Inventory, Price, SEO)
// used by the Products tab in StoresTab.jsx.
router.use('/store', require('./productRoutes'));

// Admin Collections CRUD (Create/Edit/Delete + Products link) used by the
// Collections tab in StoresTab.jsx.
router.use('/store', require('./collectionRoutes'));

// Admin Customers CRUD (Create/Edit/Delete) used by the Customers tab in
// StoresTab.jsx.
router.use('/store', require('./customerRoutes'));

module.exports = router;