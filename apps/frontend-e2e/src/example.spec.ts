import { test, expect } from '@playwright/test';

test('shows welcome page on startup', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Добро пожаловать')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
});
