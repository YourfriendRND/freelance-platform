import { TaskApplicationStatus } from './task-application-status';

export type CreateTaskApplicationRequest = {
  taskId: string;
  message: string;
  proposedPrice?: number;
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
  status: TaskApplicationStatus;
  createdAt: string;
  updatedAt: string;
  // TODO: бэкенд должен отдавать пользователя вместе с откликом, чтобы не запрашивать его отдельно
};

export type TaskApplicationListResponse = {
  items: TaskApplicationResponse[];
  // TODO: бэкенд должен отдавать статистику откликов конкретного пользователя, чтобы не считать её на клиенте по списку
};
