import { expect, Page, Request, test } from '@playwright/test';
import { TaskSort, TaskStatus, UserRole } from '@freelance-platform/shared-types';
import { loginUserByUi, registerUserByUi, waitForAppPath } from '../support/auth';
import { createRegisterUser, type RegisterUserData } from '../support/users';

async function openMyTasks(page: Page, user: RegisterUserData): Promise<void> {
  await registerUserByUi(page, user);
  await loginUserByUi(page, {
    email: user.email,
    password: user.password,
  });
  await page.goto('/my-tasks');
  await waitForAppPath(page, '/my-tasks');
  await expect(page.getByRole('heading', { level: 1, name: 'Мои задачи' })).toBeVisible();
}

test('my tasks query keeps draft in the address and in the request', async ({ page }) => {
  const user = createRegisterUser('my-tasks-draft', UserRole.Client);

  await openMyTasks(page, user);
  await page.locator('#tasks-status').selectOption(TaskStatus.Draft);
  await page.locator('#tasks-sort').selectOption(TaskSort.Oldest);
  await expect.poll(() => readParams(page)).toBe(`${TaskStatus.Draft}|${TaskSort.Oldest}|null`);

  const listRequest = page.waitForRequest(isMyTaskList);
  await page.reload();
  const params = new URL((await listRequest).url()).searchParams;

  expect(params.get('status')).toBe(TaskStatus.Draft);
  expect(params.get('sort')).toBe(TaskSort.Oldest);
  expect(params.has('search')).toBe(false);
  await expect(page.locator('#tasks-status')).toHaveValue(TaskStatus.Draft);
  await expect(page.locator('#tasks-sort')).toHaveValue(TaskSort.Oldest);
  await expect(page.locator('.tasks-filters__panel')).toHaveClass(/tasks-filters__panel--open/);
});

test('my tasks query keeps the page in the address', async ({ page }) => {
  const user = createRegisterUser('my-tasks-page', UserRole.Client);

  await openMyTasks(page, user);

  const listRequest = page.waitForRequest(isMyTaskList);
  await page.goto(`/my-tasks?status=${TaskStatus.Draft}&page=2`);
  await waitForAppPath(page, '/my-tasks');

  const params = new URL((await listRequest).url()).searchParams;

  expect(params.get('status')).toBe(TaskStatus.Draft);
  expect(params.get('page')).toBe('2');
  expect(readParams(page)).toBe(`${TaskStatus.Draft}|null|2`);
});

test('my tasks query drops an invalid status and keeps search out of the api request', async ({
  page,
}) => {
  const user = createRegisterUser('my-tasks-search', UserRole.Client);
  const listUrls: string[] = [];

  await openMyTasks(page, user);
  page.on('request', (request) => {
    if (isMyTaskList(request)) {
      listUrls.push(request.url());
    }
  });

  await page.goto(
    `/my-tasks?status=archived&foo=1&search=${encodeURIComponent('логотип')}`,
  );
  await waitForAppPath(page, '/my-tasks');
  await expect.poll(() => {
    const params = new URL(page.url()).searchParams;

    return [params.get('search'), params.get('status'), params.get('foo')]
      .map((value) => value ?? 'null')
      .join('|');
  }).toBe('логотип|null|null');
  await expect(page.locator('#tasks-search')).toHaveValue('логотип');
  await expect.poll(() => listUrls.length).toBeGreaterThan(0);
  expect(listUrls.some((url) => new URL(url).searchParams.has('search'))).toBe(false);
});

function readParams(page: Page): string {
  const params = new URL(page.url()).searchParams;

  return [params.get('status'), params.get('sort'), params.get('page')]
    .map((value) => value ?? 'null')
    .join('|');
}

function isMyTaskList(request: Request): boolean {
  return new URL(request.url()).pathname === '/api/tasks/my' && request.method() === 'GET';
}
