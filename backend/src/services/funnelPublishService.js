const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const FunnelPublishHistory = require('../models/FunnelPublishHistory');
const WebsiteDomain = require('../models/WebsiteDomain');

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
 * Resolves the public URL a published funnel will be served at.
 * Prefers a custom domain from funnel settings or connected domains.
 */
const resolvePublishUrl = async (funnel) => {
  if (funnel.settings?.domain) {
    return `https://${funnel.settings.domain}`;
  }
  const platformHost = process.env.PUBLISH_BASE_DOMAIN || 'funnels.example.com';
  return `https://${funnel._id}.${platformHost}`;
};

/**
 * Builds the full funnel snapshot JSON that represents what is being published.
 */
const buildFunnelSnapshot = (funnel, steps) => ({
  funnelId: funnel._id,
  name: funnel.name,
  slug: funnel.slug,
  settings: funnel.settings,
  seo: funnel.seo,
  publishedAt: new Date().toISOString(),
  steps: steps.map((step) => ({
    stepId: step._id,
    name: step.name,
    slug: step.slug,
    type: step.type,
    position: step.position,
    seo: step.seo,
    content: step.content,
    settings: step.settings,
  })),
});

/**
 * Runs the publish flow for a funnel:
 *   1. Fetch Funnel
 *   2. Fetch Funnel Steps
 *   3. Build Funnel Snapshot
 *   4. Save FunnelPublishHistory
 *   5. Mark Funnel Published
 */
const publishFunnel = async (funnelId, triggeredBy, req) => {
  const funnel = await Funnel.findOne({
    _id: funnelId,
    isDeleted: false,
    ...(req ? buildOwnershipFilter(req) : {}),
  });
  if (!funnel) {
    throw notFoundError('Funnel not found.');
  }

  const steps = await FunnelStep.find({ funnelId: funnel._id, isDeleted: false }).sort({ position: 1 });

  const snapshot = buildFunnelSnapshot(funnel, steps);
  const publishUrl = await resolvePublishUrl(funnel);

  let publishHistory;
  try {
    publishHistory = await FunnelPublishHistory.create({
      funnelId: funnel._id,
      action: 'publish',
      status: 'success',
      snapshot,
      triggeredBy,
    });

    funnel.status = 'Published';
    await funnel.save();

    // Mark steps as published as well
    await FunnelStep.updateMany(
      { funnelId: funnel._id, isDeleted: false },
      { $set: { status: 'Published', publishedAt: new Date() } }
    );

  } catch (err) {
    await FunnelPublishHistory.create({
      funnelId: funnel._id,
      action: 'publish',
      status: 'failed',
      snapshot,
      errorMessage: err.message,
      triggeredBy,
    }).catch(() => {});
    throw err;
  }

  return { publishUrl, funnel, publishHistory };
};

module.exports = {
  publishFunnel,
  buildFunnelSnapshot,
  resolvePublishUrl,
};
