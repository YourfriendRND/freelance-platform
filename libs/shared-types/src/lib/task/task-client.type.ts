import { UserResponse } from '../auth/auth-client.type';
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
  applicationsCount: number;
  viewsCount: number;
  author: UserResponse;
  hasApplied?: boolean;
};

export type ShortTaskResponse = {
  id: string;
  title: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  executionType: TaskExecutionType;
  categoryId: string;
  author: UserResponse;
};

export type TaskListResponse = PaginationResult<TaskResponse>;

export type TaskCategoryResponse = {
  id: string;
  title: string;
  description: string;
};
