import { expect, Request, test } from '@playwright/test';
import { TaskSort, TaskStatus } from '@freelance-platform/shared-types';
import { waitForAppPath } from '../support/auth';

type TaskCategoryItem = {
  id: string;
  title: string;
};

test('tasks query keeps the selected category from the address', async ({ page }) => {
  const categoriesResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/task-categories') &&
      !response.url().includes('/popular') &&
      response.request().method() === 'GET',
  );

  await page.goto('/tasks');
  await waitForAppPath(page, '/tasks');

  const categories = (await (await categoriesResponse).json()) as TaskCategoryItem[];
  const category = categories[0];

  if (!category) {
    throw new Error('Список категорий пуст');
  }

  await page.goto(`/tasks?categoryId=${category.id}`);
  await waitForAppPath(page, '/tasks');

  await expect(page.getByRole('heading', { level: 1, name: 'Задачи' })).toBeVisible();
  await expect(page.locator('#tasks-category')).toHaveValue(category.id);
  expect(new URL(page.url()).searchParams.get('categoryId')).toBe(category.id);
});

test('tasks query writes filters into the address and restores them after reload', async ({
  page,
}) => {
  await page.goto('/tasks');
  await waitForAppPath(page, '/tasks');

  await page.locator('#tasks-status').selectOption(TaskStatus.Open);
  await page.locator('#tasks-sort').selectOption(TaskSort.Oldest);
  await expect
    .poll(() => {
      const params = new URL(page.url()).searchParams;

      return `${params.get('status')}|${params.get('sort')}|${params.has('page')}`;
    })
    .toBe(`${TaskStatus.Open}|${TaskSort.Oldest}|false`);

  const listRequest = page.waitForRequest(isPublicTaskList);
  await page.reload();
  const request = await listRequest;
  const params = new URL(request.url()).searchParams;

  expect(params.get('status')).toBe(TaskStatus.Open);
  expect(params.get('sort')).toBe(TaskSort.Oldest);
  expect(params.has('search')).toBe(false);
  await expect(page.locator('#tasks-status')).toHaveValue(TaskStatus.Open);
  await expect(page.locator('#tasks-sort')).toHaveValue(TaskSort.Oldest);
  await expect(page.locator('.tasks-filters__panel')).toHaveClass(/tasks-filters__panel--open/);
});

test('tasks query keeps the page in the address', async ({ page }) => {
  const listRequest = page.waitForRequest(isPublicTaskList);

  await page.goto(`/tasks?sort=${TaskSort.Oldest}&page=2`);
  await waitForAppPath(page, '/tasks');

  const params = new URL((await listRequest).url()).searchParams;

  expect(params.get('sort')).toBe(TaskSort.Oldest);
  expect(params.get('page')).toBe('2');
  expect(new URL(page.url()).searchParams.get('page')).toBe('2');
  await expect(page.locator('#tasks-sort')).toHaveValue(TaskSort.Oldest);
});

test('tasks query drops invalid params and keeps search out of the api request', async ({
  page,
}) => {
  const listUrls: string[] = [];

  page.on('request', (request) => {
    if (isPublicTaskList(request)) {
      listUrls.push(request.url());
    }
  });

  await page.goto(
    `/tasks?status=${TaskStatus.Draft}&page=0&sort=popular&foo=1&search=${encodeURIComponent('логотип')}`,
  );
  await waitForAppPath(page, '/tasks');
  await expect.poll(() => {
    const params = new URL(page.url()).searchParams;

    return [
      params.get('search'),
      params.get('status'),
      params.get('page'),
      params.get('sort'),
      params.get('foo'),
    ]
      .map((value) => value ?? 'null')
      .join('|');
  }).toBe('логотип|null|null|null|null');
  await expect(page.locator('#tasks-search')).toHaveValue('логотип');
  await expect.poll(() => listUrls.length).toBeGreaterThan(0);
  expect(listUrls.some((url) => new URL(url).searchParams.has('search'))).toBe(false);
});

test('tasks query restores the list address after going back from a task', async ({ page }) => {
  await page.goto(`/tasks?sort=${TaskSort.Oldest}`);
  await waitForAppPath(page, '/tasks');
  await expect(page.locator('a.task-item').first()).toBeVisible();

  await page.locator('a.task-item').first().click();
  await expect(page).toHaveURL(/\/tasks\/[^/?]+$/);

  await page.goBack();
  await expect.poll(() => new URL(page.url()).searchParams.get('sort')).toBe(TaskSort.Oldest);
});

function isPublicTaskList(request: Request): boolean {
  return new URL(request.url()).pathname === '/api/tasks' && request.method() === 'GET';
}
