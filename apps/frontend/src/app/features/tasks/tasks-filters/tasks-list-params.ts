import { ParamMap } from '@angular/router';
import { PAGINATION_DEFAULT_PAGE, TaskSort, TaskStatus } from '@freelance-platform/shared-types';
import { TasksFiltersSelection } from './tasks-filters.model';

export enum TasksListParamsMode {
  Public = 'public',
  Mine = 'mine',
}

export type TasksListParamsModeValue = `${TasksListParamsMode}`;

export enum TasksListQueryParam {
  Search = 'search',
  CategoryId = 'categoryId',
  Status = 'status',
  BudgetMin = 'budgetMin',
  BudgetMax = 'budgetMax',
  Sort = 'sort',
  Page = 'page',
}

export type TasksListQueryParamName = `${TasksListQueryParam}`;

export type TasksListParams = {
  selection: TasksFiltersSelection;
  page: number;
};

export type TasksListQueryParams = Partial<Record<TasksListQueryParamName, string>>;

const TASK_STATUSES = new Set<string>(Object.values(TaskStatus));
const TASK_SORTS = new Set<string>(Object.values(TaskSort));
const TASKS_LIST_QUERY_PARAMS = new Set<string>(Object.values(TasksListQueryParam));

/** Разбирает query в фильтры и страницу. Пустые и невалидные значения отбрасывает. */
export function parseTasksListParams(
  paramMap: ParamMap,
  mode: TasksListParamsModeValue,
): TasksListParams {
  const selection: TasksFiltersSelection = {
    sort: parseSort(paramMap.get(TasksListQueryParam.Sort)),
  };
  const search = paramMap.get(TasksListQueryParam.Search)?.trim();
  const categoryId = paramMap.get(TasksListQueryParam.CategoryId)?.trim();
  const status = parseStatus(paramMap.get(TasksListQueryParam.Status), mode);
  const budgetMin = parseBudget(paramMap.get(TasksListQueryParam.BudgetMin));
  const budgetMax = parseBudget(paramMap.get(TasksListQueryParam.BudgetMax));

  if (search) {
    selection.search = search;
  }

  if (categoryId) {
    selection.categoryId = categoryId;
  }

  if (status) {
    selection.status = status;
  }

  if (budgetMin !== undefined) {
    selection.budgetMin = budgetMin;
  }

  if (budgetMax !== undefined) {
    selection.budgetMax = budgetMax;
  }

  return {
    selection,
    page: parsePage(paramMap.get(TasksListQueryParam.Page)),
  };
}

/** Собирает канонический query. Значения по умолчанию в адрес не попадают. */
export function toTasksListQueryParams(params: TasksListParams): TasksListQueryParams {
  const query: TasksListQueryParams = {};
  const { selection, page } = params;

  if (selection.search) {
    query[TasksListQueryParam.Search] = selection.search;
  }

  if (selection.categoryId) {
    query[TasksListQueryParam.CategoryId] = selection.categoryId;
  }

  if (selection.status) {
    query[TasksListQueryParam.Status] = selection.status;
  }

  if (selection.budgetMin !== undefined) {
    query[TasksListQueryParam.BudgetMin] = String(selection.budgetMin);
  }

  if (selection.budgetMax !== undefined) {
    query[TasksListQueryParam.BudgetMax] = String(selection.budgetMax);
  }

  if (selection.sort !== TaskSort.Newest) {
    query[TasksListQueryParam.Sort] = selection.sort;
  }

  if (page !== PAGINATION_DEFAULT_PAGE) {
    query[TasksListQueryParam.Page] = String(page);
  }

  return query;
}

/** Проверяет, что текущий query уже совпадает с каноническим и replaceUrl не нужен. */
export function isCanonicalTasksListQuery(
  paramMap: ParamMap,
  mode: TasksListParamsModeValue,
): boolean {
  const canonical = toTasksListQueryParams(parseTasksListParams(paramMap, mode));
  const currentKeys = paramMap.keys;

  if (currentKeys.length !== Object.keys(canonical).length) {
    return false;
  }

  return currentKeys.every(
    (key) => isTasksListQueryParam(key) && paramMap.get(key) === canonical[key],
  );
}

/** Отличает известный параметр списка от постороннего ключа в адресе. */
function isTasksListQueryParam(key: string): key is TasksListQueryParamName {
  return TASKS_LIST_QUERY_PARAMS.has(key);
}

/** Оставляет известную сортировку, иначе возвращает «сначала новые». */
function parseSort(value: string | null): TaskSort {
  if (value && TASK_SORTS.has(value)) {
    return value as TaskSort;
  }

  return TaskSort.Newest;
}

/** Оставляет известный статус. Черновик доступен только в «Моих задачах». */
function parseStatus(
  value: string | null,
  mode: TasksListParamsModeValue,
): TaskStatus | undefined {
  if (!value || !TASK_STATUSES.has(value)) {
    return;
  }

  if (mode === TasksListParamsMode.Public && value === TaskStatus.Draft) {
    return;
  }

  return value as TaskStatus;
}

/** Оставляет бюджет от 1. Дробную часть отбрасывает, мусор не возвращает. */
function parseBudget(value: string | null): number | undefined {
  if (!value || !/^\d+(\.\d+)?$/.test(value.trim())) {
    return;
  }

  const parsed = Math.trunc(Number(value));

  if (!Number.isFinite(parsed) || parsed < 1) {
    return;
  }

  return parsed;
}

/** Оставляет целую страницу от 1, иначе возвращает первую. */
function parsePage(value: string | null): number {
  if (!value || !/^\d+$/.test(value.trim())) {
    return PAGINATION_DEFAULT_PAGE;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return PAGINATION_DEFAULT_PAGE;
  }

  return parsed;
}
