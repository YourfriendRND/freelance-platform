import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TaskApi, TaskCategoryApi } from '@freelance-platform/client-api';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import {
  CreateTaskRequest,
  FindTasksQuery,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  TaskResponse,
  TaskState,
} from '@freelance-platform/shared-types';
import { combineLatest, Observable, of, tap } from 'rxjs';

const initialListQuery: FindTasksQuery = {
  page: PAGINATION_DEFAULT_PAGE,
  limit: PAGINATION_DEFAULT_LIMIT,
};

const initialState: TaskState = {
  tasks: [],
  categories: [],
  selectedTask: null,
  total: 0,
  listQuery: initialListQuery,
  isLoading: false,
  isSelectedLoading: false,
  isListLoaded: false,
  error: null,
  selectedError: null,
};

function normalizeListQuery(query: FindTasksQuery): FindTasksQuery {
  const nextQuery: FindTasksQuery = {
    page: query.page ?? PAGINATION_DEFAULT_PAGE,
    limit: query.limit ?? PAGINATION_DEFAULT_LIMIT,
  };

  if (query.categoryId !== undefined) {
    nextQuery.categoryId = query.categoryId;
  }

  if (query.status !== undefined) {
    nextQuery.status = query.status;
  }

  if (query.budgetMin !== undefined) {
    nextQuery.budgetMin = query.budgetMin;
  }

  if (query.budgetMax !== undefined) {
    nextQuery.budgetMax = query.budgetMax;
  }

  if (query.sort !== undefined) {
    nextQuery.sort = query.sort;
  }

  return nextQuery;
}

function isSameListQuery(left: FindTasksQuery, right: FindTasksQuery): boolean {
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

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ categories, listQuery }) => ({
    categoryTitleById: computed(
      () => new Map(categories().map(({ id, title }) => [id, title])),
    ),
    page: computed(() => listQuery().page ?? PAGINATION_DEFAULT_PAGE),
    limit: computed(() => listQuery().limit ?? PAGINATION_DEFAULT_LIMIT),
  })),
  withMethods(
    (
      store,
      taskApi = inject(TaskApi),
      taskCategoryApi = inject(TaskCategoryApi),
    ) => ({
      load(query?: FindTasksQuery): void {
        const nextQuery = normalizeListQuery(query ?? store.listQuery());

        if (
          store.isLoading() ||
          (store.isListLoaded() && isSameListQuery(nextQuery, store.listQuery()))
        ) {
          return;
        }

        patchState(store, { isLoading: true, error: null });

        const categoriesRequest =
          store.categories().length > 0
            ? of(store.categories())
            : taskCategoryApi.findAll();

        combineLatest([taskApi.findAll(nextQuery), categoriesRequest]).subscribe({
          next: ([{ items, total }, categories]) => {
            patchState(store, {
              tasks: items,
              categories,
              total,
              listQuery: nextQuery,
              error: null,
              isLoading: false,
              isListLoaded: true,
            });
          },
          error: (error: unknown) => {
            patchState(store, {
              isLoading: false,
              error: resolveHttpErrorMessage(
                error,
                'Не удалось загрузить задачи',
              ),
            });
          },
        });
      },
      loadById(id: string): void {
        if (store.isSelectedLoading()) {
          return;
        }

        patchState(store, {
          isSelectedLoading: true,
          selectedError: null,
          selectedTask: null,
        });

        const categoriesRequest =
          store.categories().length > 0
            ? of(store.categories())
            : taskCategoryApi.findAll();

        combineLatest([taskApi.findOne(id), categoriesRequest]).subscribe({
          next: ([task, categories]) => {
            patchState(store, {
              selectedTask: task,
              categories,
              selectedError: null,
              isSelectedLoading: false,
            });
          },
          error: (error: unknown) => {
            patchState(store, {
              isSelectedLoading: false,
              selectedTask: null,
              selectedError: resolveHttpErrorMessage(
                error,
                'Не удалось загрузить задачу',
              ),
            });
          },
        });
      },
      create(body: CreateTaskRequest): Observable<TaskResponse> {
        return taskApi.create(body).pipe(
          tap(() => {
            patchState(store, {
              isListLoaded: false,
              error: null,
            });
          }),
        );
      },
      clearSelected(): void {
        patchState(store, {
          selectedTask: null,
          isSelectedLoading: false,
          selectedError: null,
        });
      },
    }),
  ),
);
