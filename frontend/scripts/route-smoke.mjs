import { chromium } from 'playwright';
import fs from 'node:fs/promises';

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function getViteOverlayText(page) {
  const txt = await page.evaluate(() => {
    const el = document.querySelector('vite-error-overlay');
    if (!el) return null;
    const sr = el.shadowRoot;
    const raw = sr ? sr.textContent : el.textContent;
    return raw ?? null;
  });
  const trimmed = typeof txt === 'string' ? txt.trim() : null;
  return trimmed && trimmed.length ? trimmed : null;
}

async function checkUrl(page, url, opts) {
  const out = {
    name: opts.name,
    url,
    finalUrl: null,
    title: null,
    overlayText: null,
    h1: null,
    console: [],
    pageErrors: [],
    requestFailed: [],
    badResponses: [],
    screenshotPath: null,
    clientNav: null,
    linkHrefs: null,
  };

  page.on('console', (msg) => {
    out.console.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    out.pageErrors.push(String(err));
  });
  page.on('requestfailed', (req) => {
    out.requestFailed.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText ?? null,
    });
  });
  page.on('response', (resp) => {
    const status = resp.status();
    if (status >= 400) {
      out.badResponses.push({ url: resp.url(), status });
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForTimeout(1500);

  out.finalUrl = page.url();
  out.title = await page.title().catch(() => null);
  out.overlayText = await getViteOverlayText(page);
  out.h1 = await page
    .locator('h1')
    .first()
    .textContent({ timeout: 1000 })
    .then((t) => (typeof t === 'string' ? t.trim() : null))
    .catch(() => null);

  out.screenshotPath = `artifacts/${opts.stamp}-${opts.name}.png`;
  await page.screenshot({ path: out.screenshotPath, fullPage: true });

  if (opts.collectLinks) {
    out.linkHrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter(Boolean),
    );
  }

  if (opts.tryClientNavToSpaceNew) {
    const hrefs = out.linkHrefs ?? [];
    const hasSpaceNew = hrefs.some((h) => h === '/space/new' || (typeof h === 'string' && h.includes('/space/new')));
    if (!hasSpaceNew) {
      out.clientNav = { attempted: false, reason: 'No link with href containing /space/new found on Home.' };
    } else {
      const before = page.url();
      const clickTarget =
        (await page.locator('a[href="/space/new"]').first().count()) > 0
          ? page.locator('a[href="/space/new"]').first()
          : page.locator('a[href*="/space/new"]').first();
      try {
        await clickTarget.click({ timeout: 2000 });
        await page.waitForTimeout(1500);
        const after = page.url();
        const overlayAfter = await getViteOverlayText(page);
        const screenshotAfter = `artifacts/${opts.stamp}-home-clientnav.png`;
        await page.screenshot({ path: screenshotAfter, fullPage: true });
        out.clientNav = { attempted: true, before, after, overlayTextAfter: overlayAfter, screenshotPath: screenshotAfter };
      } catch (e) {
        out.clientNav = { attempted: true, before, error: String(e) };
      }
    }
  }

  return out;
}

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5174';
const RUN_STAMP = stamp();

const targets = [
  { name: 'home', url: `${BASE_URL}/`, collectLinks: true, tryClientNavToSpaceNew: true },
  { name: 'space-new', url: `${BASE_URL}/space/new` },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const results = [];
for (const t of targets) {
  const r = await checkUrl(page, t.url, { ...t, stamp: RUN_STAMP });
  results.push(r);
}

await browser.close();

const reportPath = `artifacts/${RUN_STAMP}-route-smoke-report.json`;
await fs.writeFile(reportPath, JSON.stringify({ baseUrl: BASE_URL, stamp: RUN_STAMP, results }, null, 2), 'utf8');

console.log(JSON.stringify({ baseUrl: BASE_URL, stamp: RUN_STAMP, reportPath, results }, null, 2));

