import { Route } from '@angular/router';

export const welcomeRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./welcome-page/welcome-page.component').then(
        (module) => module.WelcomePageComponent,
      ),
  },
];
