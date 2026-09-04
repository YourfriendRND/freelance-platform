import { Route } from '@angular/router';
import { sessionResolveGuard } from '../../auth/session.guard';

export const welcomeRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [sessionResolveGuard],
    loadComponent: () =>
      import('./welcome-page/welcome-page.component').then(
        (module) => module.WelcomePageComponent,
      ),
  },
];
