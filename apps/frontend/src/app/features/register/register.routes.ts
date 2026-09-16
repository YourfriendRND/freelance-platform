import { Route } from '@angular/router';
import { guestGuard } from '../../auth/guest.guard';

export const registerRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./register-page/register-page.component').then(
        (module) => module.RegisterPageComponent,
      ),
  },
];
