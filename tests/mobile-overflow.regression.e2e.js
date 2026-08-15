import { test, expect } from '@playwright/test';

test('homepage fits mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bit24wiseclone/', { waitUntil: 'networkidle' });
  const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.width);
  await expect(page.locator('.converter-card')).toBeVisible();
});

 test('terminal stacks book and recent trades as full-width cards on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bit24wiseclone/#/trade/spot-terminal', { waitUntil: 'networkidle' });
  const book = await page.locator('.spot-orderbook').boundingBox();
  const recent = await page.locator('.spot-recent').boundingBox();
  const width = await page.locator('.spot-side-column').boundingBox();
  expect(book.width).toBeGreaterThanOrEqual(width.width - 2);
  expect(recent.width).toBeGreaterThanOrEqual(width.width - 2);
});

 test('terminal supports distinct timeframe geometry and limit-order cancellation', async ({ page }) => {
  await page.goto('/bit24wiseclone/#/trade/spot-terminal', { waitUntil: 'networkidle' });
  const initial = await page.locator('.spot-chart-canvas polyline').getAttribute('points');
  await page.getByRole('button', { name: '۱روز' }).click();
  await expect(page.getByRole('img', { name: /در بازه ۱روز/ })).toBeVisible();
  await expect(page.locator('.spot-chart-canvas polyline')).not.toHaveAttribute('points', initial);
  await page.getByLabel('مقدار خرید').fill('0.01');
  await page.getByRole('button', { name: 'ثبت سفارش خرید' }).click();
  await page.locator('.spot-cancel-order').click();
  await expect(page.locator('.spot-cancel-order')).toHaveCount(0);
});
