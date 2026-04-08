'use strict';
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const ejs     = require('ejs');

const { parseUnit }               = require('./lib/parseUnit');
const { unitPhotos, logoDataUri } = require('./lib/imageHelper');
const { generatePDF }             = require('./lib/pdfGenerator');
const { tenantFromHost }          = require('./lib/tenant');

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  return fs.readdirSync(dir).filter(d =>
    fs.statSync(path.join(dir, d)).isDirectory()
  );
}

function listTenants() {
  return fs.readdirSync(path.join(ROOT, 'config')).filter(d =>
    fs.statSync(path.join(ROOT, 'config', d)).isDirectory()
  );
}

function buildData(tenant, unitId) {
  const company = loadCompany(tenant);
  const brand   = loadBrand(tenant);
  const unitDir = path.join(ROOT, 'config', tenant, 'units', unitId);
  if (!fs.existsSync(unitDir)) throw Object.assign(new Error(`Unit not found: ${unitId}`), { status: 404 });
  const unit    = parseUnit(unitDir);
  const photos  = unitPhotos(tenant, unitId);
  const logoUri        = logoDataUri(company.logo);
  const headerImageUri = logoDataUri(company.header_image) || null;
  return { company, brand, unit, photos, logoUri, headerImageUri };
}

async function renderSheet(tenant, unitId, asTenant) {
  const brandTenant  = asTenant || tenant;
  const unitData     = buildData(tenant, unitId);
  // If rendering as a different tenant, swap in that tenant's company + brand
  if (asTenant && asTenant !== tenant) {
    unitData.company        = loadCompany(asTenant);
    unitData.brand          = loadBrand(asTenant);
    unitData.logoUri        = logoDataUri(unitData.company.logo);
    unitData.headerImageUri = logoDataUri(unitData.company.header_image) || null;
  }
  const templatePath = path.join(ROOT, 'templates', `${brandTenant}.ejs`);
  if (!fs.existsSync(templatePath)) throw new Error(`No template for tenant: ${brandTenant}`);
  return ejs.renderFile(templatePath, unitData);
}

function resolveTenant(req) {
  return tenantFromHost(req.hostname) ?? req.query.tenant ?? 'mirk';
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Index — list all tenants and their units
app.get('/', async (_req, res) => {
  const tenants = listTenants();
  const items   = tenants.map(t => ({ tenant: t, units: listUnits(t) }));
  const html    = await ejs.renderFile(path.join(ROOT, 'templates', 'index.ejs'), { items });
  res.send(html);
});

// Preview (explicit tenant in URL)
app.get('/preview/:tenant/:unitId', async (req, res) => {
  const { tenant, unitId } = req.params;
  const asTenant = req.query.as || null;
  try {
    res.send(await renderSheet(tenant, unitId, asTenant));
  } catch (e) {
    res.status(e.status ?? 500).send(`<pre style="font:14px monospace;padding:24px">${e.stack}</pre>`);
  }
});

// PDF inline preview (explicit tenant in URL)
app.get('/pdf-view/:tenant/:unitId', async (req, res) => {
  const { tenant, unitId } = req.params;
  const asTenant = req.query.as || null;
  try {
    const html = await renderSheet(tenant, unitId, asTenant);
    const buf  = await generatePDF(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${unitId}.pdf"`);
    res.send(buf);
  } catch (e) {
    res.status(e.status ?? 500).send(`Error: ${e.message}`);
  }
});

// PDF download (explicit tenant in URL)
app.get('/pdf/:tenant/:unitId', async (req, res) => {
  const { tenant, unitId } = req.params;
  const asTenant = req.query.as || null;
  try {
    const html = await renderSheet(tenant, unitId, asTenant);
    const buf  = await generatePDF(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${unitId}.pdf"`);
    res.send(buf);
  } catch (e) {
    res.status(e.status ?? 500).send(`Error: ${e.message}`);
  }
});

// Domain-based routes (production — tenant resolved from hostname)
app.get('/:unitId', async (req, res) => {
  if (req.params.unitId === 'favicon.ico') return res.status(404).end();
  const tenant = resolveTenant(req);
  try {
    res.send(await renderSheet(tenant, req.params.unitId));
  } catch (e) {
    res.status(e.status ?? 500).send(`Error: ${e.message}`);
  }
});

app.get('/:unitId/pdf', async (req, res) => {
  const tenant      = resolveTenant(req);
  const { unitId }  = req.params;
  try {
    const html = await renderSheet(tenant, unitId);
    const buf  = await generatePDF(html);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${unitId}.pdf"`);
    res.send(buf);
  } catch (e) {
    res.status(e.status ?? 500).send(`Error: ${e.message}`);
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\nSpec Sheet Generator`);
  console.log(`  Index:    http://localhost:${PORT}/`);
  console.log(`  Preview:  http://localhost:${PORT}/preview/mirk/636L`);
  console.log(`  PDF:      http://localhost:${PORT}/pdf/mirk/636L\n`);
});
