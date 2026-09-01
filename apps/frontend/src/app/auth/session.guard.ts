import { inject } from '@angular/core';
import { RedirectFunction } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';

export const homeRedirect: RedirectFunction = () => {
  const authStore = inject(AuthStore);

  return authStore.isAuthenticated() ? '/tasks' : '/welcome';
};
