import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  TaskApplicationStatus,
  TaskExecutionType,
  TaskSort,
  TaskStatus,
} from '@freelance-platform/shared-types';
import { DatabaseClient } from '../../database/database.client';
import { TaskRepository } from './task.repository';

describe('TaskRepository findAll testing', () => {
  let database: { query: ReturnType<typeof vi.fn> };
  let repository: TaskRepository;

  const taskRow = {
    id: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01',
    title: 'Разработка адаптивного лендинга',
    description: 'Описание',
    status: TaskStatus.Open,
    budget_min: 25000,
    budget_max: 40000,
    execution_type: TaskExecutionType.Remote,
    deadline: new Date('2026-09-20'),
    customer_id: 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61',
    category_id: '7c2a8e14-5d93-4f1b-9b27-2e5d8c01f102',
    created_at: new Date('2026-09-10T09:00:00.000Z'), 
    updated_at: new Date('2026-09-10T09:05:00.000Z'),
  };

  beforeEach(() => {
    database = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [taskRow] })
        .mockResolvedValueOnce({ rows: [{ total: '12' }] }),
    };
    repository = new TaskRepository(database as unknown as DatabaseClient);
  });

  it('should apply public status filter and default pagination', async () => {
    const result = await repository.findAll({});

    expect(database.query).toHaveBeenCalledTimes(2);
    const [selectCall, countCall] = database.query.mock.calls;

    expect(selectCall[0]).toContain('status IN ($1, $2)');
    expect(selectCall[0]).toContain('ORDER BY tasks.created_at DESC, tasks.id DESC');
    expect(selectCall[0]).toContain('AS applications_count');
    expect(selectCall[0]).toContain('AS views_count');
    expect(selectCall[0]).toContain('FROM task_views');
    expect(selectCall[0]).toContain('INNER JOIN users AS u ON u.id = tasks.customer_id');
    expect(selectCall[0]).toContain('LIMIT $3');
    expect(selectCall[0]).toContain('OFFSET $4');
    expect(selectCall[1]).toEqual([
      TaskStatus.Open,
      TaskStatus.Closed,
      PAGINATION_DEFAULT_LIMIT,
      0,
    ]);
    expect(countCall[0]).toContain('SELECT COUNT(*) AS total');
    expect(countCall[1]).toEqual([TaskStatus.Open, TaskStatus.Closed]);
    expect(result).toMatchObject({
      total: 12,
      page: PAGINATION_DEFAULT_PAGE,
      limit: PAGINATION_DEFAULT_LIMIT,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(taskRow.id);
  });

  it('should apply category, status, budget and sort filters', async () => {
    database.query
      .mockReset()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: '0' }] });

    await repository.findAll({
      categoryId: taskRow.category_id,
      status: TaskStatus.Closed,
      budgetMin: 10000,
      budgetMax: 50000,
      sort: TaskSort.BudgetAsc,
      page: 2,
      limit: 5,
    });

    const [selectCall] = database.query.mock.calls;
    const [sql, params] = selectCall;

    expect(sql).toContain('category_id = $1');
    expect(sql).toContain('status = $2');
    expect(sql).toContain('budget_min >= $3');
    expect(sql).toContain('budget_max <= $4');
    expect(sql).toContain('ORDER BY tasks.budget_min ASC, tasks.created_at DESC, tasks.id DESC');
    expect(sql).toContain('LIMIT $5');
    expect(sql).toContain('OFFSET $6');
    expect(params).toEqual([
      taskRow.category_id,
      TaskStatus.Closed,
      10000,
      50000,
      5,
      5,
    ]);
  });

  it('should add hasApplied for a performer and keep it false', async () => {
    const performerId = '74412729-b4eb-4d88-b64b-a3b3446db2d5';
    database.query
      .mockReset()
      .mockResolvedValueOnce({
        rows: [{
          ...taskRow,
          has_applied: false,
          applications_count: '2',
          views_count: '5',
          author_id: taskRow.customer_id,
          author_email: 'client@example.com',
          author_first_name: 'Иван',
          author_last_name: null,
          author_role: 'client',
          author_created_at: new Date('2026-08-14T00:00:00.000Z'),
        }],
      })
      .mockResolvedValueOnce({ rows: [{ total: '1' }] });

    const result = await repository.findAll({}, performerId);
    const [sql, params] = database.query.mock.calls[0];
    const [task] = result.items;

    expect(sql).toContain('tasks.id IN (');
    expect(sql).toContain('WHERE performer_id = $3');
    expect(sql).toContain('AS has_applied');
    expect(sql).toContain('AS views_count');
    expect(sql).toContain('status IN ($1, $2)');
    expect(params[2]).toBe(performerId);
    expect(task.hasApplied).toBe(false);
    expect(task.applicationsCount).toBe(2);
    expect(task.viewsCount).toBe(5);
    expect(task.author).toMatchObject({
      id: taskRow.customer_id,
      email: 'client@example.com',
      firstName: 'Иван',
      role: 'client',
      rating: 0,
      reviewsCount: 0,
    });
    expect(task.author?.lastName).toBeUndefined();
  });

  it('should omit hasApplied when performer id is not passed', async () => {
    const result = await repository.findAll({});
    const [sql] = database.query.mock.calls[0];

    expect(sql).not.toContain('AS has_applied');
    expect(result.items[0].hasApplied).toBeUndefined();
    expect(result.items[0].viewsCount).toBe(0);
  });

  it('should list customer tasks including draft without hasApplied', async () => {
    database.query
      .mockReset()
      .mockResolvedValueOnce({
        rows: [{
          ...taskRow,
          status: TaskStatus.Draft,
          applications_count: '0',
          views_count: '1',
        }],
      })
      .mockResolvedValueOnce({ rows: [{ total: '1' }] });

    const result = await repository.findAllByCustomer(taskRow.customer_id, {
      status: TaskStatus.Draft,
    });
    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('customer_id = $1');
    expect(sql).toContain('AS views_count');
    expect(sql).toContain('status = $2');
    expect(sql).not.toContain('status IN ($1, $2)');
    expect(sql).not.toContain('AS has_applied');
    expect(params[0]).toBe(taskRow.customer_id);
    expect(params[1]).toBe(TaskStatus.Draft);
    expect(result.items[0].status).toBe(TaskStatus.Draft);
    expect(result.items[0].hasApplied).toBeUndefined();
    expect(result.items[0].applicationsCount).toBe(0);
    expect(result.items[0].viewsCount).toBe(1);
  });

  it('should add hasApplied when loading one task for a performer', async () => {
    const performerId = '74412729-b4eb-4d88-b64b-a3b3446db2d5';
    database.query.mockReset().mockResolvedValue({
      rows: [{ ...taskRow, has_applied: true, applications_count: '1' }],
    });

    const result = await repository.findById(taskRow.id, performerId);
    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('AS has_applied');
    expect(sql).toContain('WHERE tasks.id = $1');
    expect(params).toEqual([taskRow.id, performerId]);
    expect(sql).toContain('AS views_count');
    expect(sql).toContain('FROM task_views');
    expect(result?.hasApplied).toBe(true);
    expect(result?.applicationsCount).toBe(1);
    expect(result?.viewsCount).toBe(0);
  });

  it('should omit hasApplied when loading one task without a performer', async () => {
    database.query.mockReset().mockResolvedValue({ rows: [taskRow] });

    const result = await repository.findById(taskRow.id);
    const [sql, params] = database.query.mock.calls[0];

    expect(sql).not.toContain('AS has_applied');
    expect(params).toEqual([taskRow.id]);
    expect(sql).toContain('AS views_count');
    expect(result?.hasApplied).toBeUndefined();
    expect(result?.viewsCount).toBe(0);
  });

  it('should map views_count from the task row', async () => {
    database.query.mockReset().mockResolvedValue({
      rows: [{ ...taskRow, applications_count: '1', views_count: '4' }],
    });

    const result = await repository.findById(taskRow.id);

    expect(result?.viewsCount).toBe(4);
  });
});

describe('TaskRepository recordView testing', () => {
  let database: { query: ReturnType<typeof vi.fn> };
  let repository: TaskRepository;

  const userId = 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61';
  const taskId = '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01';

  beforeEach(() => {
    database = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    repository = new TaskRepository(database as unknown as DatabaseClient);
  });

  it('should insert a view and refresh updated_at on conflict', async () => {
    await repository.recordView(userId, taskId);

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('INSERT INTO task_views (user_id, task_id)');
    expect(sql).toContain('ON CONFLICT (user_id, task_id)');
    expect(sql).toContain('DO UPDATE SET updated_at = now()');
    expect(params).toEqual([userId, taskId]);
  });
});

describe('TaskRepository countCustomerStats testing', () => {
  let database: { query: ReturnType<typeof vi.fn> };
  let repository: TaskRepository;

  const customerId = 'b7e14a02-91c3-4d58-8a6f-1c2d3e4f5a61';

  beforeEach(() => {
    database = { query: vi.fn() };
    repository = new TaskRepository(database as unknown as DatabaseClient);
  });

  it('should count tasks by status and pending applications on open tasks', async () => {
    database.query.mockResolvedValue({
      rows: [{
        open_count: '2',
        closed_count: '1',
        draft_count: '0',
        pending_applications: '3',
      }],
    });

    const result = await repository.countCustomerStats(customerId);
    const [sql, values] = database.query.mock.calls[0];

    expect(database.query).toHaveBeenCalledTimes(1);
    expect(sql).toContain('FILTER (WHERE tasks.status = $2)');
    expect(sql).toContain('FILTER (WHERE tasks.status = $3)');
    expect(sql).toContain('FILTER (WHERE tasks.status = $4)');
    expect(sql).toContain('open_tasks.status = $2');
    expect(sql).toContain('ta.status = $5');
    expect(sql).toContain('WHERE tasks.customer_id = $1');
    expect(values).toEqual([
      customerId,
      TaskStatus.Open,
      TaskStatus.Closed,
      TaskStatus.Draft,
      TaskApplicationStatus.Pending,
    ]);
    expect(result).toEqual({
      open: 2,
      closed: 1,
      draft: 0,
      pendingApplications: 3,
    });
  });

  it('should return zeros when the query has no row', async () => {
    database.query.mockResolvedValue({ rows: [] });

    const result = await repository.countCustomerStats(customerId);

    expect(result).toEqual({
      open: 0,
      closed: 0,
      draft: 0,
      pendingApplications: 0,
    });
  });
});
