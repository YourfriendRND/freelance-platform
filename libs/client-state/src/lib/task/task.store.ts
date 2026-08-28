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
import { TaskState } from '@freelance-platform/shared-types';
import { combineLatest } from 'rxjs';

const initialState: TaskState = {
  tasks: [],
  categories: [],
  isLoading: false,
  error: null,
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
        if (store.isLoading()) {
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
    }),
  ),
);
