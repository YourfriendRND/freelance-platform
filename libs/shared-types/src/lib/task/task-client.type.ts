import { PaginationResult } from '../common/pagination.type';
import { TaskExecutionType } from './task-execution-type';
import { TaskStatus } from './task-status';

export type CreateTaskRequest = {
  title: string;
  description: string;
  status: TaskStatus;
  budgetMin: number;
  budgetMax: number;
  executionType: TaskExecutionType;
  deadline: string;
  categoryId: string;
};

export type TaskResponse = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  budgetMin: number;
  budgetMax: number;
  executionType: TaskExecutionType;
  deadline: string;
  customerId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  // TODO: бэкенд должен отдавать признак hasApplied вместе с задачей, чтобы не загружать список откликов и не сопоставлять его на клиенте
};

export type TaskListResponse = PaginationResult<TaskResponse>;

export type TaskCategoryResponse = {
  id: string;
  title: string;
  description: string;
};
