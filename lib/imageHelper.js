'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const MIME = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
};

/** Read a file and return a base64 data URI. */
function toDataUri(filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? 'image/jpeg';
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

/**
 * Return an array of { filename, dataUri } for all images in a unit's folder,
 * sorted alphabetically (first image becomes the hero shot).
 */
function unitPhotos(tenant, unitId) {
  const dir = path.join(ROOT, 'config', tenant, 'units', unitId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => MIME[path.extname(f).toLowerCase()])
    .sort()
    .map(f => ({
      filename: f,
      dataUri:  toDataUri(path.join(dir, f)),
    }));
}

/**
 * Load a logo from examples/logos/ and return a base64 data URI.
 * Returns null if the file doesn't exist.
 */
function logoDataUri(logoFilename) {
  if (!logoFilename) return null;
  const p = path.join(ROOT, 'examples', 'logos', logoFilename);
  if (!fs.existsSync(p)) return null;
  return toDataUri(p);
}

module.exports = { toDataUri, unitPhotos, logoDataUri };
