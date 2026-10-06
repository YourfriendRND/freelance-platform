import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TaskApplicationApi } from '@freelance-platform/client-api';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import {
  CreateTaskApplicationRequest,
  TaskApplicationResponse,
  TaskApplicationState,
} from '@freelance-platform/shared-types';
import { catchError, EMPTY, Observable, tap, throwError } from 'rxjs';

const initialState: TaskApplicationState = {
  applications: [],
  duplicateTaskIds: [],
  selectedApplication: null,
  isLoading: false,
  isLoaded: false,
  isSelectedLoading: false,
  isSubmitting: false,
  error: null,
  selectedError: null,
  submitError: null,
};

export const TaskApplicationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, taskApplicationApi = inject(TaskApplicationApi)) => {
    let selectedRequest = 0;

    return {
    load(): void {
      if (store.isLoading() || store.isLoaded()) {
        return;
      }

      patchState(store, { isLoading: true, error: null });

      taskApplicationApi.findAll().subscribe({
        next: ({ items }) => {
          patchState(store, {
            applications: items,
            isLoading: false,
            isLoaded: true,
            error: null,
          });
        },
        error: (error: unknown) => {
          patchState(store, {
            isLoading: false,
            error: resolveHttpErrorMessage(error, 'Не удалось загрузить отклики'),
          });
        },
      });
    },
    create(body: CreateTaskApplicationRequest): Observable<TaskApplicationResponse> {
      if (store.isSubmitting()) {
        return EMPTY;
      }

      patchState(store, { isSubmitting: true, submitError: null });

      return taskApplicationApi.create(body).pipe(
        tap((application) => {
          const applications = store
            .applications()
            .filter((item) => item.id !== application.id);

          patchState(store, {
            applications: [...applications, application],
            isSubmitting: false,
            isLoaded: true,
            submitError: null,
          });
        }),
        catchError((error: unknown) => {
          const duplicateTaskIds = [...store.duplicateTaskIds()];

          if (
            error instanceof HttpErrorResponse &&
            error.status === 409 &&
            !duplicateTaskIds.includes(body.taskId)
          ) {
            duplicateTaskIds.push(body.taskId);
          }

          patchState(store, {
            isSubmitting: false,
            duplicateTaskIds,
            submitError: resolveHttpErrorMessage(
              error,
              'Не удалось отправить отклик',
            ),
          });

          return throwError(() => error);
        }),
      );
    },
    loadById(id: string): void {
      const selectedApplication = store.selectedApplication();

      if (
        selectedApplication?.id === id &&
        !store.isSelectedLoading() &&
        !store.selectedError()
      ) {
        return;
      }

      const request = ++selectedRequest;

      patchState(store, {
        isSelectedLoading: true,
        selectedError: null,
        selectedApplication: null,
      });

      taskApplicationApi.findOne(id).subscribe({
        next: (application) => {
          if (request !== selectedRequest) {
            return;
          }

          patchState(store, {
            selectedApplication: application,
            isSelectedLoading: false,
            selectedError: null,
          });
        },
        error: (error: unknown) => {
          if (request !== selectedRequest) {
            return;
          }

          patchState(store, {
            isSelectedLoading: false,
            selectedApplication: null,
            selectedError: resolveHttpErrorMessage(
              error,
              'Не удалось загрузить отклик',
            ),
          });
        },
      });
    },
    clearSelected(): void {
      selectedRequest += 1;

      patchState(store, {
        selectedApplication: null,
        isSelectedLoading: false,
        selectedError: null,
      });
    },
    hasApplied(taskId: string): boolean {
      return (
        store.applications().some((item) => item.taskId === taskId) ||
        store.duplicateTaskIds().includes(taskId)
      );
    },
    clearSubmitError(): void {
      patchState(store, { submitError: null });
    },
    };
  }),
);
