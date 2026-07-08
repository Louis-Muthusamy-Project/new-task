'use strict';

/**
 * errors.js — shared error helpers for the Store Engine service layer.
 *
 * Every service in services/store/* throws these instead of building
 * ad-hoc `Error` objects inline, so every controller can keep relying on
 * asyncHandler/errorMiddleware to translate `err.statusCode` into the
 * right HTTP response without needing to know which service raised it.
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
