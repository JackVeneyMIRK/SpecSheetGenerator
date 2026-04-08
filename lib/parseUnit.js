'use strict';
const fs   = require('fs');
const path = require('path');

/**
 * Parse a spec.txt file.
 *
 * Format:
 *   UNIT: 636L
 *   TITLE: 2024 Ford F-550 Bucket Truck
 *   YEAR: 2024
 *   TYPE: Bucket Truck
 *
 *   [CAB AND CHASSIS]
 *   line item one
 *   line item two
 *
 *   [AERIAL DEVICE]
 *   ...
 */
function parseUnit(unitDir) {
  const specFile = path.join(unitDir, 'spec.txt');
  if (!fs.existsSync(specFile)) {
    throw new Error(`spec.txt not found in: ${unitDir}`);
  }

  const lines = fs.readFileSync(specFile, 'utf8').split('\n').map(l => l.trim());

  const meta     = {};
  const sections = [];
  let current    = null;

  for (const line of lines) {
    if (!line) continue;

    // Section header: [NAME]
    if (line.startsWith('[') && line.endsWith(']')) {
      current = { heading: line.slice(1, -1).trim(), items: [] };
      sections.push(current);
      continue;
    }

    if (current) {
      // Inside a section — every non-blank line is a spec item
      current.items.push(line);
    } else {
      // Header key: value pairs (before first section)
      const i = line.indexOf(':');
      if (i > 0) {
        const key = line.slice(0, i).trim().toLowerCase().replace(/\s+/g, '_');
        const val = line.slice(i + 1).trim();
        meta[key] = val;
      }
    }
  }

  return {
    unit:     meta.unit     || path.basename(unitDir),
    title:    meta.title    || '',
    year:     meta.year     || '',
    type:     meta.type     || '',
    price:    meta.price    || '',
    sections,
    meta,
  };
}

module.exports = { parseUnit };
