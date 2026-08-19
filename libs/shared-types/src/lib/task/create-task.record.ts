import { TaskExecutionType } from './task-execution-type';
import { TaskStatus } from './task-status';

export interface CreateTaskRecord {
  title: string;
  description: string;
  status: TaskStatus;
  budgetMin: number;
  budgetMax: number;
  executionType: TaskExecutionType;
  deadline: Date;
  customerId: string;
  categoryId: string;
}
