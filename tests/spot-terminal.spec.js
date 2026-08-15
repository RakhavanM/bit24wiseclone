import { test, expect } from '@playwright/test';

test.describe('Bit24Wise spot terminal', () => {
  test('renders the simulated trading workspace and symbol selector', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/bit24wiseclone/#/trade/spot-terminal');
    await expect(page.getByRole('heading', { name: 'معاملات اسپات' })).toBeVisible();
    await expect(page.getByLabel('انتخاب نماد معاملاتی')).toContainText('BTC/USDT');
    await expect(page.getByText('دفتر سفارشات')).toBeVisible();
    await expect(page.getByText('معاملات اخیر')).toBeVisible();
    await expect(page.getByRole('button', { name: 'خرید' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'فروش' })).toBeVisible();
  });

  test('changes symbols and switches order types', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/bit24wiseclone/#/trade/spot-terminal');
    await page.getByRole('button', { name: 'انتخاب نماد معاملاتی' }).click();
    await page.getByRole('option', { name: /ETH\/USDT/ }).click();
    await expect(page.getByLabel('انتخاب نماد معاملاتی')).toContainText('ETH/USDT');
    await page.getByRole('button', { name: 'نوع سفارش' }).click();
    await page.getByRole('option', { name: 'بازار' }).click();
    await expect(page.getByText('قیمت بازار')).toBeVisible();
  });

  test('simulates a market buy, updates balances and records the fill', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/bit24wiseclone/#/trade/spot-terminal');
    await page.getByRole('button', { name: 'بازار' }).click();
    await page.getByRole('option', { name: 'بازار' }).click();
    await page.getByLabel('مقدار خرید').fill('0.01');
    await page.getByRole('button', { name: 'ثبت سفارش خرید' }).click();
    await expect(page.getByText('سفارش با موفقیت اجرا شد')).toBeVisible();
    await expect(page.getByText('تاریخچه معاملات')).toBeVisible();
    await expect(page.locator('.spot-history-row').first()).toContainText('خرید');
  });

  test('uses order book prices and persists the simulated account', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/bit24wiseclone/#/trade/spot-terminal');
    await page.locator('.spot-order-row').first().click();
    await expect(page.getByLabel('قیمت سفارش')).not.toHaveValue('');
    await page.getByLabel('مقدار خرید').fill('0.01');
    await page.getByRole('button', { name: 'ثبت سفارش خرید' }).click();
    await page.reload();
    await expect(page.getByText('سفارش با موفقیت اجرا شد')).toHaveCount(0);
    await expect(page.locator('.spot-history-row')).toHaveCount(1);
  });
});
