import { Injectable } from '@nestjs/common';
import { DatabaseClient } from '../../database/database.client';
import { TaskCategoryDbRow, TaskCategoryEntity } from '@freelance-platform/shared-types';

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
}
