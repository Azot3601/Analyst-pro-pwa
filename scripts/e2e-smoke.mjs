/* global document, getComputedStyle, window */
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

async function verifySqlLayout(page, viewport, label) {
  const layout = await page.evaluate(() => {
    const rect = (id) => {
      const element = document.querySelector(`[data-testid="${id}"]`);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { x: box.x, y: box.y, width: box.width, height: box.height, display: style.display };
    };
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      editor: rect('sql-editor'),
      dataPanels: document.querySelectorAll('[data-testid="sql-data-panel"]').length,
      sidebar: rect('quest-sidebar'),
      workspace: rect('quest-workspace'),
      aside: rect('quest-aside'),
      mobileTabs: rect('mobile-quest-tabs')
    };
  });

  if (layout.scrollWidth > layout.viewportWidth + 2) {
    throw new Error(`${label}: обнаружен горизонтальный overflow`);
  }
  if (!layout.editor || layout.editor.y > viewport.height) {
    throw new Error(`${label}: SQL-редактор не виден в первом экране`);
  }
  if (layout.dataPanels !== 1) {
    throw new Error(`${label}: ожидался один блок данных, найдено ${layout.dataPanels}`);
  }

  if (viewport.width >= 1280) {
    if (!layout.sidebar || !layout.workspace || !layout.aside) {
      throw new Error(`${label}: отсутствует desktop layout`);
    }
    if (!(layout.sidebar.x + layout.sidebar.width < layout.workspace.x)) {
      throw new Error(`${label}: левая колонка не находится перед workspace`);
    }
    if (!(layout.workspace.x + layout.workspace.width < layout.aside.x)) {
      throw new Error(`${label}: правая колонка не находится после workspace`);
    }
  } else {
    if (!layout.mobileTabs || layout.mobileTabs.display === 'none') {
      throw new Error(`${label}: mobile-вкладки не видны`);
    }
    const sqlTab = page.getByRole('tab', { name: 'SQL', exact: true });
    if ((await sqlTab.getAttribute('aria-selected')) !== 'true') {
      throw new Error(`${label}: SQL-вкладка не активна по умолчанию`);
    }
  }
}

async function runScenario(browser, viewport, label, fullFlow = false) {
  const page = await browser.newPage({ viewport });

  await page.goto(`http://127.0.0.1:${port}/trainer`, { waitUntil: 'domcontentloaded' });
  let text = await page.locator('body').innerText();
  assertText(text, 'SQL-редактор', `${label} trainer`);
  assertText(text, 'Открыть книгу заказов', `${label} trainer`);
  await verifySqlLayout(page, viewport, label);

  if (!fullFlow) {
    await page.close();
    return;
  }

  await page.getByText('Подсказка', { exact: true }).click();
  if (viewport.width < 1280) {
    await page.getByRole('tab', { name: 'Подсказки', exact: true }).click();
  }
  await page.waitForFunction("document.body.innerText.includes('Подсказка 1')", null, { timeout: 10_000 });
  text = await page.locator('body').innerText();
  assertText(text, 'Подсказка 1', `${label} hint`);
  if (viewport.width < 1280) {
    await page.getByRole('tab', { name: 'SQL', exact: true }).click();
  }
  await page.getByText('Запустить', { exact: true }).click();
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
  await runScenario(browser, { width: 1440, height: 1000 }, 'desktop-1440', true);
  await runScenario(browser, { width: 1366, height: 768 }, 'laptop-1366');
  await runScenario(browser, { width: 768, height: 1024 }, 'tablet-768');
  await runScenario(browser, { width: 390, height: 844 }, 'mobile-390', true);
  console.log('E2E smoke passed: responsive SQL Quest, toolkit, knowledge, and progress.');
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
