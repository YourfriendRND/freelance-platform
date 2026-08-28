import { TaskCategoryResponse, TaskResponse } from './task-client.type';

export type TaskState = {
  tasks: TaskResponse[];
  categories: TaskCategoryResponse[];
  isLoading: boolean;
  error: string | null;
};
