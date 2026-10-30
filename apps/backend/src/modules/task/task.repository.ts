import { Injectable } from '@nestjs/common';
import {
  CreateTaskRecord,
  CustomerTaskStats,
  FindMyTasksQuery,
  FindTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PaginationResult,
  PUBLIC_TASK_STATUSES,
  TaskApplicationStatus,
  TaskDbRow,
  TaskEntity,
  TaskSort,
  TaskStatus,
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

type CustomerTaskStatsRow = {
  open_count: string;
  closed_count: string;
  draft_count: string;
  pending_applications: string;
};

type TaskBudgetStatsRow = {
  min_budget: string;
  max_budget: string;
  avg_budget_min: string;
  avg_budget_max: string;
};

const TASK_SORT_ORDER: Record<TaskSort, string> = {
  [TaskSort.Newest]: 'tasks.created_at DESC, tasks.id DESC',
  [TaskSort.Oldest]: 'tasks.created_at ASC, tasks.id ASC',
  [TaskSort.BudgetDesc]: 'tasks.budget_max DESC, tasks.created_at DESC, tasks.id DESC',
  [TaskSort.BudgetAsc]: 'tasks.budget_min ASC, tasks.created_at DESC, tasks.id DESC',
};

type TaskPageQuery = {
  customerId?: string;
  categoryId?: string;
  status?: string;
  budgetMin?: number;
  budgetMax?: number;
  sort?: TaskSort;
  page?: number;
  limit?: number;
  limitToPublicStatuses: boolean;
  performerId?: string;
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
        WITH inserted AS (
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
        )
        SELECT
          inserted.id AS id,
          inserted.title AS title,
          inserted.description AS description,
          inserted.status AS status,
          inserted.budget_min AS budget_min,
          inserted.budget_max AS budget_max,
          inserted.execution_type AS execution_type,
          inserted.deadline AS deadline,
          inserted.customer_id AS customer_id,
          inserted.category_id AS category_id,
          inserted.created_at AS created_at,
          inserted.updated_at AS updated_at,
          (
            SELECT COUNT(*)
            FROM task_applications
            WHERE task_applications.task_id = inserted.id
          ) AS applications_count,
          (
            SELECT COUNT(*)
            FROM task_views
            WHERE task_views.task_id = inserted.id
          ) AS views_count,
          u.id AS author_id,
          u.email AS author_email,
          u.first_name AS author_first_name,
          u.last_name AS author_last_name,
          u.role AS author_role,
          u.created_at AS author_created_at
        FROM inserted
        INNER JOIN users AS u ON u.id = inserted.customer_id
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

  async findAll(
    query: FindTasksQuery,
    performerId?: string,
  ): Promise<PaginationResult<TaskEntity>> {
    return this.findPage({
      ...query,
      limitToPublicStatuses: true,
      ...(performerId !== undefined && { performerId }),
    });
  }

  async findAllByCustomer(
    customerId: string,
    query: FindMyTasksQuery,
  ): Promise<PaginationResult<TaskEntity>> {
    return this.findPage({
      customerId,
      ...query,
      limitToPublicStatuses: false,
    });
  }

  private async findPage(query: TaskPageQuery): Promise<PaginationResult<TaskEntity>> {
    const {
      customerId,
      categoryId,
      status,
      budgetMin,
      budgetMax,
      sort,
      page = PAGINATION_DEFAULT_PAGE,
      limit = PAGINATION_DEFAULT_LIMIT,
      limitToPublicStatuses,
      performerId,
    } = query;
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (customerId !== undefined) {
      values.push(customerId);
      conditions.push(`customer_id = $${values.length}`);
    }

    if (categoryId !== undefined) {
      values.push(categoryId);
      conditions.push(`category_id = $${values.length}`);
    }

    if (status !== undefined) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    } else if (limitToPublicStatuses) {
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
    const selectValues = [...values];
    let hasAppliedSql = '';

    if (performerId !== undefined) {
      selectValues.push(performerId);
      hasAppliedSql = `
            tasks.id IN (
              SELECT task_id
              FROM task_applications
              WHERE performer_id = $${selectValues.length}
            ) AS has_applied`;
    }

    selectValues.push(limit, offset);
    const limitPlaceholder = `$${selectValues.length - 1}`;
    const offsetPlaceholder = `$${selectValues.length}`;

    const [tasksResult, countResult] = await Promise.all([
      this.database.query<TaskDbRow>(
        `
          SELECT
            tasks.id AS id,
            tasks.title AS title,
            tasks.description AS description,
            tasks.status AS status,
            tasks.budget_min AS budget_min,
            tasks.budget_max AS budget_max,
            tasks.execution_type AS execution_type,
            tasks.deadline AS deadline,
            tasks.customer_id AS customer_id,
            tasks.category_id AS category_id,
            tasks.created_at AS created_at,
            tasks.updated_at AS updated_at,
            (
              SELECT COUNT(*)
              FROM task_applications
              WHERE task_applications.task_id = tasks.id
            ) AS applications_count,
            (
              SELECT COUNT(*)
              FROM task_views
              WHERE task_views.task_id = tasks.id
            ) AS views_count,
            u.id AS author_id,
            u.email AS author_email,
            u.first_name AS author_first_name,
            u.last_name AS author_last_name,
            u.role AS author_role,
            u.created_at AS author_created_at${hasAppliedSql ? `,${hasAppliedSql}` : ''}
          FROM tasks
          INNER JOIN users AS u ON u.id = tasks.customer_id
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

  async findById(id: string, performerId?: string): Promise<TaskEntity | null> {
    const values: unknown[] = [id];
    let hasAppliedSql = '';

    if (performerId !== undefined) {
      values.push(performerId);
      hasAppliedSql = `
          tasks.id IN (
            SELECT task_id
            FROM task_applications
            WHERE performer_id = $${values.length}
          ) AS has_applied`;
    }

    const { rows } = await this.database.query<TaskDbRow>(
      `
        SELECT
          tasks.id AS id,
          tasks.title AS title,
          tasks.description AS description,
          tasks.status AS status,
          tasks.budget_min AS budget_min,
          tasks.budget_max AS budget_max,
          tasks.execution_type AS execution_type,
          tasks.deadline AS deadline,
          tasks.customer_id AS customer_id,
          tasks.category_id AS category_id,
          tasks.created_at AS created_at,
          tasks.updated_at AS updated_at,
          (
            SELECT COUNT(*)
            FROM task_applications
            WHERE task_applications.task_id = tasks.id
          ) AS applications_count,
          (
            SELECT COUNT(*)
            FROM task_views
            WHERE task_views.task_id = tasks.id
          ) AS views_count,
          u.id AS author_id,
          u.email AS author_email,
          u.first_name AS author_first_name,
          u.last_name AS author_last_name,
          u.role AS author_role,
          u.created_at AS author_created_at${hasAppliedSql ? `,${hasAppliedSql}` : ''}
        FROM tasks
        INNER JOIN users AS u ON u.id = tasks.customer_id
        WHERE tasks.id = $1
      `,
      values,
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    return TaskEntity.fromDb(row);
  }

  async recordView(userId: string, taskId: string): Promise<void> {
    await this.database.query(
      `
        INSERT INTO task_views (user_id, task_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, task_id)
        DO UPDATE SET updated_at = now()
      `,
      [userId, taskId],
    );
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
        WITH updated AS (
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
        )
        SELECT
          updated.id AS id,
          updated.title AS title,
          updated.description AS description,
          updated.status AS status,
          updated.budget_min AS budget_min,
          updated.budget_max AS budget_max,
          updated.execution_type AS execution_type,
          updated.deadline AS deadline,
          updated.customer_id AS customer_id,
          updated.category_id AS category_id,
          updated.created_at AS created_at,
          updated.updated_at AS updated_at,
          (
            SELECT COUNT(*)
            FROM task_applications
            WHERE task_applications.task_id = updated.id
          ) AS applications_count,
          (
            SELECT COUNT(*)
            FROM task_views
            WHERE task_views.task_id = updated.id
          ) AS views_count,
          u.id AS author_id,
          u.email AS author_email,
          u.first_name AS author_first_name,
          u.last_name AS author_last_name,
          u.role AS author_role,
          u.created_at AS author_created_at
        FROM updated
        INNER JOIN users AS u ON u.id = updated.customer_id
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
   * Счетчики задач заказчика и откликов на рассмотрении.
   * Pending считается только по открытым задачам. Пустая выборка отдается нулями.
   */
  async countCustomerStats(customerId: string): Promise<CustomerTaskStats> {
    const { rows } = await this.database.query<CustomerTaskStatsRow>(
      `
        SELECT
          COUNT(*) FILTER (WHERE tasks.status = $2) AS open_count,
          COUNT(*) FILTER (WHERE tasks.status = $3) AS closed_count,
          COUNT(*) FILTER (WHERE tasks.status = $4) AS draft_count,
          (
            SELECT COUNT(*)
            FROM task_applications AS ta
            INNER JOIN tasks AS open_tasks ON open_tasks.id = ta.task_id
            WHERE open_tasks.customer_id = $1
              AND open_tasks.status = $2
              AND ta.status = $5
          ) AS pending_applications
        FROM tasks
        WHERE tasks.customer_id = $1
      `,
      [
        customerId,
        TaskStatus.Open,
        TaskStatus.Closed,
        TaskStatus.Draft,
        TaskApplicationStatus.Pending,
      ],
    );

    const [row] = rows;

    return {
      open: Number(row?.open_count ?? 0),
      closed: Number(row?.closed_count ?? 0),
      draft: Number(row?.draft_count ?? 0),
      pendingApplications: Number(row?.pending_applications ?? 0),
    };
  }

  /**
   * ! Deprecated - не учитывать в отчетах.
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
   * ! Deprecated - не учитывать в отчетах.
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
