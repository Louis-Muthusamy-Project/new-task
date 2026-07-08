'use strict';

/**
 * storePageController.js — mirrors controllers/pageController.js.
 *
 * Thin HTTP layer over Store Engine's Page Service, backing the same
 * GrapesJS builder (BccBuilder) so it can load and save StorePage
 * documents instead of WebsitePage documents. Ownership/ slug/ home-page
 * rules all live in services/store/pageService.js.
 */

const { pageService } = require('../../services/store');

/**
 * GET /api/store/pages/:id
 * Fetches a single store page by id, including its full page builder JSON
 * content. Ownership is enforced via the page's parent store.
 */
exports.getStorePageById = async (req, res) => {
  // Prevent browser/express conditional caching (ETag -> 304) for editor reads.
  // This keeps GrapesJS always working with the latest payload.
  res.set('Cache-Control', 'no-store');
  res.removeHeader('ETag');
  res.removeHeader('Last-Modified');

  const { id } = req.params;
  const page = await pageService.getPageById(id, req.user);

  res.status(200).json({
    success: true,
    data: page,
  });
};

/**
 * PUT /api/store/pages/:id
 * Replaces page metadata and/or page builder JSON content. Ownership is
 * enforced via the page's parent store.
 */
exports.updateStorePage = async (req, res) => {
  const { id } = req.params;
  const updatedPage = await pageService.updatePage(id, req.body, req.user);

  res.status(200).json({
    success: true,
    data: updatedPage,
  });
};