import { Route } from '@angular/router';

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
    path: ':id',
    loadComponent: () =>
      import('./task-details-page/task-details-page.component').then(
        (module) => module.TaskDetailsPageComponent,
      ),
  },
];
