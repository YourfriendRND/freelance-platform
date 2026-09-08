import { Route } from '@angular/router';
import { sessionGuard } from '../../auth/session.guard';

export const profileRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./profile-page/profile-page.component').then(
        (module) => module.ProfilePageComponent,
      ),
  },
];
