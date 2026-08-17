import { Entity } from '../abstract';
import { ITaskCategory } from './task-category';
import { TaskCategoryDbRow } from './task-category.db-row';

export class TaskCategoryEntity extends Entity<ITaskCategory> {
  title!: string;
  description!: string;

  constructor(props?: Partial<ITaskCategory>) {
    super(props);
  }

  static fromDb(row: Partial<TaskCategoryDbRow>): TaskCategoryEntity {
    return new TaskCategoryEntity({
      ...(row.id !== undefined && { id: row.id }),
      ...(row.title !== undefined && { title: row.title }),
      ...(row.description !== undefined && { description: row.description }),
      ...(row.created_at !== undefined && { createdAt: row.created_at }),
      ...(row.updated_at !== undefined && { updatedAt: row.updated_at }),
    });
  }

  toDb(): Partial<TaskCategoryDbRow> {
    return {
      ...(this.id !== undefined && { id: this.id }),
      ...(this.title !== undefined && { title: this.title }),
      ...(this.description !== undefined && { description: this.description }),
      ...(this.createdAt !== undefined && { created_at: this.createdAt }),
      ...(this.updatedAt !== undefined && { updated_at: this.updatedAt }),
    };
  }

  toObject(): ITaskCategory {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      title: this.title,
      description: this.description,
    };
  }
}
