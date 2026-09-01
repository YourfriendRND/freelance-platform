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
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isSessionResolved: false,
};

const resolvedGuestState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isSessionResolved: true,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => user() !== null),
  })),
  withMethods((store, authApi = inject(AuthApi)) => {
    let sessionRequest: Observable<boolean> | null = null;

    const ensureSession = (): Observable<boolean> => {
      if (store.user()) {
        return of(true);
      }

      if (store.isSessionResolved()) {
        return of(false);
      }

      if (sessionRequest) {
        return sessionRequest;
      }

      patchState(store, { isLoading: true, error: null });

      sessionRequest = authApi.me().pipe(
        tap((user) => {
          patchState(store, {
            user,
            error: null,
            isLoading: false,
            isSessionResolved: true,
          });
        }),
        map(() => true),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            patchState(store, resolvedGuestState);
            return of(false);
          }

          patchState(store, {
            isLoading: false,
            error: resolveHttpErrorMessage(
              error,
              'Не удалось загрузить профиль',
            ),
          });
          return of(false);
        }),
        finalize(() => {
          sessionRequest = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

      return sessionRequest;
    };

    return {
      setUser(user: UserResponse): void {
        patchState(store, {
          user,
          error: null,
          isLoading: false,
          isSessionResolved: true,
        });
      },
      clear(): void {
        patchState(store, resolvedGuestState);
      },
      setLoading(isLoading: boolean): void {
        patchState(store, { isLoading });
      },
      setError(error: string | null): void {
        patchState(store, { error, isLoading: false });
      },
      ensureSession,
      login(body: LoginUserRequest): Observable<UserResponse> {
        patchState(store, { isLoading: true, error: null });

        return authApi.login(body).pipe(
          tap((user) => {
            patchState(store, {
              user,
              error: null,
              isLoading: false,
              isSessionResolved: true,
            });
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
        patchState(store, { ...resolvedGuestState, isLoading: true });

        authApi.logout().subscribe({
          next: () => {
            patchState(store, resolvedGuestState);
          },
          error: () => {
            patchState(store, resolvedGuestState);
          },
        });
      },
      bootstrap(): void {
        ensureSession().subscribe();
      },
    };
  }),
);
