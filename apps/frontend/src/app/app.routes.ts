import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
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
];
