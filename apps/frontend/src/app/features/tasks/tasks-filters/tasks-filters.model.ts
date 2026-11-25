import {
  FindMyTasksQuery,
  FindTasksQuery,
  PublicTaskStatus,
  TASK_STATUS_LABEL,
  TaskSort,
  TaskStatus,
} from '@freelance-platform/shared-types';
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

export type TasksFiltersPatchValue = {
  search: string;
  category: string;
  status: TasksFilterStatus;
  budgetMin: number | null;
  budgetMax: number | null;
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

/** Собирает набор фильтров из значений формы. Пустой поиск и пункт «все» отбрасывает. */
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

/** Собирает публичный запрос списка из значений формы. Поиск и черновик не включает. */
export function toFindTasksQuery(value: TasksFiltersFormValue): FindTasksQuery {
  return toPublicTasksQuery(toTasksFiltersSelection(value));
}

/** Собирает запрос «Моих задач». Поиск не включает, черновик сохраняет. */
export function toMyTasksQuery(selection: TasksFiltersSelection): FindMyTasksQuery {
  const query: FindMyTasksQuery = {
    sort: selection.sort,
  };

  if (selection.categoryId) {
    query.categoryId = selection.categoryId;
  }

  if (selection.status) {
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

/** Собирает публичный запрос списка из набора фильтров. Поиск и черновик не включает. */
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

/** Возвращает значения формы для восстановления из набора фильтров. */
export function toTasksFiltersFormValue(selection: TasksFiltersSelection): TasksFiltersPatchValue {
  return {
    search: selection.search ?? '',
    category: selection.categoryId ?? TASKS_ALL_FILTER_VALUE,
    status: selection.status ?? TASKS_ALL_FILTER_VALUE,
    budgetMin: selection.budgetMin ?? null,
    budgetMax: selection.budgetMax ?? null,
    sort: selection.sort,
  };
}

/** Сравнивает два набора фильтров, включая поиск. */
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

/** Оставляет бюджет от 1. Дробную часть отбрасывает, мусор не возвращает. */
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
