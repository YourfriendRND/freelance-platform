import { TaskCategoryResponse, TaskResponse } from './task-client.type';

export type TaskState = {
  tasks: TaskResponse[];
  categories: TaskCategoryResponse[];
  selectedTask: TaskResponse | null;
  isLoading: boolean;
  isSelectedLoading: boolean;
  isListLoaded: boolean;
  error: string | null;
  selectedError: string | null;
};
