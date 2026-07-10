'use strict';

/**
 * funnelServiceErrors.js — shared error helpers for the Funnel service
 * layer (funnelOfferService, and later funnelCheckoutService).
 *
 * Mirrors services/store/errors.js exactly, so every funnel service
 * throws the same shape of error and asyncHandler/errorMiddleware keeps
 * working without any funnel-specific error handling.
 */

function notFoundError(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

function badRequestError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function conflictError(message) {
  const err = new Error(message);
  err.statusCode = 409;
  return err;
}

module.exports = { notFoundError, badRequestError, conflictError };
