import { TaskExecutionType } from './task-execution-type';
import { TaskStatus } from './task-status';
import { UserResponse } from '../auth/auth-client.type';

export type TaskViewData = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  budgetMin: number;
  budgetMax: number;
  executionType: TaskExecutionType;
  deadline: string;
  createdAt: string;
  categoryTitle: string;
  applicationsCount: number;
  viewsCount: number;
  author: UserResponse | null;
};
