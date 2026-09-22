import { expect, test } from '@playwright/test';
import {
  loginUserByUi,
  registerUserByUi,
  waitForAppPath,
} from '../support/auth';
import { createRegisterUser } from '../support/users';

const protectedPaths = ['/profile', '/analytics', '/tasks/create'] as const;
const guestPaths = ['/login', '/register'] as const;

for (const path of protectedPaths) {
  test(`redirects a guest from ${path} to welcome`, async ({ page }) => {
    await page.goto(path);
    await waitForAppPath(page, '/welcome');
    await expect(page.getByText('Добро пожаловать')).toBeVisible();
  });
}

for (const path of guestPaths) {
  test(`redirects an authenticated user from ${path} to tasks`, async ({
    page,
  }) => {
    const user = createRegisterUser(`guest-guard-${path.slice(1)}`);

    await registerUserByUi(page, user);
    await loginUserByUi(page, {
      email: user.email,
      password: user.password,
    });

    await page.goto(path);
    await waitForAppPath(page, '/tasks');
    await expect(page.getByRole('heading', { name: 'Задачи' })).toBeVisible();
  });
}
