import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthApi } from '@freelance-platform/client-api';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import {
  AuthState,
  LoginUserRequest,
  UserResponse,
} from '@freelance-platform/shared-types';
import { catchError, Observable, tap, throwError } from 'rxjs';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => user() !== null),
  })),
  withMethods((store, authApi = inject(AuthApi)) => ({
    setUser(user: UserResponse): void {
      patchState(store, { user, error: null, isLoading: false });
    },
    clear(): void {
      patchState(store, initialState);
    },
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },
    setError(error: string | null): void {
      patchState(store, { error, isLoading: false });
    },
    login(body: LoginUserRequest): Observable<UserResponse> {
      patchState(store, { isLoading: true, error: null });

      return authApi.login(body).pipe(
        tap((user) => {
          patchState(store, { user, error: null, isLoading: false });
        }),
        catchError((error: unknown) => {
          patchState(store, {
            error: resolveHttpErrorMessage(error, 'Не удалось войти'),
            isLoading: false,
          });
          return throwError(() => error);
        }),
      );
    },
    logout(): void {
      patchState(store, { isLoading: true, error: null });

      authApi.logout().subscribe({
        next: () => {
          patchState(store, initialState);
        },
        error: () => {
          patchState(store, initialState);
        },
      });
    },
    bootstrap(): void {
      if (store.user()) {
        return;
      }

      patchState(store, { isLoading: true, error: null });

      authApi.me().subscribe({
        next: (user) => {
          patchState(store, { user, error: null, isLoading: false });
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            patchState(store, initialState);
            return;
          }

          patchState(store, {
            isLoading: false,
            error: resolveHttpErrorMessage(
              error,
              'Не удалось загрузить профиль',
            ),
          });
        },
      });
    },
  })),
);
