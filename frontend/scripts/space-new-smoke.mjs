import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL ?? 'http://localhost:5174';
const targetPath = '/space/new';
const targetURL = new URL(targetPath, baseURL).toString();

const defaultImage = path.resolve(
  'D:/React/tour-project/artifacts/20260306-163614-space-new.png'
);
const imagePath = path.resolve(process.argv[2] ?? defaultImage);

const spaceName = process.env.SPACE_NAME ?? `자동화 테스트 공간 ${Date.now()}`;
const price = process.env.SPACE_PRICE ?? '12345';
const detailText = process.env.SPACE_DETAIL ?? 'Quill 에디터 테스트 입력입니다.';

const apiPathFragment = '/api/space/new';

const consoleErrors = [];
const consoleWarnings = [];
const pageErrors = [];
const dialogs = [];

let capturedRequest = null;
let capturedRequestHeaders = null;
let capturedRequestContentType = null;
let capturedResponse = null;
let capturedResponseText = null;
let capturedResponseHeaders = null;
let capturedResponseBodyLength = null;

function snippet(text, max = 2000) {
  if (text == null) return null;
  const s = String(text);
  return s.length > max ? `${s.slice(0, max)}\n…(truncated ${s.length - max} chars)` : s;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', (msg) => {
  const entry = { type: msg.type(), text: msg.text() };
  if (msg.type() === 'error') consoleErrors.push(entry);
  else if (msg.type() === 'warning') consoleWarnings.push(entry);
});

page.on('pageerror', (err) => {
  pageErrors.push({ message: err?.message ?? String(err) });
});

page.on('dialog', async (dialog) => {
  dialogs.push({ type: dialog.type(), message: dialog.message() });
  await dialog.accept();
});

try {
  await page.goto(targetURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // "Hard reload" approximation: reload after first load from a fresh context.
  // (New context reduces cache effects; reload ensures re-fetch of assets.)
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.locator('input[placeholder="공간명"]').fill(spaceName);
  await page.locator('input[placeholder="가격"]').fill(String(price));

  const editor = page.locator('.ql-editor');
  await editor.click();
  await editor.fill(detailText);

  await page.setInputFiles('input[type="file"]', [imagePath]);

  const [req, resp] = await Promise.all([
    page.waitForRequest((r) => r.url().includes(apiPathFragment) && r.method() === 'POST', {
      timeout: 30000,
    }),
    page.waitForResponse((r) => r.url().includes(apiPathFragment), { timeout: 30000 }),
    page.locator('button[type="submit"]').click(),
  ]);

  capturedRequest = {
    url: req.url(),
    method: req.method(),
  };
  capturedRequestHeaders = req.headers();
  capturedRequestContentType =
    capturedRequestHeaders?.['content-type'] ??
    capturedRequestHeaders?.['Content-Type'] ??
    null;

  capturedResponse = {
    url: resp.url(),
    status: resp.status(),
    statusText: resp.statusText(),
  };
  capturedResponseHeaders = resp.headers();

  try {
    capturedResponseText = await resp.text();
  } catch (e) {
    capturedResponseText = `<<response.text() failed: ${e?.message ?? String(e)}>>`;
  }

  try {
    const body = await resp.body();
    capturedResponseBodyLength = body?.byteLength ?? null;
  } catch (e) {
    capturedResponseBodyLength = `<<response.body() failed: ${e?.message ?? String(e)}>>`;
  }

  await page.waitForTimeout(1000);
} catch (e) {
  pageErrors.push({ message: e?.message ?? String(e) });
} finally {
  await browser.close();
}

const result = {
  targetURL,
  imagePath,
  request: capturedRequest,
  requestHeaders: capturedRequestHeaders,
  requestContentType: capturedRequestContentType,
  response: capturedResponse,
  responseHeaders: capturedResponseHeaders,
  responseBodyLength: capturedResponseBodyLength,
  responseTextSnippet: snippet(capturedResponseText),
  dialogs,
  consoleErrors,
  consoleWarnings,
  pageErrors,
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
