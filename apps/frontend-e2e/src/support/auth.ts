import { expect, Page } from '@playwright/test';
import { RegisterUserData } from './users';

type LoginCredentials = {
  email: string;
  password: string;
};

export async function waitForAppPath(page: Page, path: string): Promise<void> {
  await page.waitForURL((url) => url.pathname === path);
}

export async function openRegisterPage(page: Page): Promise<void> {
  await page.goto('/register');
  await waitForAppPath(page, '/register');
}

export async function openLoginPage(page: Page): Promise<void> {
  await page.goto('/login');
  await waitForAppPath(page, '/login');
}

export async function fillRegisterForm(
  page: Page,
  user: RegisterUserData,
): Promise<void> {
  await page.locator('#register-role').selectOption(user.role);
  await page.locator('#register-first-name').fill(user.firstName);

  if (user.lastName) {
    await page.locator('#register-last-name').fill(user.lastName);
  }

  await page.locator('#register-email').fill(user.email);
  await page.locator('#register-password').fill(user.password);
  await page.locator('#register-confirm-password').fill(user.password);
  await page.locator('#register-accept-terms').check();
}

export async function submitRegisterForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
}

export async function fillLoginForm(
  page: Page,
  credentials: LoginCredentials,
): Promise<void> {
  await page.locator('#login-email').fill(credentials.email);
  await page.locator('#login-password').fill(credentials.password);
}

export async function submitLoginForm(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Войти' }).click();
}

export async function registerUserByUi(
  page: Page,
  user: RegisterUserData,
): Promise<void> {
  await openRegisterPage(page);
  await fillRegisterForm(page, user);

  const joinResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/join') &&
      response.request().method() === 'POST',
  );

  await submitRegisterForm(page);

  const joinResponse = await joinResponsePromise;

  expect(joinResponse.status()).toBe(201);
  await waitForAppPath(page, '/login');
}

export async function loginUserByUi(
  page: Page,
  credentials: LoginCredentials,
): Promise<void> {
  await openLoginPage(page);
  await fillLoginForm(page, credentials);

  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/login') &&
      response.request().method() === 'POST',
  );

  await submitLoginForm(page);

  const loginResponse = await loginResponsePromise;

  expect(loginResponse.status()).toBe(200);
  await waitForAppPath(page, '/tasks');
}

export async function logoutUserByUi(page: Page): Promise<void> {
  const logoutResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/auth/logout') &&
      response.request().method() === 'POST',
  );

  await page.getByRole('button', { name: 'Выйти' }).click();

  const logoutResponse = await logoutResponsePromise;

  expect(logoutResponse.status()).toBe(200);
  await waitForAppPath(page, '/welcome');
}
