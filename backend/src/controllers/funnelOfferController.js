const mongoose = require('mongoose');
const Funnel = require('../models/Funnel');
const FunnelStep = require('../models/FunnelStep');
const funnelOfferService = require('../services/funnelOfferService');

const invalidIdError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const notFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

async function findOwnedStep(req, funnelId, stepId) {
  const ownerId = req?.user?.id || req?.user?._id;
  const funnelFilter = ownerId ? { _id: funnelId, ownerId } : { _id: funnelId };
  const funnel = await Funnel.findOne({ ...funnelFilter, isDeleted: false });
  if (!funnel) return null;

  const step = await FunnelStep.findOne({ _id: stepId, funnelId, isDeleted: false });
  return step ? { funnel, step } : null;
}

/**
 * PUT /api/funnels/:funnelId/steps/:stepId/offer
 * Creates or updates the single offer attached to a checkout step.
 * All validation/merge logic lives in funnelOfferService — this
 * controller only resolves ownership and forwards the request.
 */
exports.upsertOffer = async (req, res) => {
  const { funnelId, stepId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(funnelId) || !mongoose.Types.ObjectId.isValid(stepId)) {
    throw invalidIdError('Invalid funnel or step id.');
  }

  const owned = await findOwnedStep(req, funnelId, stepId);
  if (!owned) throw notFoundError('Funnel step not found.');

  const offer = await funnelOfferService.upsertOfferForStep(funnelId, stepId, req.body);

  // Keep the step's settings.offerId in sync so the public renderer and
  // funnelOfferService.getOfferedProductForStep can resolve it without a
  // second lookup.
  if (String(owned.step.settings?.offerId || '') !== String(offer._id)) {
    owned.step.settings = { ...(owned.step.settings || {}), offerId: offer._id };
    await owned.step.save();
  }

  res.status(200).json({ success: true, data: offer });
};

/**
 * GET /api/funnels/:funnelId/steps/:stepId/offer
 * Returns the raw offer plus the resolved (product + offer merged)
 * display preview used by the Step Settings UI.
 */
exports.getOffer = async (req, res) => {
  const { funnelId, stepId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(funnelId) || !mongoose.Types.ObjectId.isValid(stepId)) {
    throw invalidIdError('Invalid funnel or step id.');
  }

  const owned = await findOwnedStep(req, funnelId, stepId);
  if (!owned) throw notFoundError('Funnel step not found.');

  const [offer, preview] = await Promise.all([
    funnelOfferService.getOfferByStep(stepId),
    funnelOfferService.getOfferedProductForStep(owned.step),
  ]);

  res.status(200).json({ success: true, data: { offer, preview } });
};

/**
 * DELETE /api/funnels/:funnelId/steps/:stepId/offer
 * Soft-deletes the step's offer and clears settings.offerId.
 */
exports.deleteOffer = async (req, res) => {
  const { funnelId, stepId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(funnelId) || !mongoose.Types.ObjectId.isValid(stepId)) {
    throw invalidIdError('Invalid funnel or step id.');
  }

  const owned = await findOwnedStep(req, funnelId, stepId);
  if (!owned) throw notFoundError('Funnel step not found.');

  const offer = await funnelOfferService.deleteOfferByStep(stepId);
  if (!offer) throw notFoundError('Offer not found.');

  owned.step.settings = { ...(owned.step.settings || {}), offerId: null };
  await owned.step.save();

  res.status(200).json({ success: true, data: { id: offer._id, deleted: true } });
};
