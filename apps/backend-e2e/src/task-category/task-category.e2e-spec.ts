import axios from 'axios';
import { TaskExecutionType, TaskStatus, UserRole } from '@freelance-platform/shared-types';
import { joinAndLogin } from '../support/users';

type PopularCategoryResponse = {
  id: string;
  title: string;
  description: string;
  taskCount: number;
};

function createTaskBody(categoryId: string, status?: TaskStatus) {
  return {
    title: `E2E категория ${Date.now()}`,
    description: 'Описание e2e задачи для популярной категории',
    ...(status !== undefined && { status }),
    budgetMin: 10000,
    budgetMax: 25000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-12-01',
    categoryId,
  };
}

function isSortedByTaskCount(categories: PopularCategoryResponse[]): boolean {
  return categories.every((category, index) => {
    if (index === 0) {
      return true;
    }

    return categories[index - 1].taskCount >= category.taskCount;
  });
}

describe('Task category popular e2e testing', () => {
  it('should return up to 8 categories with open tasks only', async () => {
    const { sessionCookie } = await joinAndLogin(UserRole.Client);
    const categoriesRes = await axios.get('/api/task-categories');

    expect(categoriesRes.status).toBe(200);

    const beforeRes = await axios.get('/api/task-categories/popular');

    expect(beforeRes.status).toBe(200);
    const before = beforeRes.data as PopularCategoryResponse[];

    expect(before.length).toBeLessThanOrEqual(8);
    expect(before.every((category) => category.taskCount > 0)).toBe(true);
    expect(isSortedByTaskCount(before)).toBe(true);
    expect(before.every((category) => (
      typeof category.id === 'string'
      && typeof category.title === 'string'
      && typeof category.description === 'string'
    ))).toBe(true);

    const popularIds = new Set(before.map((category) => category.id));
    const quiet = (categoriesRes.data as { id: string }[]).find(
      (category) => !popularIds.has(category.id),
    );

    expect(quiet).toBeDefined();

    if (!quiet) {
      return;
    }

    const draftRes = await axios.post(
      '/api/tasks',
      createTaskBody(quiet.id),
      { headers: { Cookie: sessionCookie } },
    );
    const closedCreateRes = await axios.post(
      '/api/tasks',
      createTaskBody(quiet.id, TaskStatus.Open),
      { headers: { Cookie: sessionCookie } },
    );
    const closedRes = await axios.patch(
      `/api/tasks/${closedCreateRes.data.id}`,
      { status: TaskStatus.Closed },
      { headers: { Cookie: sessionCookie } },
    );

    expect(draftRes.status).toBe(201);
    expect(draftRes.data.status).toBe(TaskStatus.Draft);
    expect(closedCreateRes.status).toBe(201);
    expect(closedRes.status).toBe(200);

    const unchangedRes = await axios.get('/api/task-categories/popular');
    const unchanged = unchangedRes.data as PopularCategoryResponse[];

    expect(unchangedRes.status).toBe(200);
    expect(unchanged.find((category) => category.id === quiet.id)).toBeUndefined();
    expect(unchanged).toEqual(before);

    const topCount = before[0]?.taskCount ?? 0;
    const openTasksToCreate = topCount + 1;

    for (let index = 0; index < openTasksToCreate; index += 1) {
      const openRes = await axios.post(
        '/api/tasks',
        createTaskBody(quiet.id, TaskStatus.Open),
        { headers: { Cookie: sessionCookie } },
      );

      expect(openRes.status).toBe(201);
    }

    const afterRes = await axios.get('/api/task-categories/popular');
    const after = afterRes.data as PopularCategoryResponse[];
    const [leader] = after;

    expect(afterRes.status).toBe(200);
    expect(after.length).toBeLessThanOrEqual(8);
    expect(after.length).toBe(Math.min(8, before.length + 1));
    expect(after.every((category) => category.taskCount > 0)).toBe(true);
    expect(isSortedByTaskCount(after)).toBe(true);
    expect(leader).toMatchObject({
      id: quiet.id,
      taskCount: openTasksToCreate,
    });

    if (before.length === 8) {
      const previousLast = before[before.length - 1];

      expect(after.find((category) => category.id === previousLast.id)).toBeUndefined();
    }
  });
});
