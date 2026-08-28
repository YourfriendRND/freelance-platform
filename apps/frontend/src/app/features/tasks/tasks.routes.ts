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
];
