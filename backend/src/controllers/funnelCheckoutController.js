const funnelCheckoutService = require('../services/funnelCheckoutService');

/**
 * POST /api/funnels/:funnelId/steps/:stepId/checkout
 * Public endpoint — hit by a live funnel's checkout step, not the admin.
 * All resolution (product/offer/pricing) and order creation is delegated
 * to funnelCheckoutService → orderService. This controller only shapes
 * the HTTP request/response.
 */
exports.checkoutStep = async (req, res) => {
  const { funnelId, stepId } = req.params;
  const result = await funnelCheckoutService.checkout(funnelId, stepId, req.body);

  res.status(201).json({ success: true, data: result });
};
