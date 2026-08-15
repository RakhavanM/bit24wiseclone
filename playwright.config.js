import { defineConfig } from '@playwright/test';

process.env.VITEST = '';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.e2e\.js$/,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:5174/bit24wiseclone/',
    browserName: 'chromium',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5174/bit24wiseclone/',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  reporter: [['list']],
});
