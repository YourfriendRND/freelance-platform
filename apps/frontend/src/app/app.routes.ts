import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./features/register/register.routes').then(
        (module) => module.registerRoutes,
      ),
  },
];
