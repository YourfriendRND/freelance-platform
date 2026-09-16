import { inject, Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionNavigationService {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
      )
      .subscribe(() => {
        this.authStore.ensureSession().subscribe();
      });
  }
}