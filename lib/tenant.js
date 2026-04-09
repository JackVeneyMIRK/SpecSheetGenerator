'use strict';
const fs   = require('fs');
const path = require('path');

let _map = null;
const ROOT = process.cwd();

function getMap() {
  if (_map) return _map;
  const file = path.join(ROOT, 'config', 'tenants.json');
  _map = JSON.parse(fs.readFileSync(file, 'utf8'));
  return _map;
}

/**
 * Return the tenant slug for a given hostname, or null if unknown.
 * Strips leading "www." before lookup.
 */
function tenantFromHost(hostname) {
  if (!hostname) return null;
  const map = getMap();
  const h   = hostname.toLowerCase().replace(/^www\./, '');
  return map[h] ?? null;
}

module.exports = { tenantFromHost };
