import { expect, test } from '@playwright/test';

test('opens app and navigates to trainer', async ({ page }) => {
  await page.goto('/trainer', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toContainText('SQL-квест');
  await expect(page.locator('body')).toContainText('Данные для этого шага');
  await expect(page.locator('body')).toContainText('Шаг 1. Прочитать таблицу заказов');
  await page.getByText('Открыть подсказку').click();
  await expect(page.locator('body')).toContainText('Подсказка 2');
});

test('uses JSON formatter tool', async ({ page }) => {
  await page.goto('/toolkit', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toContainText('JSON formatter');
  await page.getByRole('button', { name: 'Выполнить локально' }).click();
  await expect(page.locator('body')).toContainText('"orderId": "ord-1001"');
});

test('opens knowledge graph', async ({ page }) => {
  await page.goto('/knowledge', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toContainText('Граф знаний');
  await expect(page.locator('body')).toContainText('База знаний');
});
