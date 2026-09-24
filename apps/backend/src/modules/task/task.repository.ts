import { Injectable } from '@nestjs/common';
import {
  CreateTaskRecord,
  FindTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PaginationResult,
  PUBLIC_TASK_STATUSES,
  TaskDbRow,
  TaskEntity,
  TaskSort,
  UpdateTaskRecord,
} from '@freelance-platform/shared-types';
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

type TaskCountRow = {
  total: string;
};

type TaskStatusCountRow = {
  status: string;
  task_count: string;
};

type TaskBudgetStatsRow = {
  min_budget: string;
  max_budget: string;
  avg_budget_min: string;
  avg_budget_max: string;
};

const TASK_SORT_ORDER: Record<TaskSort, string> = {
  [TaskSort.Newest]: 'created_at DESC, id DESC',
  [TaskSort.Oldest]: 'created_at ASC, id ASC',
  [TaskSort.BudgetDesc]: 'budget_max DESC, created_at DESC, id DESC',
  [TaskSort.BudgetAsc]: 'budget_min ASC, created_at DESC, id DESC',
};

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

  async findAll(query: FindTasksQuery): Promise<PaginationResult<TaskEntity>> {
    const {
      categoryId,
      status,
      budgetMin,
      budgetMax,
      sort,
      page = PAGINATION_DEFAULT_PAGE,
      limit = PAGINATION_DEFAULT_LIMIT,
    } = query;
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (categoryId !== undefined) {
      values.push(categoryId);
      conditions.push(`category_id = $${values.length}`);
    }

    if (status !== undefined) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    } else {
      const statusPlaceholders = PUBLIC_TASK_STATUSES.map((publicStatus) => {
        values.push(publicStatus);

        return `$${values.length}`;
      });

      conditions.push(`status IN (${statusPlaceholders.join(', ')})`);
    }

    if (budgetMin !== undefined) {
      values.push(budgetMin);
      conditions.push(`budget_min >= $${values.length}`);
    }

    if (budgetMax !== undefined) {
      values.push(budgetMax);
      conditions.push(`budget_max <= $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';
    const orderBy = TASK_SORT_ORDER[sort ?? TaskSort.Newest];
    const offset = (page - 1) * limit;
    const selectValues = [...values, limit, offset];
    const limitPlaceholder = `$${selectValues.length - 1}`;
    const offsetPlaceholder = `$${selectValues.length}`;

    const [tasksResult, countResult] = await Promise.all([
      this.database.query<TaskDbRow>(
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
          ${whereClause}
          ORDER BY ${orderBy}
          LIMIT ${limitPlaceholder}
          OFFSET ${offsetPlaceholder}
        `,
        selectValues,
      ),
      this.database.query<TaskCountRow>(
        `
          SELECT COUNT(*) AS total
          FROM tasks
          ${whereClause}
        `,
        values,
      ),
    ]);

    const [countRow] = countResult.rows;

    return {
      items: tasksResult.rows.map((row: TaskDbRow) => TaskEntity.fromDb(row)),
      total: Number(countRow?.total ?? 0),
      page,
      limit,
    };
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

  /**
   * Количество задач заказчика по каждому статусу.
   * Группы без задач у этого customer_id в выборку не попадают.
   */
  async countTasksByStatus(userId: string): Promise<TaskStatusCountRow[]> {
    const { rows } = await this.database.query<TaskStatusCountRow>(
      `
        SELECT 
          status, 
          COUNT(*) AS task_count 
        FROM tasks
        WHERE customer_id = $1
        GROUP BY status 
        ORDER BY status
      `,
      [userId],
    );

    return rows;
  }

  /**
   * MIN/MAX/AVG бюджета задач заказчика (одна строка).
   * Если задач нет, агрегаты приходят как 0 за счёт COALESCE.
   */
  async getBudgetStats(userId: string): Promise<TaskBudgetStatsRow | null> {
    const { rows } = await this.database.query<TaskBudgetStatsRow>(
      `
        SELECT 
          COALESCE(ROUND(MIN(budget_min), 2), 0) AS min_budget, 
          COALESCE(ROUND(MAX(budget_max), 2), 0) AS max_budget,
          COALESCE(ROUND(AVG(budget_min), 2), 0) AS avg_budget_min, 
          COALESCE(ROUND(AVG(budget_max), 2), 0) AS avg_budget_max 
        FROM tasks
        WHERE customer_id = $1
      `,
      [userId],
    );

    const [row] = rows;

    return row ?? null;
  }
}
