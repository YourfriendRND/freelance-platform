import { UserResponse } from '../auth/auth-client.type';
import { ShortTaskResponse } from '../task/task-client.type';
import { TaskApplicationStatus } from './task-application-status';

export type CreateTaskApplicationRequest = {
  taskId: string;
  message: string;
  proposedPrice?: number;
  timeline?: string;
};

export type UpdateTaskApplicationRequest = {
  status: TaskApplicationStatus;
};

export type TaskApplicationResponse = {
  id: string;
  taskId: string;
  performerId: string;
  proposedPrice: number | null;
  message: string;
  timeline: string | null;
  status: TaskApplicationStatus;
  createdAt: string;
  updatedAt: string;
  user: UserResponse;
  task?: ShortTaskResponse;
};

export type TaskApplicationListResponse = {
  items: TaskApplicationResponse[];
};

export type TaskApplicationStatsResponse = {
  total: number;
  pending: number;
  accepted: number;
};
