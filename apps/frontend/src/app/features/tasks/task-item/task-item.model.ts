import {
  TaskExecutionType,
  TaskStatus,
  UserResponse,
} from '@freelance-platform/shared-types';

export type TaskItemData = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  budgetMin: number;
  budgetMax: number;
  executionType: TaskExecutionType;
  createdAt: string;
  categoryTitle: string;
  // TODO: подставить applicationsCount, когда бэкенд начнёт отдавать число откликов
  applicationsCount: number;
  // TODO: подставить viewsCount, когда бэкенд начнёт отдавать число просмотров
  viewsCount: number;
  // TODO: подставить автора, когда бэкенд начнёт отдавать данные пользователя
  author: UserResponse | null;
};