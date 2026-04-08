'use strict';
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const { parseUnit } = require('./parseUnit');
const { unitPhotos, logoDataUri } = require('./imageHelper');

const ROOT = process.cwd();

function loadCompany(tenant) {
  const file = path.join(ROOT, 'config', tenant, 'company.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadBrand(tenant) {
  const file = path.join(ROOT, 'config', tenant, 'brand.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listUnits(tenant) {
  const dir = path.join(ROOT, 'config', tenant, 'units');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory());
}

function listTenants() {
  const dir = path.join(ROOT, 'config');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory());
}

async function buildData(tenant, unitId) {
  const company = loadCompany(tenant);
  const brand = loadBrand(tenant);
  const unitDir = path.join(ROOT, 'config', tenant, 'units', unitId);
  if (!fs.existsSync(unitDir)) throw Object.assign(new Error(`Unit not found: ${unitId}`), { status: 404 });
  const unit = parseUnit(unitDir);
  const photos = await unitPhotos(tenant, unitId);
  const logoUri = logoDataUri(company.logo);
  const headerImageUri = logoDataUri(company.header_image) || null;
  return { company, brand, unit, photos, logoUri, headerImageUri };
}

async function renderSheet(tenant, unitId, asTenant) {
  const brandTenant = asTenant || tenant;
  const unitData = await buildData(tenant, unitId);

  if (asTenant && asTenant !== tenant) {
    unitData.company = loadCompany(asTenant);
    unitData.brand = loadBrand(asTenant);
    unitData.logoUri = logoDataUri(unitData.company.logo);
    unitData.headerImageUri = logoDataUri(unitData.company.header_image) || null;
  }

  const templatePath = path.join(ROOT, 'templates', `${brandTenant}.ejs`);
  if (!fs.existsSync(templatePath)) throw new Error(`No template for tenant: ${brandTenant}`);
  return ejs.renderFile(templatePath, unitData);
}

module.exports = {
  listTenants,
  listUnits,
  buildData,
  renderSheet,
};
