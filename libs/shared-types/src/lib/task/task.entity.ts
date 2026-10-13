import { Entity } from '../abstract';
import { UserEntity } from '../user/user.entity';
import { UserRole } from '../user/user-role';
import { ITask } from './task';
import { TaskDbRow } from './task.db-row';
import { TaskExecutionType } from './task-execution-type';
import { TaskStatus } from './task-status';

export class TaskEntity extends Entity<ITask> {
  title!: string;
  description!: string;
  status!: TaskStatus;
  budgetMin!: number;
  budgetMax!: number;
  executionType!: TaskExecutionType;
  deadline!: Date;
  customerId!: string;
  categoryId!: string;
  hasApplied?: boolean;
  applicationsCount?: number;
  viewsCount!: number;
  author?: UserEntity;

  constructor(props?: Partial<ITask>) {
    super(props);
  }

  static fromDb(row: Partial<TaskDbRow>): TaskEntity {
    const task = new TaskEntity({
      ...(row.id !== undefined && { id: row.id }),
      ...(row.title !== undefined && { title: row.title }),
      ...(row.description !== undefined && { description: row.description }),
      ...(row.status !== undefined && { status: row.status as TaskStatus }),
      ...(row.budget_min !== undefined && { budgetMin: row.budget_min }),
      ...(row.budget_max !== undefined && { budgetMax: row.budget_max }),
      ...(row.execution_type !== undefined && {
        executionType: row.execution_type as TaskExecutionType,
      }),
      ...(row.deadline !== undefined && { deadline: row.deadline }),
      ...(row.customer_id !== undefined && { customerId: row.customer_id }),
      ...(row.category_id !== undefined && { categoryId: row.category_id }),
      ...(row.created_at !== undefined && { createdAt: row.created_at }),
      ...(row.updated_at !== undefined && { updatedAt: row.updated_at }),
    });

    if (row.has_applied !== undefined) {
      task.hasApplied = row.has_applied;
    }

    if (row.applications_count !== undefined) {
      task.applicationsCount = Number(row.applications_count);
    }

    if (
      row.author_id !== undefined &&
      row.author_email !== undefined &&
      row.author_first_name !== undefined &&
      row.author_role !== undefined &&
      row.author_created_at !== undefined
    ) {
      task.author = new UserEntity({
        id: row.author_id,
        email: row.author_email,
        firstName: row.author_first_name,
        ...(row.author_last_name != null && { lastName: row.author_last_name }),
        role: row.author_role as UserRole,
        createdAt: row.author_created_at,
      });
    }

    // TODO: Добавить учёт просмотров задачи
    task.viewsCount = 0;

    return task;
  }

  toDb(): Partial<TaskDbRow> {
    return {
      ...(this.id !== undefined && { id: this.id }),
      ...(this.title !== undefined && { title: this.title }),
      ...(this.description !== undefined && { description: this.description }),
      ...(this.status !== undefined && { status: this.status }),
      ...(this.budgetMin !== undefined && { budget_min: this.budgetMin }),
      ...(this.budgetMax !== undefined && { budget_max: this.budgetMax }),
      ...(this.executionType !== undefined && { execution_type: this.executionType }),
      ...(this.deadline !== undefined && { deadline: this.deadline }),
      ...(this.customerId !== undefined && { customer_id: this.customerId }),
      ...(this.categoryId !== undefined && { category_id: this.categoryId }),
      ...(this.createdAt !== undefined && { created_at: this.createdAt }),
      ...(this.updatedAt !== undefined && { updated_at: this.updatedAt }),
    };
  }

  toObject(): ITask {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      title: this.title,
      description: this.description,
      status: this.status,
      budgetMin: this.budgetMin,
      budgetMax: this.budgetMax,
      executionType: this.executionType,
      deadline: this.deadline,
      customerId: this.customerId,
      categoryId: this.categoryId,
    };
  }
}
