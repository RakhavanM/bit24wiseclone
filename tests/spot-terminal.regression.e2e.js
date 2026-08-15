import { test, expect } from '@playwright/test';

test.describe('Bit24Wise spot terminal regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bit24wiseclone/#/trade/spot-terminal');
    await page.evaluate(() => localStorage.removeItem('bit24-spot-account'));
    await page.reload();
  });

  test('spot landing links to the working simulated terminal', async ({ page }) => {
    await page.goto('/bit24wiseclone/#/trade/spot');
    await page.getByRole('link', { name: 'ورود به محیط معامله' }).click();
    await expect(page).toHaveURL(/#\/trade\/spot-terminal$/);
    await expect(page.getByRole('heading', { name: 'معاملات اسپات' })).toBeVisible();
  });

  test('keeps order book and recent trades together with usable widths', async ({ page }) => {
    const orderBook = page.locator('.spot-orderbook');
    const recent = page.locator('.spot-recent');
    const sideColumn = page.locator('.spot-side-column');
    const bookBox = await orderBook.boundingBox();
    const recentBox = await recent.boundingBox();
    const sideBox = await sideColumn.boundingBox();
    expect(sideColumn.locator('.spot-orderbook')).toHaveCount(1);
    expect(sideColumn.locator('.spot-recent')).toHaveCount(1);
    expect(recentBox.y).toBeGreaterThan(bookBox.y + bookBox.height - 2);
    expect(sideBox.width).toBeGreaterThanOrEqual(320);
  });

  test('changes the actual chart geometry when timeframe changes', async ({ page }) => {
    const chart = page.locator('.spot-chart-canvas polyline');
    const before = await chart.getAttribute('points');
    await page.getByRole('button', { name: '۱روز' }).click();
    await expect(page.locator('.spot-chart-meta')).toContainText('بازه‌ی انتخابی ۱روز');
    const after = await chart.getAttribute('points');
    expect(after).not.toBe(before);
    await expect(page.getByRole('img', { name: /در بازه ۱روز/ })).toBeVisible();
  });

  test('rejects an over-sized limit order and reserves/cancels a valid one', async ({ page }) => {
    await page.getByLabel('مقدار خرید').fill('1');
    await page.getByRole('button', { name: 'ثبت سفارش خرید' }).click();
    await expect(page.getByText(/موجودی USDT برای این سفارش کافی نیست/)).toBeVisible();

    await page.getByLabel('مقدار خرید').fill('0.01');
    await page.getByRole('button', { name: 'ثبت سفارش خرید' }).click();
    await expect(page.getByText('سفارش در فهرست سفارش‌های باز قرار گرفت.')).toBeVisible();
    await expect(page.locator('.spot-cancel-order')).toHaveCount(1);
    await page.locator('.spot-cancel-order').click();
    await expect(page.getByText('سفارش لغو شد و موجودی آزاد شد.')).toBeVisible();
    await expect(page.locator('.spot-cancel-order')).toHaveCount(0);
  });
});
