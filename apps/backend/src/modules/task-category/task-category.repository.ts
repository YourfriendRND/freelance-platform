import { Injectable } from '@nestjs/common';
import { DatabaseClient } from '../../database/database.client';
import { TaskCategoryDbRow, TaskCategoryEntity } from '@freelance-platform/shared-types';

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

    return rows.map((row) => TaskCategoryEntity.fromDb(row));
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
