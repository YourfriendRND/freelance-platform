import { expect, test } from '@playwright/test';
import {
  fillRegisterForm,
  openRegisterPage,
  registerUserByUi,
  submitRegisterForm,
  waitForAppPath,
} from '../support/auth';
import { createRegisterUser } from '../support/users';

test('registers a user and redirects to login', async ({ page }) => {
  const user = createRegisterUser('register-happy');

  await registerUserByUi(page, user);

  await waitForAppPath(page, '/login');
  await expect(page.getByText('С возвращением')).toBeVisible();
  await expect(page.locator('#login-email')).toBeVisible();
});

test('shows an API error when email is already registered', async ({ page }) => {
  const user = createRegisterUser('register-duplicate');

  await registerUserByUi(page, user);
  await openRegisterPage(page);
  await fillRegisterForm(page, user);

  const joinResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/join') &&
      response.request().method() === 'POST',
  );

  await submitRegisterForm(page);

  const joinResponse = await joinResponsePromise;
  const submitError = page.locator('.register-form__submit-error');

  expect(joinResponse.status()).toBe(409);
  await expect(submitError).toHaveAttribute('role', 'alert');
  await expect(submitError).toHaveText(
    `Пользователь с "${user.email}" уже зарегистрирован`,
  );
  await waitForAppPath(page, '/register');
});
