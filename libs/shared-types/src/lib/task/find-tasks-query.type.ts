import { PublicTaskStatus } from './task-status';
import { TaskSort } from './task-sort';

export type FindTasksQuery = {
  // TODO: бэкенд должен добавить запрос списка задач пользователя. Сейчас невозможно получить задачи в раздел «Мои задачи»: публичный список не фильтрует по заказчику и не отдаёт черновики
  categoryId?: string;
  status?: PublicTaskStatus;
  budgetMin?: number;
  budgetMax?: number;
  sort?: TaskSort;
  page?: number;
  limit?: number;
};
