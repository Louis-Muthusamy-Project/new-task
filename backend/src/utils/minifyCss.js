'use strict';

/**
 * minifyCss.js — lightweight, dependency-free CSS minifier used across the
 * Store module (template import pipeline + publish snapshot) to shrink the
 * CSS payload shipped to a live storefront.
 *
 * Deliberately simple (regex-based) rather than pulling in a CSS-parser
 * dependency: strips comments, collapses whitespace, and trims redundant
 * separators/semicolons. Safe for the CSS this pipeline actually produces
 * (page/theme stylesheets extracted from uploaded template ZIPs); it does
 * not attempt full CSSOM-correct minification (e.g. it won't shorten
 * hex colors or merge duplicate rules) — that trade-off keeps it fast and
 * dependency-free for a backend hot path.
 *
 * @param {string} css
 * @returns {string} minified CSS, or '' if input is falsy/not a string
 */
const minifyCss = (css) => {
  if (!css || typeof css !== 'string') return '';

  return css
    // Strip /* ... */ comments (including multi-line).
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Collapse all whitespace runs (newlines, tabs, repeated spaces) to a
    // single space.
    .replace(/\s+/g, ' ')
    // Remove spaces around the structural punctuation where they're safe
    // to drop.
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    // Drop the now-unnecessary trailing semicolon before a closing brace.
    .replace(/;}/g, '}')
    .trim();
};

module.exports = { minifyCss };
