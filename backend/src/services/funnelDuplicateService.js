const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const { slugify, generateUniqueFunnelStepSlug } = require('../utils/slugUtils');
const funnelOfferService = require('./funnelOfferService');

/**
 * Generates a unique name for duplicated funnels.
 */
const generateCopyName = async (originalName) => {
  const base = originalName.replace(/\s+Copy(\s+\d+)?$/, '').trim();
  const copyBase = `${base} Copy`;

  const existing = await Funnel.find(
    {
      name: { $regex: `^${copyBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s+\\d+)?$` },
      isDeleted: false,
    },
    { name: 1 }
  ).lean();

  if (existing.length === 0) {
    return copyBase;
  }

  const taken = new Set();
  for (const doc of existing) {
    const match = doc.name.match(/\s+(\d+)$/);
    taken.add(match ? parseInt(match[1], 10) : 1);
  }

  let n = 2;
  while (taken.has(n)) n++;

  return `${copyBase} ${n}`;
};

/**
 * Duplicates a Funnel and all its non-deleted steps.
 */
const duplicateFunnel = async (sourceId, ownerCtx = {}) => {
  const source = await Funnel.findOne({ _id: sourceId, isDeleted: false }).lean();
  if (!source) {
    const err = new Error('Funnel not found.');
    err.statusCode = 404;
    throw err;
  }

  const copyName = await generateCopyName(source.name);

  const {
    _id,
    __v,
    createdAt,
    updatedAt,
    name,
    status,
    settings,
    ...rest
  } = source;

  // Clear domain mappings for copy
  const cleanSettings = {
    ...settings,
    domain: '',
  };

  const newFunnel = await Funnel.create({
    ...rest,
    name: copyName,
    slug: slugify(copyName),
    status: 'Draft',
    settings: cleanSettings,
    ...(ownerCtx.ownerId != null && { ownerId: ownerCtx.ownerId }),
    ...(ownerCtx.teamId  != null && { teamId:  ownerCtx.teamId  }),
  });

  const sourceSteps = await FunnelStep.find(
    { funnelId: source._id, isDeleted: false }
  ).sort({ position: 1 }).lean();

  let stepCount = 0;

  if (sourceSteps.length > 0) {
    const stepDocs = [];
    for (const { _id, __v, createdAt, updatedAt, publishedAt, slug, ...step } of sourceSteps) {
      const safeSlug = await generateUniqueFunnelStepSlug(
        slugify(slug),
        newFunnel._id
      );

      stepDocs.push({
        ...step,
        slug: safeSlug,
        funnelId: newFunnel._id,
        status: 'Draft',
        publishedAt: null,
        isDeleted: false,
      });
    }

    const inserted = await FunnelStep.insertMany(stepDocs);
    stepCount = inserted.length;

    // Clone each source step's Funnel Offer (if any) onto its duplicate and
    // repoint settings.offerId — a duplicated funnel must never share (and
    // let admins accidentally edit) the original funnel's offer.
    // insertMany preserves input order, so sourceSteps[i] <-> inserted[i].
    for (let i = 0; i < sourceSteps.length; i++) {
      const sourceStep = sourceSteps[i];
      const newStep = inserted[i];
      if (!sourceStep.settings?.offerId) continue;

      const newOfferId = await funnelOfferService.cloneOfferForStep(
        sourceStep._id,
        newFunnel._id,
        newStep._id
      );
      if (newOfferId) {
        newStep.settings = { ...(newStep.settings || {}), offerId: newOfferId };
        await newStep.save();
      }
    }
  }

  return { funnel: newFunnel, stepCount };
};

module.exports = { duplicateFunnel, generateCopyName };