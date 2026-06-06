import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const port = 4199;
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm'
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
    let filePath = path.join(root, decodeURIComponent(url.pathname));
    if (url.pathname === '/' || !path.extname(filePath)) {
      filePath = path.join(root, 'index.html');
    }
    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': mime[path.extname(filePath)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    const data = await readFile(path.join(root, 'index.html'));
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(data);
  }
});

function assertText(text, expected, label) {
  if (!text.includes(expected)) {
    throw new Error(`${label}: не найден текст "${expected}"`);
  }
}

async function runScenario(browser, viewport, label) {
  const page = await browser.newPage({ viewport });

  await page.goto(`http://127.0.0.1:${port}/trainer`, { waitUntil: 'domcontentloaded' });
  let text = await page.locator('body').innerText();
  assertText(text, 'SQL Quest Mode', `${label} trainer`);
  assertText(text, 'Данные для этого шага', `${label} trainer`);
  assertText(text, 'Открыть книгу заказов', `${label} trainer`);
  await page.getByText('Открыть подсказку').click();
  await page.waitForFunction("document.body.innerText.includes('Подсказка 1')", null, { timeout: 10_000 });
  text = await page.locator('body').innerText();
  assertText(text, 'Подсказка 1', `${label} hint`);
  await page.getByText('Запустить и проверить').click();
  await page.waitForFunction(
    "document.body.innerText.includes('Результат совпадает с эталоном') || document.body.innerText.includes('SQL не выполнен')",
    null,
    { timeout: 15_000 }
  );
  text = await page.locator('body').innerText();
  assertText(text, 'Результат совпадает с эталоном', `${label} sql execution`);
  assertText(text, '1003', `${label} sql result table`);
  await page.reload({ waitUntil: 'domcontentloaded' });
  text = await page.locator('body').innerText();
  assertText(text, '40', `${label} sql progress after reload`);

  await page.goto(`http://127.0.0.1:${port}/progress`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction("document.body.innerText.includes('Открыть книгу заказов')", null, {
    timeout: 10_000
  });
  text = await page.locator('body').innerText();
  assertText(text, 'XP в SQL Quest', `${label} progress page`);
  assertText(text, 'Открыть книгу заказов', `${label} progress recent lesson`);

  await page.goto(`http://127.0.0.1:${port}/toolkit`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Выполнить локально' }).click();
  text = await page.locator('body').innerText();
  assertText(text, '"orderId": "ord-1001"', `${label} json formatter`);

  await page.goto(`http://127.0.0.1:${port}/knowledge`, { waitUntil: 'domcontentloaded' });
  text = await page.locator('body').innerText();
  assertText(text, 'Граф знаний', `${label} knowledge`);
  assertText(text, 'База знаний', `${label} knowledge`);

  await page.close();
}

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

let browser;
try {
  browser = await chromium.launch({ headless: true });
  await runScenario(browser, { width: 1440, height: 1100 }, 'desktop');
  await runScenario(browser, { width: 412, height: 915 }, 'mobile');
  console.log('E2E smoke passed: trainer, toolkit, knowledge on desktop and mobile.');
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
