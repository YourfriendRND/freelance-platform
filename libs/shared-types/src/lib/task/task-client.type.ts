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
};

export type TaskCategoryResponse = {
  id: string;
  title: string;
  description: string;
};
