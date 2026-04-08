'use strict';
const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT       = path.join(__dirname, '..');
const CACHE_FILE = path.join(ROOT, 'config', '.focal-cache.json');
const FOCAL_CACHE_VERSION = 'v2';

const MIME = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
};

// ── Focal-point cache (keyed by filePath:mtimeMs) ────────────────────────────

let focalCache = {};
try { focalCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { /* no cache yet */ }

function saveFocalCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(focalCache, null, 2));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Read a file and return a base64 data URI. */
function toDataUri(filePath) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? 'image/jpeg';
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

/**
 * Find the focal point of the main subject by sampling a 4×4 grid of cells
 * and scoring each cell by its visual entropy × std deviation. The cell with
 * the highest score (most visual information) is treated as the subject center.
 *
 * Returns { x, y } as CSS object-position percentages (0–100).
 * Results are cached to disk so each unique image is only analyzed once.
 */
async function getFocalPoint(filePath) {
  const stat     = fs.statSync(filePath);
  const cacheKey = `${FOCAL_CACHE_VERSION}:${filePath}:${stat.mtimeMs}`;

  if (focalCache[cacheKey]) return focalCache[cacheKey];

  try {
    const meta = await sharp(filePath).metadata();
    const { width: W, height: H } = meta;

    const COLS = 4, ROWS = 4;
    const cellW = Math.floor(W / COLS);
    const cellH = Math.floor(H / ROWS);

    const cells = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // Must go via buffer — Sharp's stats() on a chained pipeline
        // silently reads the original image, not the extracted region.
        const buf = await sharp(filePath)
          .extract({
            left:   col * cellW,
            top:    row * cellH,
            width:  cellW,
            height: cellH,
          })
          .toBuffer();
        const stats = await sharp(buf).stats();

        // Score = sum of stdev across channels — rewards areas with high
        // colour/edge variation (i.e. the vehicle) over flat sky or walls.
        const entropyScore = stats.channels.reduce(
          (sum, ch) => sum + ch.stdev,
          0
        );

        const cx = (col + 0.5) / COLS;
        const cy = (row + 0.5) / ROWS;

        // Slight bias toward a lower-center focal area where vehicles usually sit.
        const dist = Math.hypot(cx - 0.5, cy - 0.58);
        const centerBias = 1 - Math.min(dist / 0.85, 1) * 0.35;

        cells.push({
          cx,
          cy,
          score: entropyScore * centerBias,
        });
      }
    }

    // Use the weighted centroid of the strongest cells to avoid single-cell jumps.
    const topCells = cells
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(3, Math.ceil(cells.length * 0.25)));

    const weightTotal = topCells.reduce((sum, cell) => sum + cell.score, 0) || 1;
    const weightedX = topCells.reduce((sum, cell) => sum + cell.cx * cell.score, 0) / weightTotal;
    const weightedY = topCells.reduce((sum, cell) => sum + cell.cy * cell.score, 0) / weightTotal;

    const result = {
      x: Math.max(20, Math.min(80, Math.round(weightedX * 100))),
      y: Math.max(30, Math.min(80, Math.round(weightedY * 100))),
    };
    focalCache[cacheKey] = result;
    saveFocalCache();
    return result;
  } catch {
    return { x: 50, y: 60 };
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
