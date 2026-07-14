'use strict';

/**
 * inventoryService.js — Inventory Service
 *
 * The single place that understands what "in stock" means for a
 * StoreProduct. Before this service existed, "is this in stock" was
 * computed inline inside storeStorefrontController's `toPublicProduct`
 * mapper, and nothing ever decremented `inventoryQuantity` when an order
 * was placed — every consumer that cared about stock would have had to
 * duplicate that logic itself. Now ProductService, OrderService, and the
 * public storefront mapper all call through here instead.
 *
 * Business rules owned by this service:
 *   - A product with `trackInventory: false` is always considered in stock.
 *   - A product with `trackInventory: true` is in stock while
 *     `inventoryQuantity > 0`.
 *   - Stock can never be adjusted below zero.
 */

const mongoose = require('mongoose');
const StoreProduct = require('../../models/store/StoreProduct');
const { notFoundError, badRequestError } = require('./errors');
const { emitStoreEvent } = require('./storeEvents');

const emitInventoryUpdated = (storeId, product) => {
  emitStoreEvent(storeId, 'inventory.updated', {
    productId: product._id,
    inventoryQuantity: product.inventoryQuantity,
    trackInventory: product.trackInventory,
    inStock: isInStock(product),
  });
};

/**
 * True if `product` (a StoreProduct doc or lean object) currently has
 * stock available for purchase.
 */
function isInStock(product, variantId) {
  if (!product) return false;
  if (!product.trackInventory) return true;
  
  if (variantId && product.variants && product.variants.length > 0) {
    const variant = product.variants.find(v => String(v._id) === String(variantId));
    return variant ? (variant.inventoryQuantity || 0) > 0 : false;
  }
  
  if (product.variants && product.variants.length > 0) {
    return product.variants.some(v => (v.inventoryQuantity || 0) > 0);
  }
  
  return (product.inventoryQuantity || 0) > 0;
}

/**
 * Reads the current stock level for a single product, scoped to a store.
 */
async function getInventory(storeId, productId, variantId) {
  const product = await StoreProduct.findOne({
    _id: productId,
    storeId,
    isDeleted: false,
  })
    .select('title sku inventoryQuantity trackInventory variants')
    .lean();
  if (!product) throw notFoundError('Product not found.');

  let inventoryQuantity = product.inventoryQuantity;
  let sku = product.sku;
  
  if (variantId && product.variants && product.variants.length > 0) {
    const variant = product.variants.find(v => String(v._id) === String(variantId));
    if (variant) {
      inventoryQuantity = variant.inventoryQuantity;
      sku = variant.sku;
    }
  }

  return {
    productId: product._id,
    variantId: variantId || null,
    title: product.title,
    sku,
    trackInventory: product.trackInventory,
    inventoryQuantity,
    inStock: isInStock(product, variantId),
  };
}

/**
 * Sets the absolute stock quantity for a product (used by ProductService
 * when a merchant edits the Inventory section of the product form).
 * Never allows a negative quantity.
 */
async function setInventory(storeId, productId, quantity, { trackInventory } = {}) {
  const product = await StoreProduct.findOne({ _id: productId, storeId, isDeleted: false });
  if (!product) throw notFoundError('Product not found.');

  if (quantity != null) {
    const next = Number(quantity);
    product.inventoryQuantity = Number.isFinite(next) ? Math.max(0, next) : product.inventoryQuantity;
  }
  if (trackInventory != null) {
    product.trackInventory = !!trackInventory;
  }

  await product.save();
  emitInventoryUpdated(storeId, product);
  return product;
}

/**
 * Adjusts stock by a relative amount (positive to restock, negative to
 * deduct). Used internally by OrderService when an order is placed or
 * cancelled/restocked. Clamped at zero — never goes negative.
 */
async function adjustInventory(storeId, productId, delta, session, variantId) {
  const product = await StoreProduct.findOne({ _id: productId, storeId, isDeleted: false }).session(
    session || null
  );
  if (!product) throw notFoundError('Product not found.');
  if (!product.trackInventory) return product; // untracked products are never decremented

  if (variantId && product.variants && product.variants.length > 0) {
    const variant = product.variants.find(v => String(v._id) === String(variantId));
    if (variant) {
      variant.inventoryQuantity = Math.max(0, (variant.inventoryQuantity || 0) + delta);
      // Synchronize parent product inventoryQuantity with sum of all variant quantities
      product.inventoryQuantity = product.variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
    }
  } else {
    const next = Math.max(0, (product.inventoryQuantity || 0) + delta);
    product.inventoryQuantity = next;
  }

  await product.save({ session: session || undefined });
  emitInventoryUpdated(storeId, product);
  return product;
}

/**
 * Verifies every requested line item is currently purchasable
 * (product exists, is Active, and — if tracked — has enough stock).
 * Returns the resolved product docs keyed by id for the caller
 * (OrderService) to re-price from, so stock-checking and price-checking
 * share a single product lookup instead of two separate queries.
 */
async function checkAvailability(storeId, items) {
  const productIds = items
    .map((i) => i.productId)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  const products = await StoreProduct.find({
    _id: { $in: productIds },
    storeId,
    isDeleted: false,
  });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const problems = [];
  for (const line of items) {
    const product = productMap.get(String(line.productId));
    const quantity = Math.max(parseInt(line.quantity, 10) || 1, 1);
    if (!product) continue; // unknown product ids are silently dropped by OrderService
    if (product.status !== 'Active') {
      problems.push(`${product.title} is not currently available.`);
      continue;
    }
    if (product.trackInventory) {
      if (line.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => String(v._id) === String(line.variantId));
        if (!variant) {
          problems.push(`Selected variant of ${product.title} does not exist.`);
        } else if ((variant.inventoryQuantity || 0) < quantity) {
          problems.push(`Selected variant of ${product.title} only has ${variant.inventoryQuantity || 0} unit(s) in stock.`);
        }
      } else if ((product.inventoryQuantity || 0) < quantity) {
        problems.push(`${product.title} only has ${product.inventoryQuantity || 0} unit(s) in stock.`);
      }
    }
  }

  if (problems.length) {
    throw badRequestError(problems.join(' '));
  }

  return productMap;
}

/**
 * Decrements stock for every tracked line item in a placed order.
 * Called once by OrderService.createOrder, after the order document has
 * been created, so the deduction and the availability check always agree
 * on the same product snapshot.
 */
async function decrementForOrder(storeId, orderItems) {
  for (const item of orderItems) {
    await adjustInventory(storeId, item.productId, -item.quantity, null, item.variantId);
  }
}

/**
 * Restocks every tracked line item — used when an order is cancelled.
 */
async function restockForOrder(storeId, orderItems) {
  for (const item of orderItems) {
    await adjustInventory(storeId, item.productId, item.quantity, null, item.variantId);
  }
}

module.exports = {
  isInStock,
  getInventory,
  setInventory,
  adjustInventory,
  checkAvailability,
  decrementForOrder,
  restockForOrder,
};