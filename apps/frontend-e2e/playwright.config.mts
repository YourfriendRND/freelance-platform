import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:4200';
const ci = !!process.env['CI'];
const outputRoot = '../../dist/.playwright/apps/frontend-e2e';
const reporter = [
  ['list'],
  [
    'html',
    {
      outputFolder: `${outputRoot}/playwright-report`,
      open: 'never',
    },
  ],
];

if (ci) {
  reporter.push([
    'blob',
    {
      outputDir: `${outputRoot}/blob-report`,
    },
  ]);
}

export default defineConfig({
  testDir: './src',
  outputDir: `${outputRoot}/test-output`,
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  workers: ci ? 1 : undefined,
  globalSetup: './src/support/global-setup.ts',
  reporter,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: /example\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: /example\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
