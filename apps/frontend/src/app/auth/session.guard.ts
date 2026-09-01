import { inject } from '@angular/core';
import { RedirectFunction } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { map } from 'rxjs';

export const homeRedirect: RedirectFunction = () => {
  const authStore = inject(AuthStore);

  return authStore.ensureSession().pipe(
    map((isAuthenticated) => (isAuthenticated ? '/tasks' : '/welcome')),
  );
};
