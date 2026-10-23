import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { UiButtonComponent } from '@freelance-platform/ui';
import { welcomeHeroActions } from './welcome-hero.model';

@Component({
  selector: 'app-welcome-hero',
  imports: [UiButtonComponent],
  templateUrl: './welcome-hero.component.html',
  styleUrl: './welcome-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeHeroComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly sessionReady = computed(() => this.authStore.isSessionResolved());

  protected readonly actions = computed(() =>
    welcomeHeroActions(this.authStore.user()?.role ?? null),
  );

  constructor() {
    this.authStore.ensureSession().pipe(takeUntilDestroyed()).subscribe();
  }

  protected onAction(route: string): void {
    this.router.navigateByUrl(route);
  }
}
