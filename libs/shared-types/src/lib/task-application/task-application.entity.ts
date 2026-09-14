import { Entity } from '../abstract';
import { ITaskApplication } from './task-application';
import { TaskApplicationDbRow } from './task-application.db-row';
import { TaskApplicationStatus } from './task-application-status';

export class TaskApplicationEntity extends Entity<ITaskApplication> {
  taskId!: string;
  performerId!: string;
  proposedPrice!: number | null;
  message!: string;
  status!: TaskApplicationStatus;

  constructor(props?: Partial<ITaskApplication>) {
    super(props);
  }

  static fromDb(row: Partial<TaskApplicationDbRow>): TaskApplicationEntity {
    return new TaskApplicationEntity({
      ...(row.id !== undefined && { id: row.id }),
      ...(row.task_id !== undefined && { taskId: row.task_id }),
      ...(row.performer_id !== undefined && { performerId: row.performer_id }),
      ...(row.proposed_price !== undefined && { proposedPrice: row.proposed_price }),
      ...(row.message !== undefined && { message: row.message }),
      ...(row.status !== undefined && {
        status: row.status as TaskApplicationStatus,
      }),
      ...(row.created_at !== undefined && { createdAt: row.created_at }),
      ...(row.updated_at !== undefined && { updatedAt: row.updated_at }),
    });
  }

  toDb(): Partial<TaskApplicationDbRow> {
    return {
      ...(this.id !== undefined && { id: this.id }),
      ...(this.taskId !== undefined && { task_id: this.taskId }),
      ...(this.performerId !== undefined && { performer_id: this.performerId }),
      ...(this.proposedPrice !== undefined && { proposed_price: this.proposedPrice }),
      ...(this.message !== undefined && { message: this.message }),
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
      status: this.status,
    };
  }
}
