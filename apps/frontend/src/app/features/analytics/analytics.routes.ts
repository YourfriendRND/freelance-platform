import { Route } from '@angular/router';
import { sessionGuard } from '../../auth/session.guard';

export const analyticsRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./analytics-page/analytics-page.component').then(
        (module) => module.AnalyticsPageComponent,
      ),
  },
];
