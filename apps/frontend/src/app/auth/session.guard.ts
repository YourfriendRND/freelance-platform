import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { map } from 'rxjs';

export const homeGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.ensureSession().pipe(
    map((isAuthenticated) =>
      router.createUrlTree([isAuthenticated ? '/tasks' : '/welcome']),
    ),
  );
};
