import {
  FindTasksQuery,
  TaskCategoryResponse,
  TaskResponse,
  TaskSort,
  TaskViewData,
} from '@freelance-platform/shared-types';
import { TasksFiltersSelection } from '../tasks/tasks-filters/tasks-filters.model';

export type MyTaskListItem = TaskViewData & {
  categoryId: string;
};

const UNKNOWN_CATEGORY_TITLE = 'Без категории';

export function toMyTaskListItem(
  task: TaskResponse,
  categoryTitleById: ReadonlyMap<string, string>,
): MyTaskListItem {
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
    categoryId: task.categoryId,
    categoryTitle: categoryTitleById.get(task.categoryId) ?? UNKNOWN_CATEGORY_TITLE,
    // TODO: подставить applicationsCount, viewsCount и author, когда бэкенд начнёт их отдавать
    applicationsCount: 0,
    viewsCount: 0,
    author: null,
  };
}

export function filterMyTasks(
  tasks: readonly MyTaskListItem[],
  filters: TasksFiltersSelection,
): MyTaskListItem[] {
  const search = filters.search?.trim().toLowerCase() ?? '';

  const matched = tasks.filter((task) => {
    const matchesSearch =
      !search ||
      task.title.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search);
    const matchesCategory = !filters.categoryId || task.categoryId === filters.categoryId;
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesBudgetMin =
      filters.budgetMin === undefined || task.budgetMin >= filters.budgetMin;
    const matchesBudgetMax =
      filters.budgetMax === undefined || task.budgetMax <= filters.budgetMax;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesBudgetMin &&
      matchesBudgetMax
    );
  });

  return matched.sort((left, right) => compareMyTasks(left, right, filters.sort));
}

function compareMyTasks(left: MyTaskListItem, right: MyTaskListItem, sort: TaskSort): number {
  switch (sort) {
    case TaskSort.Oldest:
      return left.createdAt.localeCompare(right.createdAt);
    case TaskSort.BudgetDesc:
      return right.budgetMax - left.budgetMax;
    case TaskSort.BudgetAsc:
      return left.budgetMin - right.budgetMin;
    default:
      return right.createdAt.localeCompare(left.createdAt);
  }
}

export function categoryTitleById(
  categories: readonly TaskCategoryResponse[],
): ReadonlyMap<string, string> {
  return new Map(categories.map(({ id, title }) => [id, title]));
}

export function hasAppliedFilters(filters: TasksFiltersSelection): boolean {
  return (
    filters.search !== undefined ||
    filters.categoryId !== undefined ||
    filters.status !== undefined ||
    filters.budgetMin !== undefined ||
    filters.budgetMax !== undefined
  );
}

export function isSameTasksQuery(left: FindTasksQuery, right: FindTasksQuery): boolean {
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
