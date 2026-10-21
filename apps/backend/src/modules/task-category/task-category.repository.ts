import { Injectable } from '@nestjs/common';
import { DatabaseClient } from '../../database/database.client';
import {
  PopularTaskCategory,
  TaskCategoryDbRow,
  TaskCategoryEntity,
  TaskStatus,
} from '@freelance-platform/shared-types';

const POPULAR_TASK_CATEGORIES_LIMIT = 8;

type PopularTaskCategoryRow = {
  id: string;
  title: string;
  description: string;
  task_count: string;
};

type TaskCategoryCountRow = {
  category_id: string;
  title: string;
  task_count: string;
};

type TaskCategoryBudgetStatsRow = {
  category_id: string;
  title: string;
  min_budget: string;
  max_budget: string;
  sum_budget_max: string;
};

@Injectable()
export class TaskCategoryRepository {
  constructor(private readonly database: DatabaseClient) {}

  async findAll(): Promise<TaskCategoryEntity[]> {
    const { rows } = await this.database.query<TaskCategoryDbRow>(
      `
        SELECT id, title, description, created_at, updated_at
        FROM task_categories
        ORDER BY title
      `,
    );

    return rows.map((row: TaskCategoryDbRow) => TaskCategoryEntity.fromDb(row));
  }

  async findById(id: string): Promise<TaskCategoryEntity | null> {
    const { rows } = await this.database.query<TaskCategoryDbRow>(
      `
        SELECT id, title, description, created_at, updated_at
        FROM task_categories
        WHERE id = $1
      `,
      [id],
    );

    const [row] = rows;

    if (!row) {
      return null;
    }

    return TaskCategoryEntity.fromDb(row);
  }

  /**
   * До 8 категорий с открытыми задачами.
   * Категории без открытых задач не попадают в выборку.
   */
  async findPopular(): Promise<PopularTaskCategory[]> {
    const { rows } = await this.database.query<PopularTaskCategoryRow>(
      `
        SELECT
          tc.id AS id,
          tc.title AS title,
          tc.description AS description,
          COUNT(*) AS task_count
        FROM task_categories AS tc
        INNER JOIN tasks AS t ON t.category_id = tc.id
        WHERE t.status = $1
        GROUP BY tc.id, tc.title, tc.description
        ORDER BY task_count DESC, tc.title ASC
        LIMIT $2
      `,
      [TaskStatus.Open, POPULAR_TASK_CATEGORIES_LIMIT],
    );

    return rows.map((row: PopularTaskCategoryRow) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      taskCount: Number(row.task_count),
    }));
  }

  /**
   * ! Deprecated - не учитывать в отчетах.
   * Количество задач заказчика по каждой категории.
   * Категории без задач этого customer_id в выборку не попадают.
   */
  async countTasksByCategory(userId: string): Promise<TaskCategoryCountRow[]> {
    const { rows } = await this.database.query<TaskCategoryCountRow>(
      `
        SELECT tc.id AS category_id, tc.title AS title, COUNT(*) AS task_count 
        FROM task_categories tc
        INNER JOIN tasks t ON tc.id = t.category_id
        WHERE t.customer_id = $1
        GROUP BY tc.id, tc.title
        ORDER BY tc.title
      `,
      [userId],
    );

    return rows;
  }

  /**
   * ! Deprecated - не учитывать в отчетах.
   * MIN/MAX/SUM бюджета задач заказчика по каждой категории.
   * Категории без задач этого customer_id в выборку не попадают.
   */
  async getBudgetStatsByCategory(userId: string): Promise<TaskCategoryBudgetStatsRow[]> {
    const { rows } = await this.database.query<TaskCategoryBudgetStatsRow>(
      `
        SELECT 
          tc.id AS category_id, 
          tc.title AS title,
          COALESCE(ROUND(MIN(t.budget_min), 2), 0) AS min_budget, 
          COALESCE(ROUND(MAX(t.budget_max), 2), 0) AS max_budget,
          SUM(t.budget_max) AS sum_budget_max
        FROM task_categories tc
        INNER JOIN tasks t ON t.category_id = tc.id
        WHERE t.customer_id = $1
        GROUP BY tc.id, tc.title
        ORDER BY tc.title
      `,
      [userId],
    );

    return rows;
  }

  /**
   * ! Deprecated - не учитывать в отчетах.
   * Категории заказчика, в которых не меньше minCount задач.
   */
  async findCategoriesWithMinTaskCount(
    userId: string,
    minCount: number,
  ): Promise<TaskCategoryCountRow[]> {
    const { rows } = await this.database.query<TaskCategoryCountRow>(
      `
        SELECT 
          tc.id AS category_id, 
          tc.title AS title,
          COUNT(*) AS task_count
        FROM task_categories tc
        INNER JOIN tasks t ON t.category_id = tc.id 
        WHERE t.customer_id = $1
        GROUP BY tc.id, tc.title
        HAVING COUNT(*) >= $2
        ORDER BY tc.title
      `,
      [userId, minCount],
    );

    return rows;
  }
}
