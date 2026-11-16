import { expect, Page, test } from '@playwright/test';
import { UserRole } from '@freelance-platform/shared-types';
import { loginUserByUi, registerUserByUi, waitForAppPath } from '../support/auth';
import { createRegisterUser, type RegisterUserData } from '../support/users';

async function openAs(page: Page, user: RegisterUserData): Promise<void> {
  await registerUserByUi(page, user);
  await loginUserByUi(page, {
    email: user.email,
    password: user.password,
  });
  await expect(page.getByRole('heading', { level: 1, name: 'Задачи' })).toBeVisible();
  await expect(page.getByText('Навыки')).toHaveCount(0);
}

test('shows an empty skill list for a freelancer', async ({ page }) => {
  const user = createRegisterUser('freelancer-skills', UserRole.Freelancer);
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  await openAs(page, user);

  await page.goto('/profile');
  await waitForAppPath(page, '/profile');
  await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Навыки' })).toBeVisible();
  await expect(page.getByText('Навыки пока не указаны')).toBeVisible();

  await page.goto('/analytics');
  await waitForAppPath(page, '/analytics');
  await expect(page.getByRole('heading', { name: 'Ваш профиль' })).toBeVisible();
  await expect(page.getByText('Навыки не указаны')).toBeVisible();
});

test('hides skills from a customer', async ({ page }) => {
  const user = createRegisterUser('customer-skills', UserRole.Client);
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  await openAs(page, user);

  await page.goto('/profile');
  await waitForAppPath(page, '/profile');
  await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
  await expect(page.getByText('Навыки')).toHaveCount(0);

  await page.goto('/analytics');
  await waitForAppPath(page, '/analytics');
  await expect(page.getByText('Вот что происходит с вашими задачами')).toBeVisible();
  await expect(page.getByText('Навыки')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ваш профиль' })).toHaveCount(0);
});
