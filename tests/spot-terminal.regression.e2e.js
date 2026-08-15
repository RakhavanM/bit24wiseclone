import { test, expect } from '@playwright/test';

test.describe('Bit24Wise spot terminal regressions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bit24wiseclone/#/trade/spot-terminal');
    await page.evaluate(() => localStorage.removeItem('bit24-spot-account'));
    await page.reload();
  });

  test('both spot landing CTAs link to the working simulated terminal', async ({ page }) => {
    await page.goto('/bit24wiseclone/#/trade/spot');
    await page.getByRole('link', { name: 'شروع معامله' }).click();
    await expect(page).toHaveURL(/#\/trade\/spot-terminal$/);
    await expect(page.getByRole('heading', { name: 'معاملات اسپات' })).toBeVisible();
    await page.goto('/bit24wiseclone/#/trade/spot');
    await expect(page.getByText('انتخاب و شروع کنید.')).toBeVisible();
    await page.getByRole('link', { name: 'ورود به بازار' }).click();
    await expect(page).toHaveURL(/#\/trade\/spot-terminal$/);
  });

  test('places chart between full-width order book and recent trades sides', async ({ page }) => {
    const orderBook = page.locator('.spot-orderbook');
    const recent = page.locator('.spot-recent');
    const chart = page.locator('.spot-chart-panel');
    const trade = page.locator('.spot-trade-card');
    const sideColumn = page.locator('.spot-side-column');
    const bookBox = await orderBook.boundingBox();
    const recentBox = await recent.boundingBox();
    const chartBox = await chart.boundingBox();
    const tradeBox = await trade.boundingBox();
    expect(sideColumn).toHaveCount(1);
    expect(bookBox.width).toBeGreaterThanOrEqual(290);
    expect(recentBox.width).toBeGreaterThanOrEqual(290);
    expect(bookBox.x).toBeGreaterThan(chartBox.x);
    expect(recentBox.x).toBeGreaterThan(chartBox.x);
    expect(tradeBox.y).toBeGreaterThan(chartBox.y + chartBox.height - 10);
    expect(Math.abs(tradeBox.x - chartBox.x)).toBeLessThan(3);
    expect(Math.abs(tradeBox.width - chartBox.width)).toBeLessThan(3);
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
