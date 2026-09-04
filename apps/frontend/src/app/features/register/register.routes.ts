import { Route } from '@angular/router';
import { sessionResolveGuard } from '../../auth/session.guard';

export const registerRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [sessionResolveGuard],
    loadComponent: () =>
      import('./register-page/register-page.component').then(
        (module) => module.RegisterPageComponent,
      ),
  },
];
