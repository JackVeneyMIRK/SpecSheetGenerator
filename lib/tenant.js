'use strict';
const fs   = require('fs');
const path = require('path');

let _map = null;
const ROOT = process.cwd();

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const normalized = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;
  return JSON.parse(normalized);
}

function loadTenantDomainFiles() {
  const configDir = path.join(ROOT, 'config');
  if (!fs.existsSync(configDir)) return {};

  const map = {};
  const tenants = fs.readdirSync(configDir).filter((name) =>
    fs.statSync(path.join(configDir, name)).isDirectory()
  );

  for (const tenant of tenants) {
    const domainsFile = path.join(configDir, tenant, 'domains.json');
    if (!fs.existsSync(domainsFile)) continue;

    const domains = readJson(domainsFile);
    if (!Array.isArray(domains)) continue;

    for (const domain of domains) {
      if (!domain || typeof domain !== 'string') continue;
      map[domain.toLowerCase()] = tenant;
    }
  }

  return map;
}

function getMap() {
  if (_map) return _map;
  _map = loadTenantDomainFiles();

  // Backward-compatible fallback for existing central mapping.
  const legacyFile = path.join(ROOT, 'config', 'tenants.json');
  if (fs.existsSync(legacyFile)) {
    const legacyMap = readJson(legacyFile);
    for (const [domain, tenant] of Object.entries(legacyMap)) {
      if (!_map[domain.toLowerCase()]) _map[domain.toLowerCase()] = tenant;
    }
  }

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
