import { FindTasksQuery, PublicTaskStatus, TASK_STATUS_LABEL, TaskSort, TaskStatus } from '@freelance-platform/shared-types';
import { UiSelectOption } from '@freelance-platform/ui';

export const TASKS_ALL_FILTER_VALUE = 'all';

export type TasksFiltersFormValue = {
  search: string;
  category: string;
  status: PublicTaskStatus | typeof TASKS_ALL_FILTER_VALUE;
  budgetMin: string | number | null;
  budgetMax: string | number | null;
  sort: TaskSort;
};

export const TASKS_ALL_CATEGORIES_OPTION: UiSelectOption = {
  value: TASKS_ALL_FILTER_VALUE,
  label: 'Все категории',
};

export const TASKS_STATUS_OPTIONS: readonly UiSelectOption<
  PublicTaskStatus | typeof TASKS_ALL_FILTER_VALUE
>[] = [
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

export function toFindTasksQuery(value: TasksFiltersFormValue): FindTasksQuery {
  const query: FindTasksQuery = {
    sort: value.sort,
  };
  const budgetMin = parseBudget(value.budgetMin);
  const budgetMax = parseBudget(value.budgetMax);

  if (value.category !== TASKS_ALL_FILTER_VALUE) {
    query.categoryId = value.category;
  }

  if (value.status !== TASKS_ALL_FILTER_VALUE) {
    query.status = value.status;
  }

  if (budgetMin !== undefined) {
    query.budgetMin = budgetMin;
  }

  if (budgetMax !== undefined) {
    query.budgetMax = budgetMax;
  }

  return query;
}

export function isSameTasksFilterQuery(
  left: FindTasksQuery,
  right: FindTasksQuery,
): boolean {
  return (
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
