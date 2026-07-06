import { test, expect } from '@playwright/test';

test('shows registration page on startup', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Создать аккаунт' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Создать аккаунт' })).toBeVisible();
});
