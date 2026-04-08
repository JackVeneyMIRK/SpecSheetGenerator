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
 * Render an HTML string to a PDF buffer (Letter size, 0.25in margins).
 * Templates size themselves to the 8in × 10.5in content area.
 */
// Content area at 96 dpi (8.5in − 0.5in margins = 8in × 10.5in).
// @page in CSS adds the 0.25in paper margins; viewport matches the content area.
const CONTENT_PX = { width: 768, height: 1008 }; // 8in × 10.5in

async function generatePDF(html) {
  const browser = await getBrowser();
  const page    = await browser.newPage();
  try {
    await page.setViewport({ width: CONTENT_PX.width, height: CONTENT_PX.height });
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
