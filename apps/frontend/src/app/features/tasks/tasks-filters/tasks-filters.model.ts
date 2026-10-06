import { FindTasksQuery, PublicTaskStatus, TASK_STATUS_LABEL, TaskSort, TaskStatus } from '@freelance-platform/shared-types';
import { UiSelectOption } from '@freelance-platform/ui';

export const TASKS_ALL_FILTER_VALUE = 'all';

export type TasksFilterStatus = PublicTaskStatus | TaskStatus.Draft | typeof TASKS_ALL_FILTER_VALUE;

export type TasksFiltersFormValue = {
  search: string;
  category: string;
  status: TasksFilterStatus;
  budgetMin: string | number | null;
  budgetMax: string | number | null;
  sort: TaskSort;
};

export type TasksFiltersSelection = {
  search?: string;
  categoryId?: string;
  status?: TaskStatus;
  budgetMin?: number;
  budgetMax?: number;
  sort: TaskSort;
};

export const TASKS_ALL_CATEGORIES_OPTION: UiSelectOption = {
  value: TASKS_ALL_FILTER_VALUE,
  label: 'Все категории',
};

export const TASKS_STATUS_OPTIONS: readonly UiSelectOption<TasksFilterStatus>[] = [
  { value: TASKS_ALL_FILTER_VALUE, label: 'Все статусы' },
  { value: TaskStatus.Open, label: TASK_STATUS_LABEL[TaskStatus.Open] },
  { value: TaskStatus.Closed, label: TASK_STATUS_LABEL[TaskStatus.Closed] },
];

export const TASKS_SORT_OPTIONS: readonly UiSelectOption<TaskSort>[] = [
  { value: TaskSort.Newest, label: 'Сначала новые' },
  { value: TaskSort.Oldest, label: 'Сначала старые' },
  { value: TaskSort.BudgetDesc, label: 'Бюджет: по убыванию' },
  { value: TaskSort.BudgetAsc, label: 'Бюджет: по возрастанию' },
];

export function toTasksFiltersSelection(value: TasksFiltersFormValue): TasksFiltersSelection {
  const selection: TasksFiltersSelection = {
    sort: value.sort,
  };
  const search = value.search.trim();
  const budgetMin = parseBudget(value.budgetMin);
  const budgetMax = parseBudget(value.budgetMax);

  if (search) {
    selection.search = search;
  }

  if (value.category !== TASKS_ALL_FILTER_VALUE) {
    selection.categoryId = value.category;
  }

  if (value.status !== TASKS_ALL_FILTER_VALUE) {
    selection.status = value.status;
  }

  if (budgetMin !== undefined) {
    selection.budgetMin = budgetMin;
  }

  if (budgetMax !== undefined) {
    selection.budgetMax = budgetMax;
  }

  return selection;
}

export function toFindTasksQuery(value: TasksFiltersFormValue): FindTasksQuery {
  return toPublicTasksQuery(toTasksFiltersSelection(value));
}

export function toPublicTasksQuery(selection: TasksFiltersSelection): FindTasksQuery {
  const query: FindTasksQuery = {
    sort: selection.sort,
  };

  if (selection.categoryId) {
    query.categoryId = selection.categoryId;
  }

  if (selection.status && selection.status !== TaskStatus.Draft) {
    query.status = selection.status;
  }

  if (selection.budgetMin !== undefined) {
    query.budgetMin = selection.budgetMin;
  }

  if (selection.budgetMax !== undefined) {
    query.budgetMax = selection.budgetMax;
  }

  return query;
}

export function isSameTasksFiltersSelection(
  left: TasksFiltersSelection,
  right: TasksFiltersSelection,
): boolean {
  return (
    left.search === right.search &&
    left.categoryId === right.categoryId &&
    left.status === right.status &&
    left.budgetMin === right.budgetMin &&
    left.budgetMax === right.budgetMax &&
    left.sort === right.sort
  );
}

function parseBudget(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') {
    return;
  }

  const parsed = typeof value === 'number' ? value : Number(String(value).trim());

  if (!Number.isFinite(parsed) || parsed < 1) {
    return;
  }

  return Math.trunc(parsed);
}
