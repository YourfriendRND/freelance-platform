import { Injectable } from '@nestjs/common';
import { CreateTaskRecord, TaskDbRow, TaskEntity, UpdateTaskRecord } from '@freelance-platform/shared-types';
import { DatabaseClient } from '../../database/database.client';

const TASK_UPDATE_COLUMNS = {
  title: 'title',
  description: 'description',
  status: 'status',
  budgetMin: 'budget_min',
  budgetMax: 'budget_max',
  executionType: 'execution_type',
  deadline: 'deadline',
  categoryId: 'category_id',
} as const;

type TaskUpdateField = keyof typeof TASK_UPDATE_COLUMNS;

@Injectable()
export class TaskRepository {
  constructor(private readonly database: DatabaseClient) {}

  async create(task: CreateTaskRecord): Promise<TaskEntity> {
    const {
      title,
      description,
      status,
      budgetMin,
      budgetMax,
      executionType,
      deadline,
      customerId,
      categoryId,
    } = task;

    const { rows } = await this.database.query<TaskDbRow>(
      `
        INSERT INTO tasks (
          title,
          description,
          status,
          budget_min,
          budget_max,
          execution_type,
          deadline,
          customer_id,
          category_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          title,
          description,
          status,
          budget_min,
          budget_max,
          execution_type,
          deadline,
          customer_id,
          category_id,
          created_at,
          updated_at
      `,
      [
        title,
        description,
        status,
        budgetMin,
        budgetMax,
        executionType,
        deadline,
        customerId,
        categoryId,
      ],
    );

    const [row] = rows;

    return TaskEntity.fromDb(row);
  }

  async findAll(): Promise<TaskEntity[]> {
    const { rows } = await this.database.query<TaskDbRow>(
      `
        SELECT
          id,
          title,
          description,
          status,
          budget_min,
          budget_max,
          execution_type,
          deadline,
          customer_id,
          category_id,
          created_at,
          updated_at
        FROM tasks
        ORDER BY created_at DESC
      `,
    );

    return rows.map((row) => TaskEntity.fromDb(row));
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const { rows } = await this.database.query<TaskDbRow>(
      `
        SELECT
          id,
          title,
          description,
          status,
          budget_min,
          budget_max,
          execution_type,
          deadline,
          customer_id,
          category_id,
          created_at,
          updated_at
        FROM tasks
        WHERE id = $1
      `,
      [id],
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    return TaskEntity.fromDb(row);
  }

  async update(id: string, patch: UpdateTaskRecord): Promise<TaskEntity | null> {
    const assignments: string[] = [];
    const values: unknown[] = [];

    for (const [field, column] of Object.entries(TASK_UPDATE_COLUMNS)) {
      const value = patch[field as TaskUpdateField];

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

    const { rows } = await this.database.query<TaskDbRow>(
      `
        UPDATE tasks
        SET ${assignments.join(', ')}, updated_at = now()
        WHERE id = ${idPlaceholder}
        RETURNING
          id,
          title,
          description,
          status,
          budget_min,
          budget_max,
          execution_type,
          deadline,
          customer_id,
          category_id,
          created_at,
          updated_at
      `,
      values,
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    return TaskEntity.fromDb(row);
  }

  async deleteById(id: string): Promise<boolean> {
    const { rowCount } = await this.database.query(
      `
        DELETE FROM tasks
        WHERE id = $1
      `,
      [id],
    );

    return (rowCount ?? 0) > 0;
  }
}
