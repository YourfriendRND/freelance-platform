import { Route } from '@angular/router';
import { sessionGuard } from '../../auth/session.guard';

export const applicationsRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./applications-page/applications-page.component').then(
        (module) => module.ApplicationsPageComponent,
      ),
  },
  {
    path: ':id',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./application-details-page/application-details-page.component').then(
        (module) => module.ApplicationDetailsPageComponent,
      ),
  },
];
