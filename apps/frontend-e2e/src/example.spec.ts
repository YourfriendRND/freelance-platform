import { test, expect } from '@playwright/test';
import { waitForAppPath } from './support/auth';

test('shows welcome page on startup', async ({ page }) => {
  await page.goto('/');
  await waitForAppPath(page, '/welcome');

  await expect(page.getByText('Добро пожаловать')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
});
