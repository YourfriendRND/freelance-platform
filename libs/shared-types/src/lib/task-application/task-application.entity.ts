import { Entity } from '../abstract';
import { TaskEntity } from '../task/task.entity';
import { UserEntity } from '../user/user.entity';
import { UserRole } from '../user/user-role';
import { ITaskApplication } from './task-application';
import { TaskApplicationDbRow } from './task-application.db-row';
import { TaskApplicationStatus } from './task-application-status';

export class TaskApplicationEntity extends Entity<ITaskApplication> {
  taskId!: string;
  performerId!: string;
  proposedPrice!: number | null;
  message!: string;
  timeline!: string | null;
  status!: TaskApplicationStatus;
  user?: UserEntity;
  task?: TaskEntity;

  constructor(props?: Partial<ITaskApplication>) {
    super(props);
  }

  static fromDb(row: Partial<TaskApplicationDbRow>): TaskApplicationEntity {
    const application = new TaskApplicationEntity({
      ...(row.id !== undefined && { id: row.id }),
      ...(row.task_id !== undefined && { taskId: row.task_id }),
      ...(row.performer_id !== undefined && { performerId: row.performer_id }),
      ...(row.proposed_price !== undefined && { proposedPrice: row.proposed_price }),
      ...(row.message !== undefined && { message: row.message }),
      ...(row.timeline !== undefined && { timeline: row.timeline }),
      ...(row.status !== undefined && {
        status: row.status as TaskApplicationStatus,
      }),
      ...(row.created_at !== undefined && { createdAt: row.created_at }),
      ...(row.updated_at !== undefined && { updatedAt: row.updated_at }),
    });

    if (
      row.user_id !== undefined &&
      row.user_email !== undefined &&
      row.user_first_name !== undefined &&
      row.user_role !== undefined &&
      row.user_created_at !== undefined
    ) {
      application.user = new UserEntity({
        id: row.user_id,
        email: row.user_email,
        firstName: row.user_first_name,
        ...(row.user_last_name != null && { lastName: row.user_last_name }),
        role: row.user_role as UserRole,
        createdAt: row.user_created_at,
      });
    }

    if (row.task_id !== undefined && row.task_title !== undefined) {
      application.task = TaskEntity.fromDb({
        id: row.task_id,
        title: row.task_title,
        budget_min: row.task_budget_min,
        budget_max: row.task_budget_max,
        execution_type: row.task_execution_type,
        deadline: row.task_deadline,
        category_id: row.task_category_id,
        ...(row.author_id !== undefined && { customer_id: row.author_id }),
        author_id: row.author_id,
        author_email: row.author_email,
        author_first_name: row.author_first_name,
        author_last_name: row.author_last_name,
        author_role: row.author_role,
        author_created_at: row.author_created_at,
      });
    }

    return application;
  }

  toDb(): Partial<TaskApplicationDbRow> {
    return {
      ...(this.id !== undefined && { id: this.id }),
      ...(this.taskId !== undefined && { task_id: this.taskId }),
      ...(this.performerId !== undefined && { performer_id: this.performerId }),
      ...(this.proposedPrice !== undefined && { proposed_price: this.proposedPrice }),
      ...(this.message !== undefined && { message: this.message }),
      ...(this.timeline !== undefined && { timeline: this.timeline }),
      ...(this.status !== undefined && { status: this.status }),
      ...(this.createdAt !== undefined && { created_at: this.createdAt }),
      ...(this.updatedAt !== undefined && { updated_at: this.updatedAt }),
    };
  }

  toObject(): ITaskApplication {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      taskId: this.taskId,
      performerId: this.performerId,
      proposedPrice: this.proposedPrice,
      message: this.message,
      timeline: this.timeline,
      status: this.status,
    };
  }
}
