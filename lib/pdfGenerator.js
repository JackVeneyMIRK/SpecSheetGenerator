'use strict';
const puppeteer = require('puppeteer');

let _browser = null;

async function getBrowser() {
  if (_browser) {
    // Check if still alive; relaunch if not
    try {
      await _browser.version();
      return _browser;
    } catch {
      _browser = null;
    }
  }
  _browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  return _browser;
}

/**
 * Render an HTML string to a PDF buffer (Letter size, no margins —
 * all spacing is handled in the template CSS).
 */
async function generatePDF(html) {
  const browser = await getBrowser();
  const page    = await browser.newPage();
  try {
    // All images are base64 inline, so networkidle0 resolves immediately.
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({
      format:          'Letter',
      printBackground: true,
      margin:          { top: '0', right: '0', bottom: '0', left: '0' },
    });
  } finally {
    await page.close();
  }
}

process.on('exit', () => _browser?.close());

module.exports = { generatePDF };
