'use strict';

/**
 * passwordUtils.js
 *
 * Password hashing for storefront customer accounts. Uses Node's built-in
 * `crypto.scrypt` rather than adding a `bcrypt`/`argon2` dependency to the
 * project — scrypt is a well-vetted, memory-hard KDF already available
 * with zero new dependencies, which matters here since this environment
 * can't reach the npm registry to install anything new.
 *
 * Stored format: `scrypt:<saltHex>:<hashHex>` — self-describing so the
 * algorithm can be swapped later without invalidating every existing hash
 * in one migration.
 */

const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

async function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(String(plainPassword), salt, KEY_LENGTH);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const [scheme, salt, hashHex] = storedHash.split(':');
  if (scheme !== 'scrypt' || !salt || !hashHex) return false;

  const derivedKey = await scrypt(String(plainPassword), salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(hashHex, 'hex');

  // timingSafeEqual throws if lengths differ, so guard first.
  if (derivedKey.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(derivedKey, storedBuffer);
}

module.exports = { hashPassword, verifyPassword };
