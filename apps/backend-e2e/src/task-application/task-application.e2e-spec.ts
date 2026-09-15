import axios from 'axios';
import {
  TaskApplicationStatus,
  TaskExecutionType,
  TaskStatus,
  UserRole,
} from '@freelance-platform/shared-types';
import { joinAndLogin } from '../support/users';

async function loadCategoryId(): Promise<string> {
  const categoriesRes = await axios.get('/api/task-categories');

  expect(categoriesRes.status).toBe(200);
  expect(categoriesRes.data.length).toBeGreaterThan(0);

  const [category] = categoriesRes.data;

  return category.id as string;
}

async function createOpenTask(sessionCookie: string, categoryId: string): Promise<string> {
  const createRes = await axios.post(
    '/api/tasks',
    {
      title: `E2E отклик ${Date.now()}`,
      description: 'Описание e2e задачи для отклика',
      status: TaskStatus.Open,
      budgetMin: 10000,
      budgetMax: 25000,
      executionType: TaskExecutionType.Remote,
      deadline: '2026-12-01',
      categoryId,
    },
    { headers: { Cookie: sessionCookie } },
  );

  expect(createRes.status).toBe(201);
  expect(createRes.data.status).toBe(TaskStatus.Open);

  return createRes.data.id as string;
}

describe('Task application module e2e testing', () => {
  describe('positive: create - list - get - update', () => {
    let client: { userId: string; sessionCookie: string };
    let freelancer: { userId: string; sessionCookie: string };
    let categoryId: string;
    let taskId: string;
    let applicationId: string;

    it('join and login: should authorize client and freelancer', async () => {
      client = await joinAndLogin(UserRole.Client);
      freelancer = await joinAndLogin(UserRole.Freelancer);
    });

    it('categories: should return seeded list', async () => {
      categoryId = await loadCategoryId();
    });

    it('create task: should create an open task for the client', async () => {
      taskId = await createOpenTask(client.sessionCookie, categoryId);
    });

    it('create: freelancer should apply to the open task', async () => {
      const createRes = await axios.post(
        '/api/task-applications',
        {
          taskId,
          message: 'Готов выполнить задачу',
          proposedPrice: 15000,
        },
        { headers: { Cookie: freelancer.sessionCookie } },
      );

      expect(createRes.status).toBe(201);
      expect(createRes.data).toMatchObject({
        taskId,
        performerId: freelancer.userId,
        message: 'Готов выполнить задачу',
        proposedPrice: 15000,
        status: TaskApplicationStatus.Pending,
      });
      expect(createRes.data).toHaveProperty('id');

      applicationId = createRes.data.id;
    });

    it('list: freelancer should see own applications', async () => {
      const listRes = await axios.get('/api/task-applications', {
        headers: { Cookie: freelancer.sessionCookie },
      });

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.data.items)).toBe(true);
      expect(
        listRes.data.items.find((item: { id: string }) => item.id === applicationId),
      ).toMatchObject({
        id: applicationId,
        performerId: freelancer.userId,
      });
    });

    it('get: freelancer should see own application details', async () => {
      const getRes = await axios.get(`/api/task-applications/${applicationId}`, {
        headers: { Cookie: freelancer.sessionCookie },
      });

      expect(getRes.status).toBe(200);
      expect(getRes.data).toMatchObject({
        id: applicationId,
        taskId,
        performerId: freelancer.userId,
      });
    });

    it('list: client should see applications on own tasks', async () => {
      const listRes = await axios.get('/api/task-applications', {
        headers: { Cookie: client.sessionCookie },
      });

      expect(listRes.status).toBe(200);
      expect(
        listRes.data.items.find((item: { id: string }) => item.id === applicationId),
      ).toBeDefined();
    });

    it('list: client should filter applications by own taskId', async () => {
      const listRes = await axios.get(`/api/task-applications?taskId=${taskId}`, {
        headers: { Cookie: client.sessionCookie },
      });

      expect(listRes.status).toBe(200);
      expect(
        listRes.data.items.every((item: { taskId: string }) => item.taskId === taskId),
      ).toBe(true);
      expect(
        listRes.data.items.find((item: { id: string }) => item.id === applicationId),
      ).toBeDefined();
    });

    it('get: client should see application details on own task', async () => {
      const getRes = await axios.get(`/api/task-applications/${applicationId}`, {
        headers: { Cookie: client.sessionCookie },
      });

      expect(getRes.status).toBe(200);
      expect(getRes.data.id).toBe(applicationId);
    });

    it('update: freelancer should change message while pending', async () => {
      const updateRes = await axios.patch(
        `/api/task-applications/${applicationId}`,
        { message: 'Обновлённое сообщение' },
        { headers: { Cookie: freelancer.sessionCookie } },
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data).toMatchObject({
        id: applicationId,
        message: 'Обновлённое сообщение',
        status: TaskApplicationStatus.Pending,
      });
    });

    it('update: client should accept the application', async () => {
      const updateRes = await axios.patch(
        `/api/task-applications/${applicationId}`,
        { status: TaskApplicationStatus.Accept },
        { headers: { Cookie: client.sessionCookie } },
      );

      expect(updateRes.status).toBe(200);
      expect(updateRes.data.status).toBe(TaskApplicationStatus.Accept);
    });
  });

  describe('negative', () => {
    it('create: should reject request without cookie', async () => {
      const createRes = await axios.post('/api/task-applications', {
        taskId: 'b4252672-a116-41ee-b78c-d694b236db32',
        message: 'Без сессии',
      });

      expect(createRes.status).toBe(401);
    });

    it('get: should return 404 for unknown id', async () => {
      const { sessionCookie } = await joinAndLogin(UserRole.Freelancer);
      const unknownId = 'b4252672-a116-41ee-b78c-d694b236db32';
      const getRes = await axios.get(`/api/task-applications/${unknownId}`, {
        headers: { Cookie: sessionCookie },
      });

      expect(getRes.status).toBe(404);
      expect(getRes.data.message).toBe(`Отклик с "${unknownId}" не найден`);
    });
  });

  describe('business rules testing', () => {
    let categoryId: string;

    it('categories: should load a category for rule checks', async () => {
      categoryId = await loadCategoryId();
    });

    it('create: client should get 403', async () => {
      const client = await joinAndLogin(UserRole.Client);
      const taskId = await createOpenTask(client.sessionCookie, categoryId);

      const createRes = await axios.post(
        '/api/task-applications',
        { taskId, message: 'Отклик заказчика' },
        { headers: { Cookie: client.sessionCookie } },
      );

      expect(createRes.status).toBe(403);
      expect(createRes.data.message).toBe('Откликаться на задачу может только исполнитель');
    });

    it('create: freelancer should get 409 on duplicate', async () => {
      const client = await joinAndLogin(UserRole.Client);
      const freelancer = await joinAndLogin(UserRole.Freelancer);
      const taskId = await createOpenTask(client.sessionCookie, categoryId);

      const firstRes = await axios.post(
        '/api/task-applications',
        { taskId, message: 'Первый отклик' },
        { headers: { Cookie: freelancer.sessionCookie } },
      );
      const secondRes = await axios.post(
        '/api/task-applications',
        { taskId, message: 'Повторный отклик' },
        { headers: { Cookie: freelancer.sessionCookie } },
      );

      expect(firstRes.status).toBe(201);
      expect(secondRes.status).toBe(409);
      expect(secondRes.data.message).toBe('Вы уже откликались на эту задачу');
    });

    it('list: freelancer should get 400 when taskId is passed', async () => {
      const freelancer = await joinAndLogin(UserRole.Freelancer);
      const listRes = await axios.get(
        '/api/task-applications?taskId=b4252672-a116-41ee-b78c-d694b236db32',
        { headers: { Cookie: freelancer.sessionCookie } },
      );

      expect(listRes.status).toBe(400);
      expect(listRes.data.message).toBe('Параметр taskId доступен только заказчику');
    });

    it('list: client should get 404 for foreign taskId', async () => {
      const owner = await joinAndLogin(UserRole.Client);
      const other = await joinAndLogin(UserRole.Client);
      const taskId = await createOpenTask(owner.sessionCookie, categoryId);

      const listRes = await axios.get(`/api/task-applications?taskId=${taskId}`, {
        headers: { Cookie: other.sessionCookie },
      });

      expect(listRes.status).toBe(404);
      expect(listRes.data.message).toBe(`Задача с "${taskId}" не найдена`);
    });

    it('get: other freelancer should get 403', async () => {
      const client = await joinAndLogin(UserRole.Client);
      const freelancer = await joinAndLogin(UserRole.Freelancer);
      const otherFreelancer = await joinAndLogin(UserRole.Freelancer);
      const taskId = await createOpenTask(client.sessionCookie, categoryId);

      const createRes = await axios.post(
        '/api/task-applications',
        { taskId, message: 'Мой отклик' },
        { headers: { Cookie: freelancer.sessionCookie } },
      );

      expect(createRes.status).toBe(201);

      const getRes = await axios.get(`/api/task-applications/${createRes.data.id}`, {
        headers: { Cookie: otherFreelancer.sessionCookie },
      });

      expect(getRes.status).toBe(403);
      expect(getRes.data.message).toBe('Нет доступа к этому отклику');
    });

    it('update: freelancer should get 403 after accept', async () => {
      const client = await joinAndLogin(UserRole.Client);
      const freelancer = await joinAndLogin(UserRole.Freelancer);
      const taskId = await createOpenTask(client.sessionCookie, categoryId);

      const createRes = await axios.post(
        '/api/task-applications',
        { taskId, message: 'Отклик' },
        { headers: { Cookie: freelancer.sessionCookie } },
      );

      expect(createRes.status).toBe(201);
      const { id: applicationId } = createRes.data;

      const acceptRes = await axios.patch(
        `/api/task-applications/${applicationId}`,
        { status: TaskApplicationStatus.Accept },
        { headers: { Cookie: client.sessionCookie } },
      );

      expect(acceptRes.status).toBe(200);

      const updateRes = await axios.patch(
        `/api/task-applications/${applicationId}`,
        { message: 'После принятия' },
        { headers: { Cookie: freelancer.sessionCookie } },
      );

      expect(updateRes.status).toBe(403);
      expect(updateRes.data.message).toBe('Изменить можно только отклик на рассмотрении');
    });

    it('update: other client should get 403', async () => {
      const owner = await joinAndLogin(UserRole.Client);
      const other = await joinAndLogin(UserRole.Client);
      const freelancer = await joinAndLogin(UserRole.Freelancer);
      const taskId = await createOpenTask(owner.sessionCookie, categoryId);

      const createRes = await axios.post(
        '/api/task-applications',
        { taskId, message: 'Отклик' },
        { headers: { Cookie: freelancer.sessionCookie } },
      );

      expect(createRes.status).toBe(201);

      const updateRes = await axios.patch(
        `/api/task-applications/${createRes.data.id}`,
        { status: TaskApplicationStatus.Decline },
        { headers: { Cookie: other.sessionCookie } },
      );

      expect(updateRes.status).toBe(403);
      expect(updateRes.data.message).toBe('Изменять отклик может только владелец задачи');
    });
  });
});
