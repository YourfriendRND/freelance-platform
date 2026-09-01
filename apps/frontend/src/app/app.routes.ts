import { Route } from '@angular/router';
import { homeRedirect } from './auth/session.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: homeRedirect,
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./features/welcome/welcome.routes').then(
        (module) => module.welcomeRoutes,
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/login/login.routes').then((module) => module.loginRoutes),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./features/register/register.routes').then(
        (module) => module.registerRoutes,
      ),
  },
  {
    path: 'tasks',
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then((module) => module.tasksRoutes),
  },
];
