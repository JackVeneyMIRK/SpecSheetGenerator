'use strict';
const puppeteer = require('puppeteer');

let _browser = null;
const MAX_PARALLEL_PDFS = Number(process.env.PDF_CONCURRENCY || 2);
let activeJobs = 0;
const waitQueue = [];

function acquireSlot() {
  if (activeJobs < MAX_PARALLEL_PDFS) {
    activeJobs += 1;
    return Promise.resolve();
  }
  return new Promise(resolve => waitQueue.push(resolve));
}

function releaseSlot() {
  if (waitQueue.length > 0) {
    const next = waitQueue.shift();
    next();
    return;
  }
  activeJobs = Math.max(0, activeJobs - 1);
}

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

async function closeBrowser() {
  if (!_browser) return;
  try {
    await _browser.close();
  } catch {
    // Ignore shutdown errors.
  } finally {
    _browser = null;
  }
}

/**
 * Render an HTML string to a PDF buffer (Letter size, 0.25in margins).
 * Templates size themselves to the 8in × 10.5in content area.
 */
// Content area at 96 dpi (8.5in − 0.5in margins = 8in × 10.5in).
// @page in CSS adds the 0.25in paper margins; viewport matches the content area.
const CONTENT_PX = { width: 768, height: 1008 }; // 8in × 10.5in

async function generatePDF(html) {
  await acquireSlot();
  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: CONTENT_PX.width, height: CONTENT_PX.height });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    return await page.pdf({
      format:          'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      margin:          { top: '0', right: '0', bottom: '0', left: '0' },
    });
  } finally {
    try {
      if (page) await page.close();
    } finally {
      releaseSlot();
    }
  }
}

process.on('exit', () => { _browser?.close(); });
process.on('SIGINT',  () => { void closeBrowser().finally(() => process.exit(0)); });
process.on('SIGTERM', () => { void closeBrowser().finally(() => process.exit(0)); });

module.exports = { generatePDF };
