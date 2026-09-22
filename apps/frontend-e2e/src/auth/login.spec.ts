import { expect, test } from '@playwright/test';
import { E2E_USER_PASSWORD } from '@freelance-platform/shared-mock';
import {
  fillLoginForm,
  loginUserByUi,
  openLoginPage,
  registerUserByUi,
  submitLoginForm,
} from '../support/auth';
import { createRegisterUser, uniqueEmail } from '../support/users';

test('login and opens tasks with logout in the header', async ({ page }) => {
  const user = createRegisterUser('login-happy');

  await registerUserByUi(page, user);
  await loginUserByUi(page, {
    email: user.email,
    password: user.password,
  });

  await expect(page.getByRole('heading', { name: 'Задачи' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
});

test('shows an API error when password is wrong', async ({ page }) => {
  const user = createRegisterUser('login-bad-password');

  await registerUserByUi(page, user);
  await openLoginPage(page);
  await fillLoginForm(page, {
    email: user.email,
    password: 'wrong-password',
  });

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/login') &&
      response.request().method() === 'POST',
  );

  await submitLoginForm(page);

  const loginResponse = await loginResponsePromise;
  const submitError = page.locator('.login-form__submit-error');

  expect(loginResponse.status()).toBe(401);
  await expect(submitError).toHaveAttribute('role', 'alert');
  await expect(submitError).toHaveText('Неверный пароль');
});

test('shows an API error when email is unknown', async ({ page }) => {
  const email = uniqueEmail('login-unknown');

  await openLoginPage(page);
  await fillLoginForm(page, {
    email,
    password: E2E_USER_PASSWORD,
  });

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/login') &&
      response.request().method() === 'POST',
  );

  await submitLoginForm(page);

  const loginResponse = await loginResponsePromise;
  const submitError = page.locator('.login-form__submit-error');

  expect(loginResponse.status()).toBe(404);
  await expect(submitError).toHaveAttribute('role', 'alert');
  await expect(submitError).toHaveText(`Пользователь с "${email}" не найден`);
});
