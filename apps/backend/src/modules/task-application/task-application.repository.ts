import { Injectable } from '@nestjs/common';
import {
  CreateTaskApplicationRecord,
  TaskApplicationDbRow,
  TaskApplicationEntity,
  TaskApplicationStatus,
  TaskApplicationWithTaskCustomer,
  TaskApplicationWithTaskCustomerDbRow,
  TaskDbRow,
  UpdateTaskApplicationRecord,
} from '@freelance-platform/shared-types';
import { DatabaseClient } from '../../database/database.client';
import { DuplicateTaskApplicationError } from './errors';

const UNIQUE_VIOLATION_CODE = '23505';

@Injectable()
export class TaskApplicationRepository {
  constructor(private readonly database: DatabaseClient) {}

  async create(record: CreateTaskApplicationRecord): Promise<TaskApplicationEntity> {
    const {
      taskId,
      performerId,
      message,
      proposedPrice = null,
      status = TaskApplicationStatus.Pending,
    } = record;

    try {
      const { rows } = await this.database.query<TaskApplicationDbRow>(
        `
        INSERT INTO task_applications (
            task_id,
            performer_id,
            message,
            proposed_price,
            status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            task_id,
            performer_id,
            message,
            proposed_price,
            status,
            created_at,
            updated_at
        `,
        [taskId, performerId, message, proposedPrice, status],
      );

      const [row] = rows;

      return TaskApplicationEntity.fromDb(row);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new DuplicateTaskApplicationError();
      }

      throw error;
    }
  }

  async findById(id: string): Promise<TaskApplicationEntity | null> {
    const { rows } = await this.database.query<TaskApplicationDbRow>(
      `
        SELECT
            id,
            task_id,
            performer_id,
            message,
            proposed_price,
            status,
            created_at,
            updated_at
        FROM task_applications
        WHERE id = $1
      `,
      [id],
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    return TaskApplicationEntity.fromDb(row);
  }

  async findByIdWithTaskCustomer(
    id: string,
  ): Promise<TaskApplicationWithTaskCustomer | null> {
    const { rows } = await this.database.query<TaskApplicationWithTaskCustomerDbRow>(
      `
        SELECT
            task_applications.id AS id,
            task_applications.task_id AS task_id,
            task_applications.performer_id AS performer_id,
            task_applications.message AS message,
            task_applications.proposed_price AS proposed_price,
            task_applications.status AS status,
            task_applications.created_at AS created_at,
            task_applications.updated_at AS updated_at,
            tasks.customer_id AS task_customer_id
        FROM task_applications
        INNER JOIN tasks ON task_applications.task_id = tasks.id
        WHERE task_applications.id = $1
      `,
      [id],
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    const { task_customer_id: taskCustomerId, ...applicationRow } = row;

    return {
      application: TaskApplicationEntity.fromDb(applicationRow),
      taskCustomerId,
    };
  }

  async findAllByPerformerId(performerId: string): Promise<TaskApplicationEntity[]> {
    const { rows } = await this.database.query<TaskApplicationDbRow>(
      `
        SELECT
            id,
            task_id,
            performer_id,
            message,
            proposed_price,
            status,
            created_at,
            updated_at
        FROM task_applications
        WHERE performer_id = $1
        ORDER BY created_at DESC, id DESC
      `,
      [performerId],
    );

    return rows.map((row: TaskApplicationDbRow) => TaskApplicationEntity.fromDb(row));
  }

  async findAllByCustomerId(customerId: string): Promise<TaskApplicationEntity[]> {
    const { rows } = await this.database.query<TaskApplicationDbRow>(
      `
        SELECT
            task_applications.id AS id,
            task_applications.task_id AS task_id,
            task_applications.performer_id AS performer_id,
            task_applications.message AS message,
            task_applications.proposed_price AS proposed_price,
            task_applications.status AS status,
            task_applications.created_at AS created_at,
            task_applications.updated_at AS updated_at
        FROM task_applications
        INNER JOIN tasks ON task_applications.task_id = tasks.id
        WHERE tasks.customer_id = $1
        ORDER BY task_applications.created_at DESC, task_applications.id DESC
      `,
      [customerId],
    );

    return rows.map((row: TaskApplicationDbRow) => TaskApplicationEntity.fromDb(row));
  }

  async findAllByCustomerIdAndTaskId(
    customerId: string,
    taskId: string,
  ): Promise<TaskApplicationEntity[]> {
    const { rows } = await this.database.query<TaskApplicationDbRow>(
      `
        SELECT
            task_applications.id AS id,
            task_applications.task_id AS task_id,
            task_applications.performer_id AS performer_id,
            task_applications.message AS message,
            task_applications.proposed_price AS proposed_price,
            task_applications.status AS status,
            task_applications.created_at AS created_at,
            task_applications.updated_at AS updated_at
        FROM task_applications
        INNER JOIN tasks ON task_applications.task_id = tasks.id
        WHERE tasks.customer_id = $1 AND task_applications.task_id = $2
        ORDER BY task_applications.created_at DESC, task_applications.id DESC
      `,
      [customerId, taskId],
    );

    return rows.map((row: TaskApplicationDbRow) => TaskApplicationEntity.fromDb(row));
  }

  async customerOwnsTask(customerId: string, taskId: string): Promise<boolean> {
    const { rows } = await this.database.query<Pick<TaskDbRow, 'id'>>(
      `
        SELECT id
        FROM tasks
        WHERE id = $1 AND customer_id = $2
        LIMIT 1
      `,
      [taskId, customerId],
    );

    const [row] = rows;

    return Boolean(row);
  }

  async update(
    id: string,
    data: UpdateTaskApplicationRecord,
  ): Promise<TaskApplicationEntity | null> {
    const updateColumns = {
      message: 'message',
      proposedPrice: 'proposed_price',
      status: 'status',
    } as const;

    type UpdateField = keyof typeof updateColumns;

    const assignments: string[] = [];
    const values: unknown[] = [];

    for (const [field, column] of Object.entries(updateColumns)) {
      const value = data[field as UpdateField];

      if (value === undefined) {
        continue;
      }

      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    }

    if (assignments.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const idPlaceholder = `$${values.length}`;

    const { rows } = await this.database.query<TaskApplicationDbRow>(
      `
        UPDATE task_applications SET
        ${assignments.join(', ')},
        updated_at = now()
        WHERE id = ${idPlaceholder}
        RETURNING
            id,
            task_id,
            performer_id,
            message,
            proposed_price,
            status,
            created_at,
            updated_at
      `,
      values,
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    return TaskApplicationEntity.fromDb(row);
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === UNIQUE_VIOLATION_CODE
    );
  }
}
