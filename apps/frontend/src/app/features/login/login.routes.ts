import { Route } from '@angular/router';
import { guestGuard } from '../../auth/guest.guard';

export const loginRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./login-page/login-page.component').then(
        (module) => module.LoginPageComponent,
      ),
  },
];
