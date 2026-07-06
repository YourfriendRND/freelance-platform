import { Route } from '@angular/router';

export const registerRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./register-page/register-page.component').then(
        (module) => module.RegisterPageComponent,
      ),
  },
];
