'use strict';

/**
 * services/store/index.js — Store Engine
 *
 * The centralized service layer for the Store module. Every Store
 * controller (admin CRUD and public storefront alike) is expected to
 * import from here rather than requiring individual model files or
 * duplicating query/validation logic inline.
 *
 * Services:
 *   - productService    (Product Service)
 *   - collectionService (Collection Service)
 *   - orderService       (Order Service)
 *   - customerService    (Customer Service)
 *   - pageService         (Page Service)
 *   - themeService         (Theme Service)
 *   - inventoryService      (Inventory Service)
 *   - discountService        (Discount Service)
 *
 * Cross-service rules (e.g. "placing an order deducts stock and rolls up
 * into the customer record") live inside the owning service (OrderService),
 * which calls the other services rather than every caller re-implementing
 * the interaction itself. See TARGET_ARCHITECTURE_DESIGN.md §2/§5 for the
 * longer-term design this is a first phase of; Website Builder / Site
 * migration is out of scope for this change.
 */

const productService = require('./productService');
const collectionService = require('./collectionService');
const orderService = require('./orderService');
const customerService = require('./customerService');
const pageService = require('./pageService');
const themeService = require('./themeService');
const inventoryService = require('./inventoryService');
const discountService = require('./discountService');
const cartService = require('./cartService');
const customerAuthService = require('./customerAuthService');

module.exports = {
  productService,
  collectionService,
  orderService,
  customerService,
  pageService,
  themeService,
  inventoryService,
  discountService,
  cartService,
  customerAuthService,
};