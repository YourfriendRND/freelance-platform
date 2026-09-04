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
import { CreateTaskRequest, TaskResponse, TaskState } from '@freelance-platform/shared-types';
import { combineLatest, Observable, of, tap } from 'rxjs';

const initialState: TaskState = {
  tasks: [],
  categories: [],
  selectedTask: null,
  isLoading: false,
  isSelectedLoading: false,
  isListLoaded: false,
  error: null,
  selectedError: null,
};

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ categories }) => ({
    categoryTitleById: computed(
      () => new Map(categories().map(({ id, title }) => [id, title])),
    ),
  })),
  withMethods(
    (
      store,
      taskApi = inject(TaskApi),
      taskCategoryApi = inject(TaskCategoryApi),
    ) => ({
      load(): void {
        if (store.isLoading() || store.isListLoaded()) {
          return;
        }

        patchState(store, { isLoading: true, error: null });

        combineLatest([taskApi.findAll(), taskCategoryApi.findAll()]).subscribe({
          next: ([tasks, categories]) => {
            patchState(store, {
              tasks,
              categories,
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
