import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserApi } from '@freelance-platform/client-api';
import { AuthStore } from '@freelance-platform/client-state';
import { resolveHttpErrorMessage } from '@freelance-platform/http';
import { UserResponse } from '@freelance-platform/shared-types';
import { UiDashboardWrapperComponent } from '@freelance-platform/ui';
import { AppHeaderComponent } from '../../../app-header/app-header.component';
import { DashboardSidebarComponent } from '../../../dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { ProfileEditFormComponent } from '../profile-edit-form/profile-edit-form.component';
import { ProfileCardComponent } from '../profile-card/profile-card.component';
import { ProfilePageContainerComponent } from '../profile-page-container/profile-page-container.component';
import { ProfileStatisticsComponent } from '../profile-statistics/profile-statistics.component';
import { ProfilePageView, toProfileCardView } from './profile-page.model';

const PROFILE_LOAD_ERROR = 'Не удалось загрузить профиль';

@Component({
  selector: 'app-profile-page',
  imports: [
    UiDashboardWrapperComponent,
    AppHeaderComponent,
    DashboardSidebarComponent,
    ProfileCardComponent,
    ProfileEditFormComponent,
    ProfilePageContainerComponent,
    ProfileStatisticsComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly userApi = inject(UserApi);
  private readonly destroyRef = inject(DestroyRef);
  private requestId = 0;

  protected readonly profileUser = signal<UserResponse | null>(null);
  protected readonly isEditing = signal(false);

  protected readonly profilePageView = ProfilePageView;
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly profile = computed(() => {
    const user = this.profileUser();

    return user ? toProfileCardView(user) : null;
  });

  protected readonly view = computed(() => {
    if (this.isLoading()) {
      return ProfilePageView.Loading;
    }

    if (this.errorMessage() || !this.profileUser()) {
      return ProfilePageView.Error;
    }

    return ProfilePageView.Content;
  });

  constructor() {
    this.loadProfile(this.authStore.user()?.id ?? null);
  }

  protected onEdit(): void {
    this.isEditing.set(true);
  }

  protected onEditCancelled(): void {
    this.isEditing.set(false);
  }

  protected onProfileSaved(user: UserResponse): void {
    this.profileUser.set(user);
    this.authStore.setUser(user);
    this.isEditing.set(false);
  }

  private loadProfile(userId: string | null): void {
    const request = ++this.requestId;

    if (!userId) {
      this.profileUser.set(null);
      this.isLoading.set(false);
      this.errorMessage.set(PROFILE_LOAD_ERROR);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userApi
      .findOne(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (request !== this.requestId) {
            return;
          }

          this.profileUser.set(user);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          if (request !== this.requestId) {
            return;
          }

          this.profileUser.set(null);
          this.isLoading.set(false);
          this.errorMessage.set(resolveHttpErrorMessage(error, PROFILE_LOAD_ERROR));
        },
      });
  }
}
