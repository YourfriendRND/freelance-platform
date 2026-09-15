import { TaskApplicationStatus } from '@freelance-platform/shared-types';
import { DatabaseClient } from '../../database/database.client';
import { DuplicateTaskApplicationError } from './errors';
import { TaskApplicationRepository } from './task-application.repository';

describe('TaskApplicationRepository testing', () => {
  let database: { query: ReturnType<typeof vi.fn> };
  let repository: TaskApplicationRepository;

  const applicationRow = {
    id: '5c8e1a97-0a01-4b62-8d11-7e9f0a1b2c01',
    task_id: 'ae1c453f-b666-443f-af9d-26ce1be4a268',
    performer_id: '74412729-b4eb-4d88-b64b-a3b3446db2d5',
    proposed_price: 15000,
    message: 'Готов выполнить задачу',
    status: TaskApplicationStatus.Pending,
    created_at: new Date('2026-09-15T11:00:00.000Z'),
    updated_at: new Date('2026-09-15T12:15:00.000Z'),
  };

  beforeEach(() => {
    database = {
      query: vi.fn(),
    };
    repository = new TaskApplicationRepository(database as unknown as DatabaseClient);
  });

  it('should insert an application and map the returned row', async () => {
    database.query.mockResolvedValue({ rows: [applicationRow] });

    const result = await repository.create({
      taskId: applicationRow.task_id,
      performerId: applicationRow.performer_id,
      message: applicationRow.message,
      proposedPrice: applicationRow.proposed_price,
    });

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('INSERT INTO task_applications');
    expect(sql).toContain('RETURNING');
    expect(params).toEqual([
      applicationRow.task_id,
      applicationRow.performer_id,
      applicationRow.message,
      applicationRow.proposed_price,
      TaskApplicationStatus.Pending,
    ]);
    expect(result.id).toBe(applicationRow.id);
    expect(result.taskId).toBe(applicationRow.task_id);
    expect(result.performerId).toBe(applicationRow.performer_id);
    expect(result.proposedPrice).toBe(applicationRow.proposed_price);
    expect(result.status).toBe(TaskApplicationStatus.Pending);
  });

  it('should throw DuplicateTaskApplicationError on unique violation', async () => {
    const uniqueError = Object.assign(new Error('duplicate key'), { code: '23505' });
    database.query.mockRejectedValue(uniqueError);

    await expect(
      repository.create({
        taskId: applicationRow.task_id,
        performerId: applicationRow.performer_id,
        message: applicationRow.message,
      }),
    ).rejects.toBeInstanceOf(DuplicateTaskApplicationError);
  });

  it('should rethrow unexpected database errors on create', async () => {
    const unexpected = new Error('connection lost');
    database.query.mockRejectedValue(unexpected);

    await expect(
      repository.create({
        taskId: applicationRow.task_id,
        performerId: applicationRow.performer_id,
        message: applicationRow.message,
      }),
    ).rejects.toBe(unexpected);
  });

  it('should return an application by id', async () => {
    database.query.mockResolvedValue({ rows: [applicationRow] });

    const result = await repository.findById(applicationRow.id);

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('FROM task_applications');
    expect(sql).toContain('WHERE id = $1');
    expect(params).toEqual([applicationRow.id]);
    expect(result?.id).toBe(applicationRow.id);
  });

  it('should return null when application by id is missing', async () => {
    database.query.mockResolvedValue({ rows: [] });

    const result = await repository.findById(applicationRow.id);

    expect(result).toBeNull();
  });

  it('should return application with task customer id', async () => {
    database.query.mockResolvedValue({
      rows: [{ ...applicationRow, task_customer_id: 'c8ae551b-9c3f-4781-a99d-4c81de40ab91' }],
    });

    const result = await repository.findByIdWithTaskCustomer(applicationRow.id);

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('INNER JOIN tasks');
    expect(sql).toContain('tasks.customer_id AS task_customer_id');
    expect(params).toEqual([applicationRow.id]);
    expect(result?.application.id).toBe(applicationRow.id);
    expect(result?.taskCustomerId).toBe('c8ae551b-9c3f-4781-a99d-4c81de40ab91');
  });

  it('should return performer applications ordered by created_at', async () => {
    database.query.mockResolvedValue({ rows: [applicationRow] });

    const result = await repository.findAllByPerformerId(applicationRow.performer_id);

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('WHERE performer_id = $1');
    expect(sql).toContain('ORDER BY created_at DESC, id DESC');
    expect(params).toEqual([applicationRow.performer_id]);
    expect(result).toHaveLength(1);
    expect(result[0].performerId).toBe(applicationRow.performer_id);
  });

  it('should join tasks when listing by customer', async () => {
    database.query.mockResolvedValue({ rows: [applicationRow] });
    const customerId = 'c8ae551b-9c3f-4781-a99d-4c81de40ab91';

    await repository.findAllByCustomerId(customerId);

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('INNER JOIN tasks ON task_applications.task_id = tasks.id');
    expect(sql).toContain('WHERE tasks.customer_id = $1');
    expect(params).toEqual([customerId]);
  });

  it('should filter customer applications by task id', async () => {
    database.query.mockResolvedValue({ rows: [applicationRow] });
    const customerId = 'c8ae551b-9c3f-4781-a99d-4c81de40ab91';

    await repository.findAllByCustomerIdAndTaskId(customerId, applicationRow.task_id);

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('WHERE tasks.customer_id = $1 AND task_applications.task_id = $2');
    expect(params).toEqual([customerId, applicationRow.task_id]);
  });

  it('should return true when customer owns the task', async () => {
    database.query.mockResolvedValue({ rows: [{ id: applicationRow.task_id }] });
    const customerId = 'c8ae551b-9c3f-4781-a99d-4c81de40ab91';

    const result = await repository.customerOwnsTask(customerId, applicationRow.task_id);

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('FROM tasks');
    expect(sql).toContain('WHERE id = $1 AND customer_id = $2');
    expect(params).toEqual([applicationRow.task_id, customerId]);
    expect(result).toBe(true);
  });

  it('should return false when customer does not own the task', async () => {
    database.query.mockResolvedValue({ rows: [] });

    const result = await repository.customerOwnsTask(
      'c8ae551b-9c3f-4781-a99d-4c81de40ab91',
      applicationRow.task_id,
    );

    expect(result).toBe(false);
  });

  it('should update message and status with updated_at', async () => {
    database.query.mockResolvedValue({
      rows: [{ ...applicationRow, message: 'Новое сообщение' }],
    });

    const result = await repository.update(applicationRow.id, {
      message: 'Новое сообщение',
      status: TaskApplicationStatus.Accept,
    });

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('UPDATE task_applications SET');
    expect(sql).toContain('message = $1');
    expect(sql).toContain('status = $2');
    expect(sql).toContain('updated_at = now()');
    expect(sql).toContain('WHERE id = $3');
    expect(params).toEqual([
      'Новое сообщение',
      TaskApplicationStatus.Accept,
      applicationRow.id,
    ]);
    expect(result?.message).toBe('Новое сообщение');
  });

  it('should load application by id when update has no fields', async () => {
    database.query.mockResolvedValue({ rows: [applicationRow] });

    const result = await repository.update(applicationRow.id, {});

    const [sql, params] = database.query.mock.calls[0];

    expect(sql).toContain('FROM task_applications');
    expect(sql).toContain('WHERE id = $1');
    expect(params).toEqual([applicationRow.id]);
    expect(result?.id).toBe(applicationRow.id);
  });

  it('should return null when updated application is missing', async () => {
    database.query.mockResolvedValue({ rows: [] });

    const result = await repository.update(applicationRow.id, {
      message: 'Новое сообщение',
    });

    expect(result).toBeNull();
  });
});
