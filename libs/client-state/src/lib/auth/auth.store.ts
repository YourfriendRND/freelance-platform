import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  AuthState,
  LoginUserRequest,
  UserResponse,
} from '@freelance-platform/shared-types';

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
  withMethods((store) => ({
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
    // API wiring — следующая задача интеграции
    login(_body: LoginUserRequest): void {
      patchState(store, { isLoading: true, error: null });
    },
    logout(): void {
      patchState(store, initialState);
    },
    bootstrap(): void {
      patchState(store, { isLoading: true, error: null });
    },
  })),
);
