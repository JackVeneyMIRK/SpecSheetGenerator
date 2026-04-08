'use strict';
const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');

const MIME = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
};

/** Read a file and return a base64 data URI. */
function toDataUri(filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? 'image/jpeg';
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

/**
 * Use Sharp's attention algorithm to find the focal point of an image.
 * Returns { x, y } as CSS object-position percentages (0–100).
 */
async function getFocalPoint(filePath) {
  try {
    const meta = await sharp(filePath).metadata();
    const { width: origW, height: origH } = meta;

    // Crop to a 3:2 landscape target — typical equipment photo ratio.
    // Sharp's attention strategy finds the highest-entropy region.
    const targetW = 600;
    const targetH = 400;

    const { info } = await sharp(filePath)
      .resize(targetW, targetH, { fit: 'cover', position: 'attention' })
      .toBuffer({ resolveWithObject: true });

    // Scale factor used by Sharp for the cover resize
    const scale = Math.max(targetW / origW, targetH / origH);

    // Crop offsets are in pre-scale (original) pixel space
    const cropLeft = (info.cropOffsetLeft ?? 0) / scale;
    const cropTop  = (info.cropOffsetTop  ?? 0) / scale;

    // Center of the cropped window as % of original dimensions
    const focalX = Math.round(((cropLeft + (targetW / scale) / 2) / origW) * 100);
    const focalY = Math.round(((cropTop  + (targetH / scale) / 2) / origH) * 100);

    return {
      x: Math.max(0, Math.min(100, focalX)),
      y: Math.max(0, Math.min(100, focalY)),
    };
  } catch {
    return { x: 50, y: 50 }; // fallback to center
  }
}

/**
 * Return an array of { filename, dataUri, focalX, focalY } for all images
 * in a unit's folder, sorted numerically.
 */
async function unitPhotos(tenant, unitId) {
  const dir = path.join(ROOT, 'config', tenant, 'units', unitId);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir)
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return MIME[ext] && ext !== '.svg';
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return Promise.all(files.map(async f => {
    const filePath = path.join(dir, f);
    const focal    = await getFocalPoint(filePath);
    return {
      filename: f,
      dataUri:  toDataUri(filePath),
      focalX:   focal.x,
      focalY:   focal.y,
    };
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
