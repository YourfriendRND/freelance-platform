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
  // TODO: подставить applicationsCount, когда бэкенд начнёт отдавать число откликов
  applicationsCount: number;
  // TODO: подставить viewsCount, когда бэкенд начнёт отдавать число просмотров
  viewsCount: number;
  // TODO: подставить автора, когда бэкенд начнёт отдавать данные пользователя
  author: UserResponse | null;
};
