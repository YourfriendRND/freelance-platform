import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from '@freelance-platform/client-state';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.ensureSession().pipe(
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        return true;
      }

      return new RedirectCommand(router.createUrlTree(['/tasks']), {
        replaceUrl: true,
      });
    }),
  );
};
