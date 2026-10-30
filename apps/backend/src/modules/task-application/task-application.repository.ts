import { Injectable } from '@nestjs/common';
import {
  CreateTaskApplicationRecord,
  TaskApplicationDbRow,
  TaskApplicationEntity,
  TaskApplicationStats,
  TaskApplicationStatsDbRow,
  TaskApplicationStatus,
  TaskApplicationWithTaskCustomer,
  TaskApplicationWithTaskCustomerDbRow,
  TaskDbRow,
  UpdateTaskApplicationRecord,
} from '@freelance-platform/shared-types';
import { DatabaseClient } from '../../database/database.client';
import { DuplicateTaskApplicationError } from './errors';

const UNIQUE_VIOLATION_CODE = '23505';

const SHORT_TASK_COLUMNS = `
            tasks.title AS task_title,
            tasks.budget_min AS task_budget_min,
            tasks.budget_max AS task_budget_max,
            tasks.deadline AS task_deadline,
            tasks.execution_type AS task_execution_type,
            tasks.category_id AS task_category_id,
            author.id AS author_id,
            author.email AS author_email,
            author.first_name AS author_first_name,
            author.last_name AS author_last_name,
            author.role AS author_role,
            author.created_at AS author_created_at`;

const SHORT_TASK_JOIN = `
        INNER JOIN tasks ON ta.task_id = tasks.id
        INNER JOIN users AS author ON author.id = tasks.customer_id`;

@Injectable()
export class TaskApplicationRepository {
  constructor(private readonly database: DatabaseClient) {}

  async create(record: CreateTaskApplicationRecord): Promise<TaskApplicationEntity> {
    const {
      taskId,
      performerId,
      message,
      proposedPrice = null,
      timeline = null,
      status = TaskApplicationStatus.Pending,
    } = record;

    try {
      const { rows } = await this.database.query<TaskApplicationDbRow>(
        `
        WITH inserted AS (
            INSERT INTO task_applications AS ta (
                task_id,
                performer_id,
                message,
                proposed_price,
                timeline,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                task_id,
                performer_id,
                message,
                proposed_price,
                timeline,
                status,
                created_at,
                updated_at
        )
        SELECT
            inserted.id AS id,
            inserted.task_id AS task_id,
            inserted.performer_id AS performer_id,
            inserted.message AS message,
            inserted.proposed_price AS proposed_price,
            inserted.timeline AS timeline,
            inserted.status AS status,
            inserted.created_at AS created_at,
            inserted.updated_at AS updated_at,
            u.id AS user_id,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.role AS user_role,
            u.created_at AS user_created_at
        FROM inserted
        INNER JOIN users AS u ON u.id = inserted.performer_id
        `,
        [taskId, performerId, message, proposedPrice, timeline, status],
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
            ta.id AS id,
            ta.task_id AS task_id,
            ta.performer_id AS performer_id,
            ta.message AS message,
            ta.proposed_price AS proposed_price,
            ta.timeline AS timeline,
            ta.status AS status,
            ta.created_at AS created_at,
            ta.updated_at AS updated_at,
            u.id AS user_id,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.role AS user_role,
            u.created_at AS user_created_at
        FROM task_applications AS ta
        INNER JOIN users AS u ON u.id = ta.performer_id
        WHERE ta.id = $1
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
            ta.id AS id,
            ta.task_id AS task_id,
            ta.performer_id AS performer_id,
            ta.message AS message,
            ta.proposed_price AS proposed_price,
            ta.timeline AS timeline,
            ta.status AS status,
            ta.created_at AS created_at,
            ta.updated_at AS updated_at,
            tasks.customer_id AS task_customer_id,
            u.id AS user_id,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.role AS user_role,
            u.created_at AS user_created_at,
            ${SHORT_TASK_COLUMNS}
        FROM task_applications AS ta
        ${SHORT_TASK_JOIN}
        INNER JOIN users AS u ON u.id = ta.performer_id
        WHERE ta.id = $1
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
            ta.id AS id,
            ta.task_id AS task_id,
            ta.performer_id AS performer_id,
            ta.message AS message,
            ta.proposed_price AS proposed_price,
            ta.timeline AS timeline,
            ta.status AS status,
            ta.created_at AS created_at,
            ta.updated_at AS updated_at,
            u.id AS user_id,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.role AS user_role,
            u.created_at AS user_created_at,
            ${SHORT_TASK_COLUMNS}
        FROM task_applications AS ta
        INNER JOIN users AS u ON u.id = ta.performer_id
        ${SHORT_TASK_JOIN}
        WHERE ta.performer_id = $1
        ORDER BY ta.created_at DESC, ta.id DESC
      `,
      [performerId],
    );

    return rows.map((row: TaskApplicationDbRow) => TaskApplicationEntity.fromDb(row));
  }

  async findAllByCustomerId(customerId: string): Promise<TaskApplicationEntity[]> {
    const { rows } = await this.database.query<TaskApplicationDbRow>(
      `
        SELECT
            ta.id AS id,
            ta.task_id AS task_id,
            ta.performer_id AS performer_id,
            ta.message AS message,
            ta.proposed_price AS proposed_price,
            ta.timeline AS timeline,
            ta.status AS status,
            ta.created_at AS created_at,
            ta.updated_at AS updated_at,
            u.id AS user_id,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.role AS user_role,
            u.created_at AS user_created_at,
            ${SHORT_TASK_COLUMNS}
        FROM task_applications AS ta
        INNER JOIN users AS u ON u.id = ta.performer_id
        ${SHORT_TASK_JOIN}
        WHERE tasks.customer_id = $1
        ORDER BY ta.created_at DESC, ta.id DESC
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
            ta.id AS id,
            ta.task_id AS task_id,
            ta.performer_id AS performer_id,
            ta.message AS message,
            ta.proposed_price AS proposed_price,
            ta.timeline AS timeline,
            ta.status AS status,
            ta.created_at AS created_at,
            ta.updated_at AS updated_at,
            u.id AS user_id,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.role AS user_role,
            u.created_at AS user_created_at,
            ${SHORT_TASK_COLUMNS}
        FROM task_applications AS ta
        INNER JOIN users AS u ON u.id = ta.performer_id
        ${SHORT_TASK_JOIN}
        WHERE tasks.customer_id = $1 AND ta.task_id = $2
        ORDER BY ta.created_at DESC, ta.id DESC
      `,
      [customerId, taskId],
    );

    return rows.map((row: TaskApplicationDbRow) => TaskApplicationEntity.fromDb(row));
  }

  async countByPerformerId(performerId: string): Promise<TaskApplicationStats> {
    const { rows } = await this.database.query<TaskApplicationStatsDbRow>(
      `
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE ta.status = $2) AS pending,
            COUNT(*) FILTER (WHERE ta.status = $3) AS accepted
        FROM task_applications AS ta
        WHERE ta.performer_id = $1
      `,
      [performerId, TaskApplicationStatus.Pending, TaskApplicationStatus.Accept],
    );

    const [row] = rows;

    return {
      total: Number(row?.total ?? 0),
      pending: Number(row?.pending ?? 0),
      accepted: Number(row?.accepted ?? 0),
    };
  }

  async countByCustomerId(customerId: string): Promise<TaskApplicationStats> {
    const { rows } = await this.database.query<TaskApplicationStatsDbRow>(
      `
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE ta.status = $2) AS pending,
            COUNT(*) FILTER (WHERE ta.status = $3) AS accepted
        FROM task_applications AS ta
        INNER JOIN tasks ON ta.task_id = tasks.id
        WHERE tasks.customer_id = $1
      `,
      [customerId, TaskApplicationStatus.Pending, TaskApplicationStatus.Accept],
    );

    const [row] = rows;

    return {
      total: Number(row?.total ?? 0),
      pending: Number(row?.pending ?? 0),
      accepted: Number(row?.accepted ?? 0),
    };
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
      timeline: 'timeline',
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
        WITH updated AS (
            UPDATE task_applications AS ta SET
            ${assignments.join(', ')},
            updated_at = now()
            WHERE ta.id = ${idPlaceholder}
            RETURNING
                id,
                task_id,
                performer_id,
                message,
                proposed_price,
                timeline,
                status,
                created_at,
                updated_at
        )
        SELECT
            updated.id AS id,
            updated.task_id AS task_id,
            updated.performer_id AS performer_id,
            updated.message AS message,
            updated.proposed_price AS proposed_price,
            updated.timeline AS timeline,
            updated.status AS status,
            updated.created_at AS created_at,
            updated.updated_at AS updated_at,
            u.id AS user_id,
            u.email AS user_email,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name,
            u.role AS user_role,
            u.created_at AS user_created_at
        FROM updated
        INNER JOIN users AS u ON u.id = updated.performer_id
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
