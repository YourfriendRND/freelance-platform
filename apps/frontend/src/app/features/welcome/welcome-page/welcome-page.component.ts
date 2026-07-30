import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { AuthStore } from '@freelance-platform/client-state';
import { USER_ROLE_LABEL } from '@freelance-platform/shared-types';
import {
  UiFooterComponent,
  UiHeaderComponent,
  UiHeaderMode,
  UiPageWrapperComponent,
} from '@freelance-platform/ui';

@Component({
  selector: 'app-welcome-page',
  imports: [UiPageWrapperComponent, UiHeaderComponent, UiFooterComponent],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePageComponent {
  private readonly authStore = inject(AuthStore);

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

  constructor() {
    this.authStore.bootstrap();
  }

  protected onLogout(): void {
    this.authStore.logout();
  }
}
