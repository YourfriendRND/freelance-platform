import axios from 'axios';
import { CreateUserDto } from '@freelance-platform/shared-dto';
import { TaskExecutionType, TaskStatus, UserRole } from '@freelance-platform/shared-types';

import { hasSessionCookie, toCookieHeader } from '../support/cookies';

function createJoinPayload(email: string, role: UserRole = UserRole.Client): CreateUserDto {
  return {
    email,
    firstName: 'E2E',
    password: 'securePassword123',
    role,
  };
}

function uniqueEmail(label: string): string {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function joinAndLogin(role: UserRole = UserRole.Client) {
  const email = uniqueEmail(role);
  const payload = createJoinPayload(email, role);
  const joinRes = await axios.post('/api/auth/join', payload);

  expect(joinRes.status).toBe(201);

  const loginRes = await axios.post('/api/auth/login', {
    email,
    password: payload.password,
  });

  expect(loginRes.status).toBe(200);
  expect(hasSessionCookie(loginRes.headers['set-cookie'])).toBe(true);

  return {
    userId: joinRes.data.id as string,
    sessionCookie: toCookieHeader(loginRes.headers['set-cookie']),
  };
}

function createTaskBody(categoryId: string) {
  return {
    title: 'E2E задача',
    description: 'Описание e2e задачи',
    budgetMin: 10000,
    budgetMax: 25000,
    executionType: TaskExecutionType.Remote,
    deadline: '2026-12-01',
    categoryId,
  };
}

describe('Task module e2e testing', () => {
  describe('positive: create - list - get - patch - delete', () => {
    const email = uniqueEmail('task-crud');
    const payload = createJoinPayload(email);

    let userId: string;
    let sessionCookie: string;
    let categoryId: string;
    let taskId: string;

    it('join and login: should authorize client', async () => {
      const joinRes = await axios.post('/api/auth/join', payload);
      expect(joinRes.status).toBe(201);
      userId = joinRes.data.id;

      const loginRes = await axios.post('/api/auth/login', {
        email,
        password: payload.password,
      });

      expect(loginRes.status).toBe(200);
      expect(hasSessionCookie(loginRes.headers['set-cookie'])).toBe(true);

      sessionCookie = toCookieHeader(loginRes.headers['set-cookie']);
    });

    it('categories: should return seeded list', async () => {
      const categoriesRes = await axios.get('/api/task-categories');

      expect(categoriesRes.status).toBe(200);
      expect(categoriesRes.data.length).toBeGreaterThan(0);

      const [category] = categoriesRes.data;
      categoryId = category.id;
    });

    it('create: should create a task for the current client', async () => {
      const title = `E2E задача ${Date.now()}`;
      const createRes = await axios.post(
        '/api/tasks',
        {
          title,
          description: 'Описание e2e задачи',
          budgetMin: 10000,
          budgetMax: 25000,
          executionType: TaskExecutionType.Remote,
          deadline: '2026-12-01',
          categoryId,
        },
        { headers: { Cookie: sessionCookie } },
      );

      expect(createRes.status).toBe(201);
      expect(createRes.data).toMatchObject({
        title,
        description: 'Описание e2e задачи',
        status: TaskStatus.Draft,
        budgetMin: 10000,
        budgetMax: 25000,
        executionType: TaskExecutionType.Remote,
        customerId: userId,
        categoryId,
      });
      expect(createRes.data).toHaveProperty('id');

      taskId = createRes.data.id;
    });

    it('list: should contain the created task', async () => {
      const listRes = await axios.get('/api/tasks');

      expect(listRes.status).toBe(200);
      expect(listRes.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: taskId })]),
      );
    });

    it('get: should return the created task by id', async () => {
      const getRes = await axios.get(`/api/tasks/${taskId}`);

      expect(getRes.status).toBe(200);
      expect(getRes.data).toMatchObject({
        id: taskId,
        customerId: userId,
      });
    });

    it('patch: should update the task', async () => {
      const title = `E2E задача ${Date.now()} обновлена`;
      const patchRes = await axios.patch(
        `/api/tasks/${taskId}`,
        { title },
        { headers: { Cookie: sessionCookie } },
      );

      expect(patchRes.status).toBe(200);
      expect(patchRes.data).toMatchObject({
        id: taskId,
        title,
      });
    });

    it('delete: should remove the task', async () => {
      const deleteRes = await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Cookie: sessionCookie },
      });

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.data).toEqual({ message: 'Задача удалена' });
    });

    it('get after delete: should return 404', async () => {
      const getRes = await axios.get(`/api/tasks/${taskId}`);

      expect(getRes.status).toBe(404);
      expect(getRes.data.message).toBe(`Задача с "${taskId}" не найдена`);
    });
  });

  describe('negative', () => {
    it('create: should reject request without cookie', async () => {
      const createRes = await axios.post('/api/tasks', {
        title: 'Без сессии',
        description: 'Описание',
        budgetMin: 10000,
        budgetMax: 25000,
        executionType: TaskExecutionType.Remote,
        deadline: '2026-12-01',
        categoryId: 'b4252672-a116-41ee-b78c-d694b236db32',
      });

      expect(createRes.status).toBe(401);
    });

    it('get: should return 404 for unknown id', async () => {
      const unknownId = 'b4252672-a116-41ee-b78c-d694b236db32';
      const getRes = await axios.get(`/api/tasks/${unknownId}`);

      expect(getRes.status).toBe(404);
      expect(getRes.data.message).toBe(`Задача с "${unknownId}" не найдена`);
    });
  });

  describe('business rules testing', () => {
    let categoryId: string;

    it('categories: should load a category for rule checks', async () => {
      const categoriesRes = await axios.get('/api/task-categories');

      expect(categoriesRes.status).toBe(200);
      expect(categoriesRes.data.length).toBeGreaterThan(0);

      const [category] = categoriesRes.data;
      categoryId = category.id;
    });

    it('create: freelancer should get 403', async () => {
      const { sessionCookie } = await joinAndLogin(UserRole.Freelancer);

      const createRes = await axios.post(
        '/api/tasks',
        createTaskBody(categoryId),
        { headers: { Cookie: sessionCookie } },
      );

      expect(createRes.status).toBe(403);
      expect(createRes.data.message).toBe('Создавать задачу может только заказчик');
    });

    it('patch and delete: other client should get 403', async () => {
      const owner = await joinAndLogin(UserRole.Client);
      const other = await joinAndLogin(UserRole.Client);

      const createRes = await axios.post(
        '/api/tasks',
        createTaskBody(categoryId),
        { headers: { Cookie: owner.sessionCookie } },
      );

      expect(createRes.status).toBe(201);
      const { id: taskId } = createRes.data;

      const patchRes = await axios.patch(
        `/api/tasks/${taskId}`,
        { title: 'Чужая правка' },
        { headers: { Cookie: other.sessionCookie } },
      );

      expect(patchRes.status).toBe(403);
      expect(patchRes.data.message).toBe('Изменять задачу может только владелец');

      const deleteRes = await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Cookie: other.sessionCookie },
      });

      expect(deleteRes.status).toBe(403);
      expect(deleteRes.data.message).toBe('Удалять задачу может только владелец');
    });

    it('closed task: patch should get 403 and owner can delete', async () => {
      const { sessionCookie } = await joinAndLogin(UserRole.Client);

      const createRes = await axios.post(
        '/api/tasks',
        createTaskBody(categoryId),
        { headers: { Cookie: sessionCookie } },
      );

      expect(createRes.status).toBe(201);
      const { id: taskId } = createRes.data;

      const closeRes = await axios.patch(
        `/api/tasks/${taskId}`,
        { status: TaskStatus.Closed },
        { headers: { Cookie: sessionCookie } },
      );

      expect(closeRes.status).toBe(200);
      expect(closeRes.data.status).toBe(TaskStatus.Closed);

      const patchRes = await axios.patch(
        `/api/tasks/${taskId}`,
        { title: 'После закрытия' },
        { headers: { Cookie: sessionCookie } },
      );

      expect(patchRes.status).toBe(403);
      expect(patchRes.data.message).toBe('Закрытую задачу нельзя изменить');

      const deleteRes = await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Cookie: sessionCookie },
      });

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.data).toEqual({ message: 'Задача удалена' });
    });
  });
});
