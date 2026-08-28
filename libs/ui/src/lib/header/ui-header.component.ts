import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  UiHeaderMode,
  UiHeaderText,
  UiHeaderUser,
  UiHeaderModeType,
} from './ui-header-mode';

@Component({
  selector: 'ui-header',
  templateUrl: './ui-header.component.html',
  styleUrl: './ui-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiHeaderComponent {
  readonly mode = input<UiHeaderModeType>(UiHeaderMode.Guest);
  readonly brandName = input('TaskFlow');
  readonly pageTitle = input('');
  readonly userName = input<string>(UiHeaderUser.Name);
  readonly userRole = input<string>(UiHeaderUser.Role);
  readonly userInitial = input('');

  readonly showBrand = input(true);
  readonly embedded = input(false);

  readonly homeHref = input('#');
  readonly browseTasksHref = input('#');
  readonly loginHref = input('#');
  readonly getStartedHref = input('#');

  readonly homeClick = output<MouseEvent>();
  readonly browseTasksClick = output<MouseEvent>();
  readonly loginClick = output<MouseEvent>();
  readonly getStartedClick = output<MouseEvent>();
  readonly themeToggleClick = output<MouseEvent>();
  readonly notificationsClick = output<MouseEvent>();
  readonly userMenuClick = output<MouseEvent>();
  readonly logoutClick = output<MouseEvent>();

  protected readonly headerText = UiHeaderText;

  protected readonly isAuthenticated = computed(
    () => this.mode() === UiHeaderMode.Authenticated,
  );

  protected readonly avatarInitial = computed(() => {
    const explicit = this.userInitial().trim();
    if (explicit) {
      return explicit.charAt(0).toUpperCase();
    }

    const name = this.userName().trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  });
}
