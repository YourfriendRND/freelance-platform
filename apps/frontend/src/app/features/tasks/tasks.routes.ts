import { Route } from '@angular/router';
import { sessionGuard } from '../../auth/session.guard';

export const tasksRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./tasks-page/tasks-page.component').then(
        (module) => module.TasksPageComponent,
      ),
  },
  {
    path: 'create',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./task-create-page/task-create-page.component').then(
        (module) => module.TaskCreatePageComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./task-details-page/task-details-page.component').then(
        (module) => module.TaskDetailsPageComponent,
      ),
  },
];
