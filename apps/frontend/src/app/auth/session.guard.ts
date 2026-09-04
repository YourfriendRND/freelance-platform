import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';

export const sessionResolveGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);

  return authStore.ensureSession().pipe(map(() => true));
};

export const sessionGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.ensureSession().pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      }

      // TODO: Перенаправить на NotFoundPage когда будет
      return new RedirectCommand(router.createUrlTree(['/welcome']), {
        replaceUrl: true,
      });
    }),
  );
};
