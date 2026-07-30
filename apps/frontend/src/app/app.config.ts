import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import {
  AUTH_SESSION_INVALIDATOR,
  provideApiHttp,
} from '@freelance-platform/http';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideApiHttp(),
    {
      provide: AUTH_SESSION_INVALIDATOR,
      useFactory: () => {
        const authStore = inject(AuthStore);
        return () => authStore.clear();
      },
    },
  ],
};
