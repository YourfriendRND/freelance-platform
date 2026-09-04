import { Route } from '@angular/router';
import { sessionResolveGuard } from '../../auth/session.guard';

export const loginRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [sessionResolveGuard],
    loadComponent: () =>
      import('./login-page/login-page.component').then(
        (module) => module.LoginPageComponent,
      ),
  },
];
