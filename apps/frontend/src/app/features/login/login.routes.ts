import { Route } from '@angular/router';

export const loginRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./login-page/login-page.component').then(
        (module) => module.LoginPageComponent,
      ),
  },
];
