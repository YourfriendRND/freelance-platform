import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
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
    expect(selectCall[0]).toContain('ORDER BY created_at DESC, id DESC');
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
    expect(sql).toContain('ORDER BY budget_min ASC, created_at DESC, id DESC');
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
});
