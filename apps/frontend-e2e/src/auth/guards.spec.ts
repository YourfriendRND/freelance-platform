import { expect, Page, test } from '@playwright/test';
import {
  loginUserByUi,
  registerUserByUi,
  waitForAppPath,
} from '../support/auth';
import { createRegisterUser } from '../support/users';

async function openPath(page: Page, path: string): Promise<void> {
  await expect(async () => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
  }).toPass();
}

const protectedPaths = ['/profile', '/analytics', '/tasks/create'] as const;
const guestPaths = ['/login', '/register'] as const;

for (const path of protectedPaths) {
  test(`redirects a guest from ${path} to welcome`, async ({ page }) => {
    await openPath(page, path);
    await waitForAppPath(page, '/welcome');
    await expect(
      page.getByRole('heading', {
        name: 'Найдите идеального исполнителя для следующего проекта',
      }),
    ).toBeVisible();
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

    await openPath(page, path);
    await waitForAppPath(page, '/tasks');
    await expect(page.getByRole('heading', { name: 'Задачи' })).toBeVisible();
  });
}
