import {
  FindMyTasksQuery,
  TaskCategoryResponse,
  TaskResponse,
  TaskViewData,
} from '@freelance-platform/shared-types';
import { TasksFiltersSelection } from '../tasks/tasks-filters/tasks-filters.model';

const UNKNOWN_CATEGORY_TITLE = 'Без категории';

export function toMyTaskListItem(
  task: TaskResponse,
  categoryTitleById: ReadonlyMap<string, string>,
): TaskViewData {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    budgetMin: task.budgetMin,
    budgetMax: task.budgetMax,
    executionType: task.executionType,
    deadline: task.deadline,
    createdAt: task.createdAt,
    categoryTitle: categoryTitleById.get(task.categoryId) ?? UNKNOWN_CATEGORY_TITLE,
    applicationsCount: task.applicationsCount,
    viewsCount: task.viewsCount,
    author: task.author,
  };
}

export function categoryTitleById(
  categories: readonly TaskCategoryResponse[],
): ReadonlyMap<string, string> {
  return new Map(categories.map(({ id, title }) => [id, title]));
}

export function hasAppliedFilters(filters: TasksFiltersSelection): boolean {
  return (
    filters.categoryId !== undefined ||
    filters.status !== undefined ||
    filters.budgetMin !== undefined ||
    filters.budgetMax !== undefined
  );
}

export function isSameTasksQuery(left: FindMyTasksQuery, right: FindMyTasksQuery): boolean {
  return (
    left.page === right.page &&
    left.limit === right.limit &&
    left.categoryId === right.categoryId &&
    left.status === right.status &&
    left.budgetMin === right.budgetMin &&
    left.budgetMax === right.budgetMax &&
    left.sort === right.sort
  );
}
