import { PublicTaskStatus } from './task-status';
import { TaskSort } from './task-sort';

export type FindTasksQuery = {
  categoryId?: string;
  status?: PublicTaskStatus;
  budgetMin?: number;
  budgetMax?: number;
  sort?: TaskSort;
  page?: number;
  limit?: number;
};
