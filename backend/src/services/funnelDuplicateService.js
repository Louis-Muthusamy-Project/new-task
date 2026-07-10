const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const { slugify, generateUniqueFunnelStepSlug } = require('../utils/slugUtils');

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
  }

  return { funnel: newFunnel, stepCount };
};

module.exports = { duplicateFunnel, generateCopyName };
