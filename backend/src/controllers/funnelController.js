const mongoose = require('mongoose');
const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const FunnelTemplate = require('../models/FunnelTemplate');
const StoreOrder = require('../models/store/StoreOrder');
const FunnelAnalyticsEvent = require('../models/FunnelAnalyticsEvent');
const { duplicateFunnel } = require('../services/funnelDuplicateService');
const funnelPublishService = require('../services/funnelPublishService');
const { slugify } = require('../utils/slugUtils');
const { hashPassword } = require('../utils/passwordUtils');
// Reuse the exact "what counts as a completed sale" definition already
// established in funnelAnalyticsController, instead of redefining it here.
const { COUNTED_STATUSES } = require('./funnelAnalyticsController');

/**
 * Flattens a nested plain-object payload into dot-path { 'a.b.c': value }
 * pairs suitable for a Mongo $set. This lets PATCH /:id accept a partial
 * nested object (e.g. just `{ seo: { title: 'x' } }`) and update only the
 * keys provided, without clobbering sibling subfields (e.g. `seo.keywords`)
 * that the caller didn't send. Arrays and non-plain-objects are treated as
 * leaf values, not recursed into.
 */
const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !mongoose.Types.ObjectId.isValid(v);

const flattenForSet = (obj, prefix = '') => {
  const out = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      Object.assign(out, flattenForSet(value, path));
    } else {
      out[path] = value;
    }
  }
  return out;
};

/**
 * Strips sensitive/internal fields (currently just the password hash) from
 * a funnel before it goes out over the API. Replaces it with a boolean
 * `hasPassword` flag so the frontend can show protection is on without
 * ever seeing the hash.
 */
const sanitizeFunnel = (funnelDoc) => {
  if (!funnelDoc) return funnelDoc;
  const obj = typeof funnelDoc.toObject === 'function' ? funnelDoc.toObject() : { ...funnelDoc };
  const hash = obj?.publishing?.passwordProtection?.passwordHash;
  if (obj.publishing?.passwordProtection) {
    obj.publishing.passwordProtection.hasPassword = !!hash;
    delete obj.publishing.passwordProtection.passwordHash;
  }
  return obj;
};

const buildOwnershipFilter = (req) => {
  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;
  if (!ownerId && !teamId) return {};
  return teamId ? { $or: [{ ownerId }, { teamId }] } : { ownerId };
};

const notFoundError = () => {
  const error = new Error('Funnel not found.');
  error.statusCode = 404;
  return error;
};

const invalidIdError = () => {
  const error = new Error('Invalid funnel id.');
  error.statusCode = 400;
  return error;
};

/**
 * POST /api/funnels
 * Creates a new funnel. If templateId is provided, clones steps from the FunnelTemplate.
 */
exports.createFunnel = async (req, res) => {
  const {
    name, status, templateId, settings, seo, tags, createdBy,
    description, thumbnailUrl, iconUrl, publishing, localization, advanced,
  } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Funnel name is required.' });
  }

  const ownerId = req?.user?.id || req?.user?._id || null;
  const teamId = req?.user?.teamId || null;
  // No jwtMiddleware is mounted on funnelRoutes yet, so req.user is
  // usually empty — fall back to whatever display name the client sent
  // (e.g. the current AuthContext role) rather than leaving it blank.
  const createdByName = req?.user?.name || req?.user?.email || createdBy || '';

  // Publishing settings may arrive with a plaintext `password` — hash it
  // the same way updateFunnel does, rather than ever persisting it as-is.
  let publishingToSave;
  if (publishing) {
    publishingToSave = { ...publishing };
    const plainPassword = publishing?.passwordProtection?.password;
    if (plainPassword) {
      publishingToSave.passwordProtection = {
        ...publishing.passwordProtection,
        passwordHash: await hashPassword(plainPassword),
      };
      delete publishingToSave.passwordProtection.password;
    }
  }

  const funnel = await Funnel.create({
    ownerId,
    teamId,
    name,
    slug: slugify(name),
    status: status || 'Draft',
    tags: Array.isArray(tags) ? tags.filter(Boolean).map((t) => String(t).trim()) : [],
    createdBy: createdByName,
    description: description || '',
    thumbnailUrl: thumbnailUrl || '',
    iconUrl: iconUrl || '',
    settings: settings || {
      faviconUrl: '',
      domain: '',
      tracking: {
        metaPixelId: '',
        ga4Id: '',
        gtmId: '',
        tiktokPixelId: '',
        customHeadCode: '',
        customBodyCode: '',
      }
    },
    seo: seo || { title: '', description: '', ogImageUrl: '' },
    publishing: publishingToSave,
    localization: localization || undefined,
    advanced: advanced || undefined,
    templateId: templateId || null,
  });

  // If a template is specified, copy its steps
  if (templateId && mongoose.Types.ObjectId.isValid(templateId)) {
    const template = await FunnelTemplate.findById(templateId);
    if (template && template.steps && template.steps.length > 0) {
      const stepDocs = template.steps.map((tStep) => ({
        funnelId: funnel._id,
        name: tStep.name,
        slug: tStep.slug || slugify(tStep.name),
        type: tStep.type || 'landing',
        position: tStep.position,
        content: tStep.content || null,
        status: 'Draft',
        isDeleted: false,
      }));
      await FunnelStep.insertMany(stepDocs);
    }
  } else {
    // By default, create a single Landing Step if no template is chosen
    await FunnelStep.create({
      funnelId: funnel._id,
      name: 'Landing Page',
      slug: 'landing',
      type: 'landing',
      position: 1,
      status: 'Draft',
      content: null,
      isDeleted: false,
    });
  }

  res.status(201).json({
    success: true,
    data: sanitizeFunnel(funnel),
  });
};

/**
 * GET /api/funnels
 * Lists all non-deleted funnels. Supports optional search.
 */
// Maps the dashboard's `sort` query param to a Mongo sort spec. Unknown or
// missing values fall back to the original default (last updated first).
const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
  name: { name: 1 },
};

exports.getFunnels = async (req, res) => {
  const filter = {
    ...buildOwnershipFilter(req),
    isDeleted: false,
  };

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.favorite === 'true') {
    filter.isFavorite = true;
  }

  if (req.query.tag) {
    filter.tags = req.query.tag;
  }

  const sortSpec = SORT_MAP[req.query.sort] || SORT_MAP.updated;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [funnels, total] = await Promise.all([
    Funnel.find(filter).sort(sortSpec).skip(skip).limit(limit).lean(),
    Funnel.countDocuments(filter),
  ]);

  // Aggregate step counts
  const funnelIds = funnels.map((f) => f._id);
  let stepCountMap = {};

  if (funnelIds.length > 0) {
    try {
      const counts = await FunnelStep.aggregate([
        { $match: { funnelId: { $in: funnelIds }, isDeleted: false } },
        { $group: { _id: '$funnelId', count: { $sum: 1 } } },
      ]);
      for (const c of counts) {
        stepCountMap[String(c._id)] = c.count;
      }
    } catch (err) {
      console.warn('[getFunnels] step count aggregation failed:', err.message);
    }
  }

  // Optional dashboard KPIs (Total Visitors / Orders / Revenue / Conversion
  // Rate) per funnel row. Opt-in via ?includeStats=true since it costs two
  // extra aggregations — everything else that calls GET /funnels (e.g. the
  // "From templates" picker) doesn't need it. Reuses the exact same
  // StoreOrder / FunnelAnalyticsEvent sources and COUNTED_STATUSES
  // definition as funnelAnalyticsController.getFunnelAnalytics, just
  // summarized across all-time rather than a single funnel + day range.
  let statsMap = {};
  if (req.query.includeStats === 'true' && funnelIds.length > 0) {
    try {
      const [orderStats, eventStats] = await Promise.all([
        StoreOrder.aggregate([
          {
            $match: {
              funnelId: { $in: funnelIds },
              isDeleted: false,
              status: { $in: COUNTED_STATUSES },
            },
          },
          { $group: { _id: '$funnelId', orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
        ]),
        FunnelAnalyticsEvent.aggregate([
          { $match: { funnelId: { $in: funnelIds } } },
          {
            $group: {
              _id: '$funnelId',
              uniqueSessions: { $addToSet: '$sessionId' },
              formSubmits: { $sum: { $cond: [{ $eq: ['$eventType', 'form_submit'] }, 1, 0] } },
            },
          },
        ]),
      ]);

      const orderMap = new Map(orderStats.map((o) => [String(o._id), o]));
      const eventMap = new Map(eventStats.map((e) => [String(e._id), e]));

      for (const id of funnelIds) {
        const key = String(id);
        const ord = orderMap.get(key) || { orders: 0, revenue: 0 };
        const ev = eventMap.get(key) || { uniqueSessions: [], formSubmits: 0 };
        const visitors = (ev.uniqueSessions || []).filter(Boolean).length;
        const conversions = (ev.formSubmits || 0) + ord.orders;
        statsMap[key] = {
          visitors,
          orders: ord.orders,
          revenue: ord.revenue,
          conversionRate: visitors > 0 ? (conversions / visitors) * 100 : 0,
        };
      }
    } catch (err) {
      console.warn('[getFunnels] stats aggregation failed:', err.message);
    }
  }

  const funnelsWithExtras = funnels.map((f) => ({
    ...sanitizeFunnel(f),
    stepCount: stepCountMap[String(f._id)] || 0,
    ...(req.query.includeStats === 'true'
      ? { stats: statsMap[String(f._id)] || { visitors: 0, orders: 0, revenue: 0, conversionRate: 0 } }
      : {}),
  }));

  res.status(200).json({
    success: true,
    data: funnelsWithExtras,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

/**
 * GET /api/funnels/tags
 * Returns the distinct set of tags in use, for populating the dashboard's
 * tag filter dropdown. Reuses the Funnel model only — no new collection.
 */
exports.getFunnelTags = async (req, res) => {
  const tags = await Funnel.distinct('tags', {
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  res.status(200).json({
    success: true,
    data: tags.filter(Boolean).sort(),
  });
};

/**
 * GET /api/funnels/:id
 * Fetches a single funnel by id.
 */
exports.getFunnelById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const funnel = await Funnel.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!funnel) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: sanitizeFunnel(funnel),
  });
};

/**
 * PATCH /api/funnels/:id
 * Updates a funnel. Powers every section of the Settings UI (General,
 * Publishing, SEO, Localization, Advanced) through one generic endpoint.
 *
 * Nested fields (settings, seo, publishing, localization, advanced) are
 * flattened to dot-paths before the $set, so a caller can PATCH e.g. just
 * `{ seo: { title: 'x' } }` and only `seo.title` changes — sibling keys
 * like `seo.keywords` that weren't included are left untouched. This keeps
 * each Settings tab's "Save" button independent of the others.
 */
exports.updateFunnel = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const flatFields = [
    'name',
    'description',
    'thumbnailUrl',
    'iconUrl',
    'status',
    'tags',
    'isFavorite',
    'slug',
  ];
  const nestedFields = ['settings', 'seo', 'publishing', 'localization', 'advanced'];

  const updates = {};
  for (const field of flatFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      updates[field] = req.body[field];
    }
  }
  for (const field of nestedFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field) && isPlainObject(req.body[field])) {
      Object.assign(updates, flattenForSet(req.body[field], field));
    }
  }

  // Custom Slug (Publishing tab): if the caller explicitly sends `slug`,
  // that wins and is validated for uniqueness. Otherwise fall back to the
  // original behavior of deriving the slug from `name` — unchanged, so
  // existing callers that only ever sent `name` keep working exactly as
  // before.
  if (Object.prototype.hasOwnProperty.call(updates, 'slug')) {
    const desiredSlug = slugify(updates.slug);
    const clash = await Funnel.findOne({
      _id: { $ne: id },
      slug: desiredSlug,
      isDeleted: false,
    }).select('_id');
    if (clash) {
      return res.status(409).json({ success: false, error: 'That slug is already in use by another funnel.' });
    }
    updates.slug = desiredSlug;
  } else if (updates.name) {
    updates.slug = slugify(updates.name);
  }

  if (updates.tags) {
    updates.tags = Array.isArray(updates.tags)
      ? updates.tags.filter(Boolean).map((t) => String(t).trim())
      : [];
  }

  // Password Protection (Publishing tab): the frontend sends a plaintext
  // `publishing.passwordProtection.password`, which flattenForSet turns
  // into the dot-path key below. Hash it before it ever touches the DB;
  // an empty string clears the password (protection can still be toggled
  // off separately via `publishing.passwordProtection.enabled`).
  const passwordKey = 'publishing.passwordProtection.password';
  if (Object.prototype.hasOwnProperty.call(updates, passwordKey)) {
    const plainPassword = updates[passwordKey];
    delete updates[passwordKey];
    updates['publishing.passwordProtection.passwordHash'] = plainPassword
      ? await hashPassword(plainPassword)
      : '';
  }

  const funnel = await Funnel.findOneAndUpdate(
    {
      _id: id,
      ...buildOwnershipFilter(req),
      isDeleted: false,
    },
    { $set: updates },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!funnel) {
    throw notFoundError();
  }

  res.status(200).json({
    success: true,
    data: sanitizeFunnel(funnel),
  });
};

/**
 * DELETE /api/funnels/:id
 * Soft-deletes a funnel.
 */
exports.deleteFunnel = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const funnel = await Funnel.findOneAndUpdate(
    {
      _id: id,
      ...buildOwnershipFilter(req),
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!funnel) {
    throw notFoundError();
  }

  // Also soft-delete its steps
  await FunnelStep.updateMany(
    { funnelId: funnel._id },
    { $set: { isDeleted: true } }
  );

  res.status(200).json({
    success: true,
    data: { id: funnel._id, deleted: true },
  });
};

const BULK_ACTIONS = ['delete', 'publish', 'archive'];

/**
 * POST /api/funnels/bulk
 * Body: { ids: string[], action: 'delete' | 'publish' | 'archive' }
 *
 * Applies one action across many funnels for the dashboard's bulk
 * toolbar. Deliberately thin — each id is routed through the exact same
 * logic as the corresponding single-funnel endpoint (soft-delete +
 * cascade to steps, funnelPublishService.publishFunnel, or the same
 * status update used by PATCH /:id) so nothing here is a second copy of
 * that behavior. Partial failures (e.g. one funnel already archived, or
 * not owned by this user) are collected per-id rather than aborting the
 * whole batch.
 */
exports.bulkAction = async (req, res) => {
  const { ids, action } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'ids must be a non-empty array.' });
  }
  if (!BULK_ACTIONS.includes(action)) {
    return res.status(400).json({ success: false, error: `action must be one of: ${BULK_ACTIONS.join(', ')}` });
  }

  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const ownership = buildOwnershipFilter(req);
  const succeeded = [];
  const failed = [];

  for (const id of validIds) {
    try {
      if (action === 'delete') {
        const funnel = await Funnel.findOneAndUpdate(
          { _id: id, ...ownership, isDeleted: false },
          { $set: { isDeleted: true } },
          { new: true }
        );
        if (!funnel) throw notFoundError();
        await FunnelStep.updateMany({ funnelId: funnel._id }, { $set: { isDeleted: true } });
      } else if (action === 'archive') {
        const funnel = await Funnel.findOneAndUpdate(
          { _id: id, ...ownership, isDeleted: false },
          { $set: { status: 'Archived' } },
          { new: true, runValidators: true }
        );
        if (!funnel) throw notFoundError();
      } else if (action === 'publish') {
        const owned = await Funnel.findOne({ _id: id, ...ownership, isDeleted: false });
        if (!owned) throw notFoundError();
        const triggeredBy = req?.user?.id || req?.user?._id || null;
        await funnelPublishService.publishFunnel(id, triggeredBy, req);
      }
      succeeded.push(id);
    } catch (err) {
      failed.push({ id, error: err.message || 'Failed.' });
    }
  }

  res.status(200).json({
    success: true,
    data: { action, succeeded, failed },
  });
};

/**
 * POST /api/funnels/:id/duplicate
 * Duplicates a funnel and its steps.
 */
exports.duplicateFunnel = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const ownerCtx = {
    ownerId: req?.user?.id || req?.user?._id || null,
    teamId:  req?.user?.teamId || null,
  };

  const { funnel, stepCount } = await duplicateFunnel(id, ownerCtx);

  res.status(201).json({
    success: true,
    data: sanitizeFunnel(funnel),
    meta: { stepsCopied: stepCount },
  });
};

/**
 * GET /api/funnels/:id/preview
 * Returns the funnel and its steps sorted by position.
 */
exports.previewFunnel = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw invalidIdError();
  }

  const funnel = await Funnel.findOne({
    _id: id,
    ...buildOwnershipFilter(req),
    isDeleted: false,
  });

  if (!funnel) {
    throw notFoundError();
  }

  const steps = await FunnelStep.find({
    funnelId: funnel._id,
    isDeleted: false
  })
    .sort({ position: 1, createdAt: 1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      funnel: sanitizeFunnel(funnel),
      steps,
      meta: {
        stepCount: steps.length,
      },
    },
  });
};