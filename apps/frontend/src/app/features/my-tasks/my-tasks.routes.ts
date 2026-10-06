import { Route } from '@angular/router';
import { sessionGuard } from '../../auth/session.guard';

export const myTasksRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./my-tasks-page/my-tasks-page.component').then(
        (module) => module.MyTasksPageComponent,
      ),
  },
];
