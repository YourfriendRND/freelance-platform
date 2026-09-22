import { expect, test } from '@playwright/test';
import {
  loginUserByUi,
  logoutUserByUi,
  registerUserByUi,
  waitForAppPath,
} from '../support/auth';
import { createRegisterUser } from '../support/users';

test('shows the current user on profile after session me', async ({ page }) => {
  const user = createRegisterUser('current-user');
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  await registerUserByUi(page, user);
  await loginUserByUi(page, {
    email: user.email,
    password: user.password,
  });

  const meResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/me') &&
      response.request().method() === 'GET',
  );

  await page.goto('/profile');

  const meResponse = await meResponsePromise;

  expect(meResponse.status()).toBe(200);
  await waitForAppPath(page, '/profile');
  await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
  await expect(page.getByText(user.email)).toBeVisible();
});

test('keeps the user on profile after session refresh', async ({ page }) => {
  const user = createRegisterUser('refresh-session');
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  await registerUserByUi(page, user);
  await loginUserByUi(page, {
    email: user.email,
    password: user.password,
  });

  const refreshResponse = await page.request.post('/api/auth/refresh', {
    data: {},
  });

  expect(refreshResponse.status()).toBe(200);

  await page.goto('/profile');
  await waitForAppPath(page, '/profile');
  await expect(page.getByRole('heading', { name: displayName })).toBeVisible();
  await expect(page.getByText(user.email)).toBeVisible();
});

test('logout and blocks profile for a guest', async ({ page }) => {
  const user = createRegisterUser('logout-session');

  await registerUserByUi(page, user);
  await loginUserByUi(page, {
    email: user.email,
    password: user.password,
  });
  await logoutUserByUi(page);

  await expect(page.getByText('Добро пожаловать')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();

  await page.goto('/profile');
  await waitForAppPath(page, '/welcome');
  await expect(page.getByText('Добро пожаловать')).toBeVisible();
});
