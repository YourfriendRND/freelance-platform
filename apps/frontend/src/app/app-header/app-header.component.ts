import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { USER_ROLE_LABEL } from '@freelance-platform/shared-types';
import { UiHeaderComponent, UiHeaderMode } from '@freelance-platform/ui';

@Component({
  selector: 'app-header',
  imports: [UiHeaderComponent],
  templateUrl: './app-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent {
  readonly showBrand = input(true);
  readonly embedded = input(false);
  readonly pageTitle = input('');
  readonly homeHref = input('/welcome');
  readonly browseTasksHref = input('/tasks');
  readonly loginHref = input('/login');
  readonly getStartedHref = input('/register');

  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly headerMode = computed(() =>
    this.authStore.isAuthenticated()
      ? UiHeaderMode.Authenticated
      : UiHeaderMode.Guest,
  );

  protected readonly userName = computed(() => {
    const user = this.authStore.user();

    if (!user) {
      return '';
    }

    const { firstName, lastName } = user;

    return [firstName, lastName].filter(Boolean).join(' ');
  });

  protected readonly userRoleLabel = computed(() => {
    const user = this.authStore.user();

    if (!user) {
      return '';
    }

    return USER_ROLE_LABEL[user.role];
  });

  protected onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/welcome']);
  }
}
