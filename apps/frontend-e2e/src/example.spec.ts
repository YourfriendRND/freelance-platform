import { test, expect } from '@playwright/test';

test('shows login page on startup', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'С возвращением' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
});
