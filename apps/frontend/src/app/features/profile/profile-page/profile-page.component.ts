import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthStore } from '@freelance-platform/client-state';
import { USER_ROLE_LABEL } from '@freelance-platform/shared-types';
import { formatTaskDate, formatUserName } from '../../../format';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { ProfilePageContainerComponent } from '../profile-page-container/profile-page-container.component';
import { ProfileStatisticsComponent } from '../profile-statistics/profile-statistics.component';

type ProfileViewModel = {
  readonly displayName: string;
  readonly email: string;
  readonly roleLabel: string;
  readonly registrationLabel: string;
};

@Component({
  selector: 'app-profile-page',
  imports: [
    UiDashboardWrapperComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
    ProfileCardComponent,
    ProfilePageContainerComponent,
    ProfileStatisticsComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly authStore = inject(AuthStore);

  protected readonly profile = computed<ProfileViewModel>(() => {
    const user = this.authStore.user();

    if (!user) {
      return {
        displayName: 'Имя не указано',
        email: 'Email не указан',
        roleLabel: 'Роль не указана',
        registrationLabel: 'Дата регистрации не указана',
      };
    }

    const registrationDate = new Date(user.createdAt);
    const hasValidRegistrationDate = !Number.isNaN(registrationDate.getTime());

    return {
      displayName: formatUserName(user) || 'Имя не указано',
      email: user.email || 'Email не указан',
      roleLabel: USER_ROLE_LABEL[user.role],
      registrationLabel: hasValidRegistrationDate
        ? `На платформе с ${formatTaskDate(user.createdAt)}`
        : 'Дата регистрации не указана',
    };
  });
}
