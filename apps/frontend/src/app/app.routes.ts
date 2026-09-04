import { Route } from '@angular/router';
import { HomePageComponent } from './auth/home-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePageComponent,
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
    path: 'analytics',
    loadChildren: () =>
      import('./features/analytics/analytics.routes').then(
        (module) => module.analyticsRoutes,
      ),
  },
  {
    path: 'tasks',
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then((module) => module.tasksRoutes),
  },
];
