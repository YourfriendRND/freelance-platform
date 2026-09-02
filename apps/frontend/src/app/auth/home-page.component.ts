import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';

@Component({
  selector: 'app-home-page',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  constructor() {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    authStore.ensureSession().subscribe((isAuthenticated) => {
      router.navigate([isAuthenticated ? '/tasks' : '/welcome'], {
        replaceUrl: true,
      });
    });
  }
}
