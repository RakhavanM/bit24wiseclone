import { test, expect } from '@playwright/test';

test('desktop positions recent trades left of chart and order book right of chart', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/bit24wiseclone/#/trade/spot-terminal', { waitUntil: 'networkidle' });
  const book = await page.locator('.spot-orderbook').boundingBox();
  const chart = await page.locator('.spot-chart-panel').boundingBox();
  const recent = await page.locator('.spot-recent').boundingBox();
  const orderForm = await page.locator('.spot-trade-card').boundingBox();
  expect(book.x).toBeGreaterThan(chart.x + chart.width);
  expect(recent.x + recent.width).toBeLessThan(chart.x);
  expect(book.width).toBeGreaterThanOrEqual(290);
  expect(recent.width).toBeGreaterThanOrEqual(290);
  expect(orderForm.x).toBeGreaterThan(chart.x - 2);
  expect(orderForm.x + orderForm.width).toBeLessThan(chart.x + chart.width + 2);
  expect(orderForm.y).toBeGreaterThan(chart.y + chart.height - 10);
});

 test('spot order type selector exposes limit market and stop choices', async ({ page }) => {
  await page.goto('/bit24wiseclone/#/trade/spot-terminal', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'نوع سفارش' }).click();
  await expect(page.getByRole('option', { name: 'محدود' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'بازار' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'حد ضرر' })).toBeVisible();
});
