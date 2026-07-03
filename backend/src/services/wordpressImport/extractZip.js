'use strict';

/**
 * extractZip.js
 * Stage 2 ("Extract ZIP") of the WordPress Import Pipeline.
 *
 * Opens the uploaded buffer with JSZip — in memory only, never written to
 * disk, never shelled out to `unzip`. This is the same primitive
 * `parseStoreTemplateZip()` (controllers/storeTemplateController.js) uses
 * internally; the WordPress Import Service needs its own `JSZip` instance
 * up front so Stage 3 (validateTemplate.js) can inspect entries *before*
 * deciding whether to proceed into the reused parse/upload/rewrite engine.
 *
 * Known, accepted trade-off (see architecture doc §7): because
 * `parseStoreTemplateZip()` re-opens the same buffer with its own
 * `JSZip.loadAsync` call, the ZIP is parsed twice. That's in-memory CPU
 * work, not disk I/O, and bounded by the existing 50 MB multer limit — the
 * alternative (changing `parseStoreTemplateZip`'s signature to accept a
 * pre-loaded `JSZip` instead of a `Buffer`) would touch a function every
 * existing call site depends on, which is explicitly out of scope here.
 */

const JSZip = require('jszip');

/**
 * @param {Buffer} zipBuffer
 * @returns {Promise<import('jszip')>} a loaded JSZip instance
 * @throws {Error} statusCode 400 if the buffer is missing/empty or isn't a
 *   readable ZIP archive
 */
async function extractZip(zipBuffer) {
  if (!zipBuffer || !zipBuffer.length) {
    const error = new Error('No file. Send ZIP under "file" field.');
    error.statusCode = 400;
    throw error;
  }

  try {
    return await JSZip.loadAsync(zipBuffer);
  } catch (err) {
    const error = new Error('Could not read this file as a ZIP archive.');
    error.statusCode = 400;
    error.cause = err;
    throw error;
  }
}

module.exports = { extractZip };
