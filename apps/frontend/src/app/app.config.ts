import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import {
  AUTH_SESSION_INVALIDATOR,
  provideApiHttp,
} from '@freelance-platform/http';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideApiHttp(),
    provideAppInitializer(() => inject(AuthStore).ensureSession()),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    {
      provide: AUTH_SESSION_INVALIDATOR,
      useFactory: () => {
        const authStore = inject(AuthStore);
        return () => authStore.clear();
      },
    },
  ],
};
