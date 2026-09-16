import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@freelance-platform/client-state';
import { UserRole } from '@freelance-platform/shared-types';
import { UiFooterComponent, UiFooterText } from '@freelance-platform/ui';

type AppFooterLinkClick = {
  readonly link: { readonly label: string; readonly href: string };
  readonly event: MouseEvent;
};

@Component({
  selector: 'app-footer',
  imports: [UiFooterComponent],
  templateUrl: './app-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFooterComponent {
  readonly homeHref = input('/welcome');

  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected onLinkClick({ link, event }: AppFooterLinkClick): void {
    if (link.label === UiFooterText.PostTask) {
      event.preventDefault();
      void this.router.navigateByUrl(this.resolvePostTaskUrl());
      return;
    }

    if (link.label === UiFooterText.SignUp) {
      event.preventDefault();
      void this.router.navigateByUrl(this.resolveSignUpUrl());
    }
  }

  private resolveSignUpUrl(): string {
    if (this.authStore.isAuthenticated()) {
      return '/tasks';
    }

    return '/register';
  }

  private resolvePostTaskUrl(): string {
    if (!this.authStore.isAuthenticated()) {
      return '/login';
    }

    const user = this.authStore.user();

    if (!user) {
      return '/login';
    }

    if (user.role === UserRole.Client) {
      return '/tasks/create';
    }

    return '/analytics';
  }
}
