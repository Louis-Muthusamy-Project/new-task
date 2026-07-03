const Store = require('../models/store/Store');
const StorePage = require('../models/store/StorePage');
const StorePublishHistory = require('../models/store/StorePublishHistory');

const buildOwnershipFilter = (req) => {
  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;
  if (!ownerId && !teamId) return {};
  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

const notFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

/**
 * Resolves the public URL a published store will be served at. Stores
 * don't yet have their own custom-domain model (StoreDomain), so this
 * always falls back to the platform's default storefront path — see
 * WebsitesTab.jsx / storeStorefrontRoutes.js for the same "/shop/:slug"
 * pattern used elsewhere in the Store module.
 */
const resolvePublishUrl = (store) => {
  const platformHost = process.env.PUBLISH_BASE_DOMAIN || 'jeema.one';
  const slugSegment = store.domain || store._id;
  return `https://${platformHost}/shop/${slugSegment}`;
};

/**
 * Builds the full store snapshot JSON that represents exactly what is
 * being published: store-level settings/tracking plus every page's
 * builder content ("assets"), frozen at this point in time — this is the
 * payload the "Generate Build" and "Upload Assets" steps produce.
 */
const buildStoreSnapshot = (store, pages) => ({
  storeId: store._id,
  name: store.storeName || store.name,
  description: store.description,
  currency: store.currency,
  faviconUrl: store.faviconUrl,
  tracking: store.tracking,
  publishedAt: new Date().toISOString(),
  pages: pages.map((page) => ({
    pageId: page._id,
    name: page.name,
    slug: page.slug,
    isHome: page.isHome,
    seo: page.seo,
    content: page.content,
  })),
});

/**
 * Runs the full publish flow for a store — mirrors publishService.js's
 * publishWebsite() step-for-step, renamed to match the Store module's
 * "Publish" pipeline (Generate Build -> Upload Assets -> Save -> Live URL):
 *
 *   1. Fetch Store
 *   2. Fetch Store Pages          }  "Generate Build"
 *   3. Build Store Snapshot JSON  }
 *   4. Resolve Live URL            "Upload Assets" (asset/page payload is
 *                                   embedded directly in the snapshot —
 *                                   there's no separate CDN step yet)
 *   5. Save StorePublishHistory   }  "Save"
 *   6. Mark Store Published       }
 *
 * @param {string} storeId
 * @param {string} triggeredBy - id of the user triggering the publish
 * @returns {Promise<{ publishUrl: string, store: object, publishHistory: object }>}
 */
const publishStore = async (storeId, triggeredBy, req) => {
  // 1. Fetch Store
  const store = await Store.findOne({
    _id: storeId,
    isDeleted: { $ne: true },
    ...(req ? buildOwnershipFilter(req) : {}),
  });
  if (!store) {
    throw notFoundError('Store not found.');
  }

  // 2. Fetch Store Pages
  const pages = await StorePage.find({ storeId: store._id, isDeleted: { $ne: true } });

  // 3. Build Store Snapshot JSON ("Generate Build")
  const snapshot = buildStoreSnapshot(store, pages);

  // 4. Resolve Live URL ("Upload Assets")
  const publishUrl = resolvePublishUrl(store);

  let publishHistory;
  try {
    // 5. Save StorePublishHistory ("Save")
    publishHistory = await StorePublishHistory.create({
      storeId: store._id,
      pageId: null,
      action: 'publish',
      status: 'success',
      snapshot,
      triggeredBy,
    });

    // 6. Mark Store Published
    store.status = 'Published';
    await store.save();
  } catch (err) {
    await StorePublishHistory.create({
      storeId: store._id,
      pageId: null,
      action: 'publish',
      status: 'failed',
      snapshot,
      errorMessage: err.message,
      triggeredBy,
    }).catch(() => {});
    throw err;
  }

  return { publishUrl, store, publishHistory };
};

module.exports = {
  publishStore,
  buildStoreSnapshot,
  resolvePublishUrl,
};
